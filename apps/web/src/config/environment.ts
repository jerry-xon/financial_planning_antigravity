/// <reference types="vite/client" />

/**
 * Dev vs live staging helpers for the Vite web app.
 *
 * - In Expo/React Native you’d use __DEV__ and EXPO_PUBLIC_APP_STAGE.
 * - Here: `import.meta.env.DEV` is true for `vite dev`, and `VITE_APP_STAGE`
 *   is set in CI (`dev` | `staging` | `prod`).
 */

const APP_STAGE = import.meta.env.VITE_APP_STAGE ?? ''

/** Local `vite dev`, explicit stage `dev`, or Vite’s DEV flag */
export const IS_DEV =
  import.meta.env.DEV || APP_STAGE === 'dev'

/** Everything we treat as shipped / non-local-dev */
export const IS_LIVE = !IS_DEV

export const APP_STAGE_VALUE = APP_STAGE

/** Pre-production deploy from `staging` branch (CI sets VITE_APP_STAGE=staging) */
export const IS_STAGING = APP_STAGE === 'staging'

/** Show staging-only UI (e.g. copy Supabase user id). Hidden on prod builds. */
export const SHOW_STAGING_USER_ID_TOOL = IS_STAGING
