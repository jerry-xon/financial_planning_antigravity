/**
 * partner-api — B2B partner portal backend.
 * Auth via getUser(); service-role for Auth Admin + ledger writes.
 * verify_jwt = false at gateway (ES256).
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors } from '../_shared/cors.ts';
import { json, readJsonBody } from '../_shared/http.ts';
import { requireUser } from '../_shared/auth.ts';
import {
  clientReportEmailHtml,
  partnerInviteEmailHtml,
  randomTempPassword,
  sendCredentialEmail,
} from '../_shared/partnerEmail.ts';
import { buildPartnerReportSections } from '../_shared/partnerReport.ts';

const SEAT_SINGLE_INR = 250;
const SEAT_PACK_INR = 2000;
const SEAT_PACK_COUNT = 5;
const SIGNUP_BONUS_SEATS = 5;

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getSeatBalance(admin: ReturnType<typeof adminClient>, partnerId: string) {
  const { data } = await admin
    .from('partner_seat_balance')
    .select('seats_remaining, seats_earned, seats_used')
    .eq('partner_id', partnerId)
    .maybeSingle();
  return {
    seats_remaining: data?.seats_remaining ?? 0,
    seats_earned: data?.seats_earned ?? 0,
    seats_used: data?.seats_used ?? 0,
  };
}

async function assertPartner(admin: ReturnType<typeof adminClient>, userId: string) {
  const { data, error } = await admin.from('partners').select('*').eq('id', userId).maybeSingle();
  if (error || !data) {
    return { ok: false as const, response: json(403, { success: false, error: 'Partner account required' }) };
  }
  if (data.status === 'disabled') {
    return { ok: false as const, response: json(403, { success: false, error: 'Partner account disabled' }) };
  }
  return { ok: true as const, partner: data };
}

async function isMasterAdmin(userClient: ReturnType<typeof createClient>, userId: string) {
  const { data } = await userClient
    .from('user_profiles')
    .select('role, admin_permissions')
    .eq('id', userId)
    .maybeSingle();
  return data?.role === 'admin';
}

function partnerLoginUrl() {
  return (Deno.env.get('PARTNER_APP_URL') || 'http://localhost:5174').replace(/\/+$/, '');
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== 'POST') return json(405, { success: false, error: 'Method not allowed' });

  const parsed = await readJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  const action = String(body.action || '').trim();
  if (!action) return json(400, { success: false, error: 'action is required' });

  const admin = adminClient();

  // ── register_partner: secret OR logged-in admin ──
  if (action === 'register_partner') {
    const registerSecret = Deno.env.get('PARTNER_REGISTER_SECRET') || '';
    const headerSecret = req.headers.get('x-partner-register-secret') || '';
    let authorized = registerSecret && headerSecret && headerSecret === registerSecret;

    if (!authorized) {
      const auth = await requireUser(req);
      if (auth.ok && (await isMasterAdmin(auth.ctx.userClient, auth.ctx.user.id))) {
        authorized = true;
      }
    }
    if (!authorized) {
      return json(403, { success: false, error: 'Not authorized to register partners' });
    }

    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.full_name || body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    const companyName = String(body.company_name || body.companyName || '').trim();
    if (!email || !fullName) {
      return json(400, { success: false, error: 'email and full_name are required' });
    }

    const tempPassword = randomTempPassword();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'agent',
        is_partner: true,
        must_change_password: true,
        company_name: companyName,
      },
    });
    if (createErr || !created.user) {
      return json(400, { success: false, error: createErr?.message || 'Failed to create partner user' });
    }

    const partnerId = created.user.id;
    const { error: partnerErr } = await admin.from('partners').insert({
      id: partnerId,
      email,
      full_name: fullName,
      phone,
      company_name: companyName,
      status: 'invited',
      must_change_password: true,
    });
    if (partnerErr) {
      await admin.auth.admin.deleteUser(partnerId);
      return json(400, { success: false, error: partnerErr.message });
    }

    await admin.from('partner_seat_ledger').insert({
      partner_id: partnerId,
      delta: SIGNUP_BONUS_SEATS,
      reason: 'signup_bonus',
      meta: { note: 'Initial 5 free client seats' },
    });

    const loginUrl = `${partnerLoginUrl()}/login`;
    const mail = await sendCredentialEmail({
      to: email,
      subject: 'Your Finbrella Partner account',
      html: partnerInviteEmailHtml({ fullName, email, tempPassword, loginUrl }),
      text: `Login: ${email}\nOne-time password: ${tempPassword}\n${loginUrl}`,
    });

    return json(200, {
      success: true,
      data: {
        partner_id: partnerId,
        email,
        seats_granted: SIGNUP_BONUS_SEATS,
        email_sent: mail.ok,
        email_error: mail.error || null,
      },
    });
  }

  // All other actions require a logged-in user
  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;
  const { user, userClient } = auth.ctx;

  try {
    switch (action) {
      case 'get_me': {
        // Partner path
        const partnerRes = await assertPartner(admin, user.id);
        if (partnerRes.ok) {
          const seats = await getSeatBalance(admin, user.id);
          return json(200, {
            success: true,
            data: {
              kind: 'partner',
              partner: partnerRes.partner,
              seats,
            },
          });
        }
        // Client path
        const { data: profile } = await userClient
          .from('user_profiles')
          .select('id, email, full_name, role, must_change_password')
          .eq('id', user.id)
          .maybeSingle();
        const { data: clientRow } = await admin
          .from('partner_clients')
          .select('id, partner_id, plan_id, email, full_name, phone, status, report_sent_at')
          .eq('client_user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
        if (!clientRow && profile?.role !== 'user') {
          return partnerRes.response;
        }
        return json(200, {
          success: true,
          data: {
            kind: 'client',
            profile,
            client: clientRow,
            must_change_password: Boolean(profile?.must_change_password),
          },
        });
      }

      case 'update_profile': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (body.full_name != null || body.fullName != null) {
          updates.full_name = String(body.full_name ?? body.fullName);
        }
        if (body.phone != null) updates.phone = String(body.phone);
        if (body.company_name != null || body.companyName != null) {
          updates.company_name = String(body.company_name ?? body.companyName);
        }
        if (body.profile && typeof body.profile === 'object') {
          updates.profile = body.profile;
        }
        const { data, error } = await admin
          .from('partners')
          .update(updates)
          .eq('id', user.id)
          .select('*')
          .single();
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data });
      }

      case 'complete_password_change': {
        const newPassword = String(body.new_password || body.newPassword || '');
        if (newPassword.length < 8) {
          return json(400, { success: false, error: 'Password must be at least 8 characters' });
        }
        const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, {
          password: newPassword,
        });
        if (pwErr) return json(400, { success: false, error: pwErr.message });

        await admin.from('partners').update({
          must_change_password: false,
          status: 'active',
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);

        await admin.from('user_profiles').update({
          must_change_password: false,
        }).eq('id', user.id);

        return json(200, { success: true, data: { ok: true } });
      }

      case 'list_clients': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const { data, error } = await admin
          .from('partner_clients')
          .select('*')
          .eq('partner_id', user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data: data || [] });
      }

      case 'create_client': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;

        const seats = await getSeatBalance(admin, user.id);
        if (seats.seats_remaining < 1) {
          return json(402, {
            success: false,
            error: 'No seats remaining',
            code: 'SEATS_EXHAUSTED',
            seats,
          });
        }

        const email = String(body.email || '').trim().toLowerCase();
        const fullName = String(body.full_name || body.fullName || '').trim();
        const phone = String(body.phone || '').trim();
        const planPayload = asObject(body.plan || body.planPayload);

        if (!email || !fullName) {
          return json(400, { success: false, error: 'email and full_name are required' });
        }

        const tempPassword = randomTempPassword();
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role: 'user',
            must_change_password: true,
            mobile: phone,
          },
        });
        if (createErr || !created.user) {
          return json(400, { success: false, error: createErr?.message || 'Failed to create client' });
        }
        const clientUserId = created.user.id;

        // Deduct seat
        await admin.from('partner_seat_ledger').insert({
          partner_id: user.id,
          delta: -1,
          reason: 'client_create',
          meta: { client_email: email },
        });

        // Attach agent_id on the auto-created plan
        const { data: plans } = await admin
          .from('financial_plans')
          .select('id')
          .eq('user_id', clientUserId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        let planId = plans?.[0]?.id as string | undefined;
        if (planId) {
          const planUpdates: Record<string, unknown> = {
            agent_id: user.id,
            updated_at: new Date().toISOString(),
          };
          // Map camelCase wizard payload → snake_case columns
          if (planPayload.familyMembers) planUpdates.family_members = planPayload.familyMembers;
          if (planPayload.income) planUpdates.income = planPayload.income;
          if (planPayload.expenseCategories) planUpdates.expense_categories = planPayload.expenseCategories;
          if (planPayload.assetCategories) planUpdates.asset_categories = planPayload.assetCategories;
          if (planPayload.liabilityCategories) planUpdates.liability_categories = planPayload.liabilityCategories;
          if (planPayload.goals) planUpdates.goals = planPayload.goals;
          if (planPayload.policies) planUpdates.policies = planPayload.policies;
          if (planPayload.contingencyFund != null) {
            planUpdates.contingency_fund = Number(planPayload.contingencyFund) || 0;
          }
          if (planPayload.inflationRates) planUpdates.inflation_rates = planPayload.inflationRates;
          if (planPayload.currentYearLedger) planUpdates.current_year_ledger = planPayload.currentYearLedger;
          if (planPayload.hasLifeInsurance != null) planUpdates.has_life_insurance = planPayload.hasLifeInsurance;
          if (planPayload.hasHealthInsurance != null) {
            planUpdates.has_health_insurance = planPayload.hasHealthInsurance;
          }
          if (planPayload.summaryLifeCover != null) {
            planUpdates.summary_life_cover = Number(planPayload.summaryLifeCover) || null;
          }
          if (planPayload.summaryHealthCover != null) {
            planUpdates.summary_health_cover = Number(planPayload.summaryHealthCover) || null;
          }

          // Seed self name/mobile into family_members if empty
          if (!planPayload.familyMembers) {
            planUpdates.family_members = [{
              name: fullName,
              dob: '',
              occupation: 'Salaried',
              retirementAge: 60,
              relation: 'Self',
              mobile: phone,
            }];
          }

          await admin.from('financial_plans').update(planUpdates).eq('id', planId);
        }

        const { data: clientRow, error: clientErr } = await admin
          .from('partner_clients')
          .insert({
            partner_id: user.id,
            client_user_id: clientUserId,
            plan_id: planId || null,
            email,
            full_name: fullName,
            phone,
            status: 'active',
            source: 'report',
          })
          .select('*')
          .single();

        if (clientErr) {
          return json(400, { success: false, error: clientErr.message });
        }

        await admin.from('user_profiles').update({
          must_change_password: true,
          full_name: fullName,
        }).eq('id', clientUserId);

        const newSeats = await getSeatBalance(admin, user.id);
        return json(200, {
          success: true,
          data: {
            client: clientRow,
            temp_password: tempPassword,
            seats: newSeats,
          },
        });
      }

      case 'update_client': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        if (!clientId) return json(400, { success: false, error: 'client_id is required' });

        const { data: existing } = await admin
          .from('partner_clients')
          .select('*')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!existing) return json(404, { success: false, error: 'Client not found' });

        const rowUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.full_name != null || body.fullName != null) {
          rowUpdates.full_name = String(body.full_name ?? body.fullName);
        }
        if (body.phone != null) rowUpdates.phone = String(body.phone);

        const { data: clientRow, error } = await admin
          .from('partner_clients')
          .update(rowUpdates)
          .eq('id', clientId)
          .select('*')
          .single();
        if (error) return json(400, { success: false, error: error.message });

        const planPayload = asObject(body.plan || body.planPayload);
        if (existing.plan_id && Object.keys(planPayload).length > 0) {
          const planUpdates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };
          if (planPayload.familyMembers) planUpdates.family_members = planPayload.familyMembers;
          if (planPayload.income) planUpdates.income = planPayload.income;
          if (planPayload.expenseCategories) planUpdates.expense_categories = planPayload.expenseCategories;
          if (planPayload.assetCategories) planUpdates.asset_categories = planPayload.assetCategories;
          if (planPayload.liabilityCategories) planUpdates.liability_categories = planPayload.liabilityCategories;
          if (planPayload.goals) planUpdates.goals = planPayload.goals;
          if (planPayload.policies) planUpdates.policies = planPayload.policies;
          if (planPayload.contingencyFund != null) {
            planUpdates.contingency_fund = Number(planPayload.contingencyFund) || 0;
          }
          if (planPayload.inflationRates) planUpdates.inflation_rates = planPayload.inflationRates;
          if (planPayload.currentYearLedger) planUpdates.current_year_ledger = planPayload.currentYearLedger;
          if (planPayload.investmentAllocations) {
            planUpdates.investment_allocations = planPayload.investmentAllocations;
          }
          if (planPayload.goalMappings) planUpdates.goal_mappings = planPayload.goalMappings;
          if (planPayload.hasLifeInsurance != null) planUpdates.has_life_insurance = planPayload.hasLifeInsurance;
          if (planPayload.hasHealthInsurance != null) {
            planUpdates.has_health_insurance = planPayload.hasHealthInsurance;
          }
          if (planPayload.summaryLifeCover != null) {
            planUpdates.summary_life_cover = Number(planPayload.summaryLifeCover) || null;
          }
          if (planPayload.summaryHealthCover != null) {
            planUpdates.summary_health_cover = Number(planPayload.summaryHealthCover) || null;
          }
          await admin.from('financial_plans').update(planUpdates).eq('id', existing.plan_id);
        }

        if (rowUpdates.full_name) {
          await admin.from('user_profiles').update({ full_name: rowUpdates.full_name }).eq('id', existing.client_user_id);
        }

        return json(200, { success: true, data: clientRow });
      }

      case 'delete_client': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        const { data: existing } = await admin
          .from('partner_clients')
          .select('*')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!existing) return json(404, { success: false, error: 'Client not found' });

        await admin.from('partner_clients').update({
          status: 'deleted',
          updated_at: new Date().toISOString(),
        }).eq('id', clientId);

        // Soft approach: disable auth user
        try {
          await admin.auth.admin.updateUserById(existing.client_user_id, { ban_duration: '876000h' });
        } catch {
          /* ignore */
        }

        return json(200, { success: true, data: { deleted: true, client_id: clientId } });
      }

      case 'get_client_plan': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        const { data: existing } = await admin
          .from('partner_clients')
          .select('*')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!existing?.plan_id) return json(404, { success: false, error: 'Client plan not found' });
        const { data: plan, error } = await admin
          .from('financial_plans')
          .select('*')
          .eq('id', existing.plan_id)
          .single();
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data: { client: existing, plan } });
      }

      case 'get_client_report':
      case 'get_my_report': {
        let planId = '';
        let hasSpouseIncome = false;

        if (action === 'get_my_report') {
          const { data: clientRow } = await admin
            .from('partner_clients')
            .select('*')
            .eq('client_user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          if (!clientRow?.plan_id) {
            return json(404, { success: false, error: 'No report available' });
          }
          planId = clientRow.plan_id;
        } else {
          const partnerRes = await assertPartner(admin, user.id);
          if (!partnerRes.ok) return partnerRes.response;
          const clientId = String(body.client_id || body.clientId || '');
          const { data: existing } = await admin
            .from('partner_clients')
            .select('*')
            .eq('id', clientId)
            .eq('partner_id', user.id)
            .maybeSingle();
          if (!existing?.plan_id) return json(404, { success: false, error: 'Client plan not found' });
          planId = existing.plan_id;
        }

        const { data: plan } = await admin.from('financial_plans').select('*').eq('id', planId).single();
        if (!plan) return json(404, { success: false, error: 'Plan not found' });

        const income = plan.income || {};
        hasSpouseIncome = Boolean(income.spouse && Number(income.spouse) > 0);

        const payload = {
          familyMembers: plan.family_members,
          income: plan.income,
          expenseCategories: plan.expense_categories,
          assetCategories: plan.asset_categories,
          liabilityCategories: plan.liability_categories,
          goals: plan.goals,
          policies: plan.policies,
          contingencyFund: plan.contingency_fund,
          inflationRates: plan.inflation_rates,
          journeyAdjustments: plan.journey_adjustments,
          investmentAllocations: plan.investment_allocations,
          loanProposals: plan.loan_proposals,
          calculatorInputs: plan.calculator_inputs,
          currentYearLedger: plan.current_year_ledger,
          planStartMonth: plan.plan_start_month,
          hasSpouseIncome,
          hasLifeInsurance: plan.has_life_insurance,
          hasHealthInsurance: plan.has_health_insurance,
          summaryLifeCover: plan.summary_life_cover,
          summaryHealthCover: plan.summary_health_cover,
          goalMappings: plan.goal_mappings,
        };

        const sections = await buildPartnerReportSections(payload);
        return json(200, { success: true, data: { planId, plan, reports: sections } });
      }

      case 'send_client_report': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        const { data: existing } = await admin
          .from('partner_clients')
          .select('*')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!existing) return json(404, { success: false, error: 'Client not found' });

        const tempPassword = randomTempPassword();
        const { error: pwErr } = await admin.auth.admin.updateUserById(existing.client_user_id, {
          password: tempPassword,
        });
        if (pwErr) return json(400, { success: false, error: pwErr.message });

        await admin.from('user_profiles').update({ must_change_password: true }).eq('id', existing.client_user_id);
        await admin.from('partner_clients').update({
          report_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', clientId);

        const loginUrl = `${partnerLoginUrl()}/login?mode=client`;
        const mail = await sendCredentialEmail({
          to: existing.email,
          subject: 'Your Finbrella financial report is ready',
          html: clientReportEmailHtml({
            fullName: existing.full_name || '',
            email: existing.email,
            tempPassword,
            loginUrl,
            partnerName: partnerRes.partner.full_name || partnerRes.partner.company_name || undefined,
          }),
          text: `Login: ${existing.email}\nPassword: ${tempPassword}\n${loginUrl}`,
        });

        return json(200, {
          success: true,
          data: { email_sent: mail.ok, email_error: mail.error || null },
        });
      }

      case 'create_seat_order': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const pack = String(body.pack || 'single'); // single | pack
        const amountInr = pack === 'pack' ? SEAT_PACK_INR : SEAT_SINGLE_INR;
        const seats = pack === 'pack' ? SEAT_PACK_COUNT : 1;

        const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
        if (!razorpayKeyId || !razorpayKeySecret) {
          return json(500, { success: false, error: 'Razorpay not configured' });
        }

        const amountPaise = Math.round(amountInr * 100);
        const authBasic = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authBasic}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            notes: {
              partner_id: user.id,
              pack,
              seats: String(seats),
              purpose: 'partner_seats',
            },
          }),
        });
        const order = await orderRes.json();
        if (!orderRes.ok) {
          return json(400, { success: false, error: order?.error?.description || 'Order failed' });
        }
        return json(200, {
          success: true,
          data: {
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: razorpayKeyId,
            pack,
            seats,
            amount_inr: amountInr,
          },
        });
      }

      case 'confirm_seat_payment': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;

        const razorpay_order_id = String(body.razorpay_order_id || '');
        const razorpay_payment_id = String(body.razorpay_payment_id || '');
        const razorpay_signature = String(body.razorpay_signature || '');
        const pack = String(body.pack || 'single');
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return json(400, { success: false, error: 'Missing payment fields' });
        }

        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
        const key = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(razorpayKeySecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign'],
        );
        const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
        const expected = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
        if (expected !== razorpay_signature) {
          return json(400, { success: false, error: 'Invalid payment signature' });
        }

        // Idempotency: skip if payment already credited
        const { data: existing } = await admin
          .from('partner_seat_ledger')
          .select('id')
          .eq('razorpay_payment_id', razorpay_payment_id)
          .maybeSingle();
        if (existing) {
          const seats = await getSeatBalance(admin, user.id);
          return json(200, { success: true, data: { seats, already_credited: true } });
        }

        const delta = pack === 'pack' ? SEAT_PACK_COUNT : 1;
        const reason = pack === 'pack' ? 'purchase_pack' : 'purchase_single';
        await admin.from('partner_seat_ledger').insert({
          partner_id: user.id,
          delta,
          reason,
          razorpay_payment_id,
          meta: { razorpay_order_id, pack },
        });

        const seats = await getSeatBalance(admin, user.id);
        return json(200, { success: true, data: { seats, seats_added: delta } });
      }

      // ── CRM: book of business ────────────────────────────────────────────
      case 'crm_dashboard': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const seats = await getSeatBalance(admin, user.id);

        const [{ data: clients }, { data: policies }, { data: renewals }, { data: holdings }, { data: activities }] =
          await Promise.all([
            admin
              .from('partner_clients')
              .select('id, full_name, email, phone, status, report_sent_at, source, created_at')
              .eq('partner_id', user.id)
              .neq('status', 'deleted')
              .order('created_at', { ascending: false }),
            admin
              .from('crm_policies')
              .select('id, client_id, category, status, total_premium, next_premium_due_date, insurer_name, policy_no')
              .eq('partner_id', user.id),
            admin
              .from('crm_renewals_due')
              .select('*')
              .eq('partner_id', user.id)
              .lte('days_until_due', 45)
              .gte('days_until_due', -15)
              .order('next_premium_due_date', { ascending: true })
              .limit(20),
            admin
              .from('crm_mf_holdings')
              .select('id, current_value, amount_invested, sip_amount, status')
              .eq('partner_id', user.id)
              .eq('status', 'Active'),
            admin
              .from('crm_activities')
              .select('id, client_id, activity_type, subject, due_at, completed_at, created_at')
              .eq('partner_id', user.id)
              .is('completed_at', null)
              .order('due_at', { ascending: true, nullsFirst: false })
              .limit(10),
          ]);

        const policyList = policies || [];
        const activePolicies = policyList.filter((p) => p.status === 'Active' || p.status === 'Grace Period');
        const premiumBook = activePolicies.reduce((sum, p) => sum + Number(p.total_premium || 0), 0);
        const byCategory: Record<string, number> = { life: 0, health: 0, motor: 0, non_motor: 0 };
        for (const p of activePolicies) {
          byCategory[p.category] = (byCategory[p.category] || 0) + 1;
        }
        const mfValue = (holdings || []).reduce((sum, h) => sum + Number(h.current_value || 0), 0);
        const mfSip = (holdings || []).reduce((sum, h) => sum + Number(h.sip_amount || 0), 0);
        const clientList = clients || [];
        const reportsSent = clientList.filter((c) => c.report_sent_at).length;

        return json(200, {
          success: true,
          data: {
            seats,
            kpis: {
              clients: clientList.length,
              reports_sent: reportsSent,
              active_policies: activePolicies.length,
              premium_book: premiumBook,
              renewals_45d: (renewals || []).filter((r) => Number(r.days_until_due) >= 0).length,
              mf_aum: mfValue,
              mf_monthly_sip: mfSip,
              open_followups: (activities || []).length,
            },
            by_category: byCategory,
            renewals: renewals || [],
            recent_clients: clientList.slice(0, 8),
            followups: activities || [],
          },
        });
      }

      case 'crm_get_client': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        if (!clientId) return json(400, { success: false, error: 'client_id is required' });

        const { data: client } = await admin
          .from('partner_clients')
          .select('*')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .neq('status', 'deleted')
          .maybeSingle();
        if (!client) return json(404, { success: false, error: 'Client not found' });

        const [{ data: policies }, { data: folios }, { data: activities }, { data: documents }] =
          await Promise.all([
            admin
              .from('crm_policies')
              .select('*, crm_life_policy_details(*), crm_health_policy_details(*), crm_motor_policy_details(*), crm_non_motor_policy_details(*)')
              .eq('partner_id', user.id)
              .eq('client_id', clientId)
              .order('created_at', { ascending: false }),
            admin
              .from('crm_mf_folios')
              .select('*, crm_mf_holdings(*)')
              .eq('partner_id', user.id)
              .eq('client_id', clientId)
              .order('created_at', { ascending: false }),
            admin
              .from('crm_activities')
              .select('*')
              .eq('partner_id', user.id)
              .eq('client_id', clientId)
              .order('created_at', { ascending: false })
              .limit(30),
            admin
              .from('crm_documents')
              .select('*')
              .eq('partner_id', user.id)
              .eq('client_id', clientId)
              .order('created_at', { ascending: false }),
          ]);

        return json(200, {
          success: true,
          data: {
            client,
            policies: policies || [],
            folios: folios || [],
            activities: activities || [],
            documents: documents || [],
          },
        });
      }

      case 'crm_update_client': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        if (!clientId) return json(400, { success: false, error: 'client_id is required' });

        const { data: existing } = await admin
          .from('partner_clients')
          .select('id')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!existing) return json(404, { success: false, error: 'Client not found' });

        const allowed = [
          'full_name', 'phone', 'gender', 'dob', 'marital_status', 'occupation',
          'address', 'pan_last4', 'source', 'notes', 'tags',
        ] as const;
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        for (const key of allowed) {
          if (body[key] !== undefined) updates[key] = body[key];
        }
        // camelCase aliases
        if (body.fullName != null) updates.full_name = String(body.fullName);
        if (body.maritalStatus != null) updates.marital_status = body.maritalStatus;
        if (body.panLast4 != null) updates.pan_last4 = body.panLast4;

        const { data, error } = await admin
          .from('partner_clients')
          .update(updates)
          .eq('id', clientId)
          .select('*')
          .single();
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data });
      }

      case 'crm_list_policies': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        let q = admin
          .from('crm_policies')
          .select('*, partner_clients!inner(full_name, email, phone)')
          .eq('partner_id', user.id)
          .order('next_premium_due_date', { ascending: true, nullsFirst: false });
        if (body.client_id || body.clientId) {
          q = q.eq('client_id', String(body.client_id || body.clientId));
        }
        if (body.category) q = q.eq('category', String(body.category));
        if (body.status) q = q.eq('status', String(body.status));
        const { data, error } = await q;
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data: data || [] });
      }

      case 'crm_list_renewals': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const withinDays = Number(body.within_days ?? body.withinDays ?? 45);
        const { data, error } = await admin
          .from('crm_renewals_due')
          .select('*')
          .eq('partner_id', user.id)
          .lte('days_until_due', withinDays)
          .order('next_premium_due_date', { ascending: true });
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data: data || [] });
      }

      case 'crm_upsert_policy': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;

        const clientId = String(body.client_id || body.clientId || '');
        const category = String(body.category || '').trim();
        const policyNo = String(body.policy_no || body.policyNo || '').trim();
        const insurerName = String(body.insurer_name || body.insurerName || '').trim();
        if (!clientId || !category || !policyNo || !insurerName) {
          return json(400, {
            success: false,
            error: 'client_id, category, policy_no, and insurer_name are required',
          });
        }

        const { data: client } = await admin
          .from('partner_clients')
          .select('id')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!client) return json(404, { success: false, error: 'Client not found' });

        const policyId = body.policy_id || body.policyId
          ? String(body.policy_id || body.policyId)
          : null;

        const row: Record<string, unknown> = {
          partner_id: user.id,
          client_id: clientId,
          category,
          sub_category: body.sub_category ?? body.subCategory ?? null,
          policy_no: policyNo,
          insurer_name: insurerName,
          plan_name: body.plan_name ?? body.planName ?? null,
          insured_name: body.insured_name ?? body.insuredName ?? null,
          policy_start_date: body.policy_start_date ?? body.policyStartDate ?? null,
          policy_end_date: body.policy_end_date ?? body.policyEndDate ?? null,
          next_premium_due_date: body.next_premium_due_date ?? body.nextPremiumDueDate ?? null,
          premium_frequency: body.premium_frequency ?? body.premiumFrequency ?? null,
          premium_amount: Number(body.premium_amount ?? body.premiumAmount ?? 0) || 0,
          gst_amount: Number(body.gst_amount ?? body.gstAmount ?? 0) || 0,
          total_premium: Number(body.total_premium ?? body.totalPremium ?? body.premium_amount ?? body.premiumAmount ?? 0) || 0,
          status: body.status || 'Active',
          payment_mode: body.payment_mode ?? body.paymentMode ?? null,
          nominee_name: body.nominee_name ?? body.nomineeName ?? null,
          nominee_relation: body.nominee_relation ?? body.nomineeRelation ?? null,
          commission_amount: Number(body.commission_amount ?? body.commissionAmount ?? 0) || 0,
          commission_status: body.commission_status ?? body.commissionStatus ?? null,
          notes: body.notes ?? null,
          details: body.details && typeof body.details === 'object' ? body.details : {},
          updated_at: new Date().toISOString(),
        };

        let saved;
        if (policyId) {
          const { data, error } = await admin
            .from('crm_policies')
            .update(row)
            .eq('id', policyId)
            .eq('partner_id', user.id)
            .select('*')
            .single();
          if (error) return json(400, { success: false, error: error.message });
          saved = data;
        } else {
          const { data, error } = await admin
            .from('crm_policies')
            .insert(row)
            .select('*')
            .single();
          if (error) return json(400, { success: false, error: error.message });
          saved = data;
        }

        const detail = asObject(body.category_details || body.categoryDetails);
        const pid = saved.id as string;
        if (category === 'life' && Object.keys(detail).length) {
          await admin.from('crm_life_policy_details').upsert({
            policy_id: pid,
            sum_assured: detail.sum_assured ?? detail.sumAssured ?? null,
            policy_term_pt: detail.policy_term_pt ?? detail.policyTermPt ?? null,
            premium_paying_term_ppt: detail.premium_paying_term_ppt ?? detail.premiumPayingTermPpt ?? null,
            plan_short_description: detail.plan_short_description ?? detail.planShortDescription ?? null,
          });
        } else if (category === 'health' && Object.keys(detail).length) {
          await admin.from('crm_health_policy_details').upsert({
            policy_id: pid,
            sum_insured: detail.sum_insured ?? detail.sumInsured ?? null,
            policy_term_pt: detail.policy_term_pt ?? detail.policyTermPt ?? null,
            members_in_policy: detail.members_in_policy ?? detail.membersInPolicy ?? [],
            ped_details: detail.ped_details ?? detail.pedDetails ?? null,
            plan_short_description: detail.plan_short_description ?? detail.planShortDescription ?? null,
          });
        } else if (category === 'motor' && Object.keys(detail).length) {
          await admin.from('crm_motor_policy_details').upsert({
            policy_id: pid,
            vehicle_no: detail.vehicle_no ?? detail.vehicleNo ?? null,
            vehicle_model: detail.vehicle_model ?? detail.vehicleModel ?? null,
            idv: detail.idv ?? null,
            od_premium: detail.od_premium ?? detail.odPremium ?? null,
            tp_premium: detail.tp_premium ?? detail.tpPremium ?? null,
            addons_opted: detail.addons_opted ?? detail.addonsOpted ?? null,
          });
        } else if (category === 'non_motor' && Object.keys(detail).length) {
          await admin.from('crm_non_motor_policy_details').upsert({
            policy_id: pid,
            product_type: detail.product_type ?? detail.productType ?? null,
            sum_insured: detail.sum_insured ?? detail.sumInsured ?? null,
            location_or_asset_details: detail.location_or_asset_details ?? detail.locationOrAssetDetails ?? null,
          });
        }

        return json(200, { success: true, data: saved });
      }

      case 'crm_delete_policy': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const policyId = String(body.policy_id || body.policyId || '');
        if (!policyId) return json(400, { success: false, error: 'policy_id is required' });
        const { error } = await admin
          .from('crm_policies')
          .delete()
          .eq('id', policyId)
          .eq('partner_id', user.id);
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data: { deleted: true } });
      }

      case 'crm_upsert_mf_folio': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        if (!clientId) return json(400, { success: false, error: 'client_id is required' });
        const { data: client } = await admin
          .from('partner_clients')
          .select('id')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!client) return json(404, { success: false, error: 'Client not found' });

        const folioId = body.folio_id || body.folioId ? String(body.folio_id || body.folioId) : null;
        const folioRow = {
          partner_id: user.id,
          client_id: clientId,
          folio_number: body.folio_number ?? body.folioNumber ?? null,
          amc_name: body.amc_name ?? body.amcName ?? null,
          investor_name: body.investor_name ?? body.investorName ?? null,
          notes: body.notes ?? null,
          updated_at: new Date().toISOString(),
        };

        let folio;
        if (folioId) {
          const { data, error } = await admin
            .from('crm_mf_folios')
            .update(folioRow)
            .eq('id', folioId)
            .eq('partner_id', user.id)
            .select('*')
            .single();
          if (error) return json(400, { success: false, error: error.message });
          folio = data;
        } else {
          const { data, error } = await admin.from('crm_mf_folios').insert(folioRow).select('*').single();
          if (error) return json(400, { success: false, error: error.message });
          folio = data;
        }

        const holdings = Array.isArray(body.holdings) ? body.holdings : [];
        for (const h of holdings) {
          const holding = asObject(h);
          const holdingId = holding.id ? String(holding.id) : null;
          const hRow = {
            folio_id: folio.id,
            partner_id: user.id,
            scheme_name: String(holding.scheme_name ?? holding.schemeName ?? ''),
            amount_invested: Number(holding.amount_invested ?? holding.amountInvested ?? 0) || 0,
            current_value: Number(holding.current_value ?? holding.currentValue ?? 0) || 0,
            units: holding.units != null ? Number(holding.units) : null,
            nav: holding.nav != null ? Number(holding.nav) : null,
            sip_amount: Number(holding.sip_amount ?? holding.sipAmount ?? 0) || 0,
            sip_day_of_month: holding.sip_day_of_month ?? holding.sipDayOfMonth ?? null,
            status: String(holding.status || 'Active'),
            updated_at: new Date().toISOString(),
          };
          if (!hRow.scheme_name) continue;
          if (holdingId) {
            await admin.from('crm_mf_holdings').update(hRow).eq('id', holdingId).eq('partner_id', user.id);
          } else {
            await admin.from('crm_mf_holdings').insert(hRow);
          }
        }

        const { data: full } = await admin
          .from('crm_mf_folios')
          .select('*, crm_mf_holdings(*)')
          .eq('id', folio.id)
          .single();
        return json(200, { success: true, data: full || folio });
      }

      case 'crm_add_activity': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const clientId = String(body.client_id || body.clientId || '');
        const activityType = String(body.activity_type || body.activityType || 'note');
        if (!clientId) return json(400, { success: false, error: 'client_id is required' });

        const { data: client } = await admin
          .from('partner_clients')
          .select('id')
          .eq('id', clientId)
          .eq('partner_id', user.id)
          .maybeSingle();
        if (!client) return json(404, { success: false, error: 'Client not found' });

        const { data, error } = await admin
          .from('crm_activities')
          .insert({
            partner_id: user.id,
            client_id: clientId,
            policy_id: body.policy_id || body.policyId || null,
            activity_type: activityType,
            subject: body.subject || null,
            body: body.body || body.notes || null,
            due_at: body.due_at || body.dueAt || null,
          })
          .select('*')
          .single();
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data });
      }

      case 'crm_complete_activity': {
        const partnerRes = await assertPartner(admin, user.id);
        if (!partnerRes.ok) return partnerRes.response;
        const activityId = String(body.activity_id || body.activityId || '');
        if (!activityId) return json(400, { success: false, error: 'activity_id is required' });
        const { data, error } = await admin
          .from('crm_activities')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', activityId)
          .eq('partner_id', user.id)
          .select('*')
          .single();
        if (error) return json(400, { success: false, error: error.message });
        return json(200, { success: true, data });
      }

      default:
        return json(400, {
          success: false,
          error: `Unknown action: ${action}`,
          allowed: [
            'register_partner',
            'get_me',
            'update_profile',
            'complete_password_change',
            'list_clients',
            'create_client',
            'update_client',
            'delete_client',
            'get_client_plan',
            'get_client_report',
            'get_my_report',
            'send_client_report',
            'create_seat_order',
            'confirm_seat_payment',
            'crm_dashboard',
            'crm_get_client',
            'crm_update_client',
            'crm_list_policies',
            'crm_list_renewals',
            'crm_upsert_policy',
            'crm_delete_policy',
            'crm_upsert_mf_folio',
            'crm_add_activity',
            'crm_complete_activity',
          ],
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'partner-api failed';
    console.error('partner-api', action, message);
    return json(500, { success: false, error: message });
  }
});
