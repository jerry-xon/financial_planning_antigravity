import { invokeEdgeFunction, useEdgeApi } from './edgeApiClient';
import {
  getActivePlan as getActivePlanDirect,
  createFinancialPlan as createFinancialPlanDirect,
  updateFinancialPlan as updateFinancialPlanDirect,
  markSummaryReportGenerated as markSummaryReportGeneratedDirect,
  deleteFinancialPlan as deleteFinancialPlanDirect,
} from './financialPlanService';

/**
 * Plan CRUD via plan-api Edge Function (with direct PostgREST fallback).
 * Same return shape as financialPlanService: { data, error }.
 */

const wrap = async (fn) => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    console.error('[planApi]', error);
    return { data: null, error };
  }
};

export const getActivePlan = async () => {
  if (!useEdgeApi()) return getActivePlanDirect();
  return wrap(async () => {
    const result = await invokeEdgeFunction('plan-api', { action: 'get_active' });
    return result.data;
  });
};

export const createFinancialPlan = async (planName = 'My Financial Plan') => {
  if (!useEdgeApi()) return createFinancialPlanDirect(planName);
  return wrap(async () => {
    const result = await invokeEdgeFunction('plan-api', { action: 'create', planName });
    return result.data;
  });
};

export const updateFinancialPlan = async (planId, updates) => {
  if (!useEdgeApi()) return updateFinancialPlanDirect(planId, updates);
  return wrap(async () => {
    const result = await invokeEdgeFunction('plan-api', {
      action: 'update',
      planId,
      updates,
    });
    return result.data;
  });
};

export const markSummaryReportGenerated = async (planId) => {
  if (!useEdgeApi()) return markSummaryReportGeneratedDirect(planId);
  return wrap(async () => {
    const result = await invokeEdgeFunction('plan-api', {
      action: 'mark_summary_generated',
      planId,
    });
    return result.data;
  });
};

export const deleteFinancialPlan = async (planId) => {
  if (!useEdgeApi()) return deleteFinancialPlanDirect(planId);
  return wrap(async () => {
    await invokeEdgeFunction('plan-api', { action: 'delete', planId });
    return null;
  });
};

// Re-export profile helpers that still use direct PostgREST (unchanged for Step 1)
export {
  getUserProfile,
  updateUserProfile,
  subscribeToPlanChanges,
  upsertMonthlyReadinessSnapshot,
  getReadinessSnapshotsByPlan,
  updateModule,
  updateCurrentStep,
} from './financialPlanService';
