import { supabase } from '../lib/supabase';

/**
 * Financial Plan API Service
 * Handles all database operations for financial planning data
 */

// Get active financial plan for current user
export const getActivePlan = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('financial_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching plan from DB:', error);
      throw error;
    }
    
    const plan = data && data.length > 0 ? data[0] : null;

    // If no plan exists, create one
    if (!plan) {
      console.log('No existing plan found, creating new plan...');
      return await createFinancialPlan();
    }

    console.log('Plan loaded successfully:', plan.id);
    return { data: plan, error: null };
  } catch (error) {
    console.error('Error getting active plan:', error);
    return { data: null, error };
  }
};

// Create a new financial plan
export const createFinancialPlan = async (planName = 'My Financial Plan') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('financial_plans')
      .insert([
        {
          user_id: user.id,
          plan_name: planName,
          current_step: 1,
          family_members: [
            {
              name: '',
              dob: '',
              occupation: '',
              retirementAge: 60,
              relation: 'Self',
              natureOfBusiness: '',
              organizationName: '',
              educationalQualification: '',
            }
          ],
          income: {
            self: '',
            spouse: '',
            bonus: '',
            passive: '',
            other: ''
          },
          expense_categories: {
            household: { grocery: '', rent: '', education: '', lifestyle: '', medical: '', travel: '' },
            emi: { personalLoan: '', homeLoan: '', educationLoan: '', carLoan: '', twoWheelerLoan: '', otherEmi: '', healthInsurance: '', carInsurance: '', bikeInsurance: '', otherInsurance: '' },
            savings: { rd: '', fd: '', lifeInsurance: '', ppf: '', savingSchemes: '', mfSip: '', otherSaving: '' }
          },
          asset_categories: {
            equity: { stocks: '', mfEquity: '' },
            debt: { ppf: '', fd: '' },
            realEstate: { residence: '', investmentProp: '' },
            others: { gold: '', others: '' }
          },
          liability_categories: {
            loans: { home: '', car: '', other: '' }
          },
          goals: [],
          policies: [],
          contingency_fund: 0,
          inflation_rates: {
            incomeIncrement: 10,
            householdInflation: 6,
            educationInflation: 8
          },
          journey_adjustments: [],
          investment_allocations: [],
          loan_proposals: [],
          allocation_plans: {},
          goal_mappings: {},
          insurance_mode: null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating financial plan:', error);
    return { data: null, error };
  }
};

// Update financial plan
export const updateFinancialPlan = async (planId, updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('financial_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating financial plan:', error);
    return { data: null, error };
  }
};

// Update specific module data
export const updateModule = async (planId, moduleName, moduleData) => {
  try {
    const updates = {
      [moduleName]: moduleData
    };
    return await updateFinancialPlan(planId, updates);
  } catch (error) {
    console.error(`Error updating ${moduleName}:`, error);
    return { data: null, error };
  }
};

// Update current step
export const updateCurrentStep = async (planId, step) => {
  try {
    return await updateFinancialPlan(planId, { current_step: step });
  } catch (error) {
    console.error('Error updating current step:', error);
    return { data: null, error };
  }
};

// Delete financial plan
export const deleteFinancialPlan = async (planId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('financial_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting financial plan:', error);
    return { error };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { data: null, error };
  }
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
};

// Real-time subscription to financial plan changes
export const subscribeToPlanChanges = (planId, callback) => {
  const channel = supabase
    .channel(`financial_plan_${planId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'financial_plans',
        filter: `id=eq.${planId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
