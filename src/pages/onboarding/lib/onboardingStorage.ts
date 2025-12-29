const ONBOARDING_KEY = 'ONBOARDING_COMPLETED'
const ONBOARDING_PROGRESS_KEY = 'ONBOARDING_PROGRESS'

export const hasCompletedOnboarding = (): boolean => {
  const value = localStorage.getItem(ONBOARDING_KEY)
  return value === 'true'
}

export const markOnboardingComplete = (): void => {
  localStorage.setItem(ONBOARDING_KEY, 'true')
  localStorage.removeItem(ONBOARDING_PROGRESS_KEY)
}

export const saveOnboardingProgress = (step: number): void => {
  localStorage.setItem(ONBOARDING_PROGRESS_KEY, String(step))
}

export const getOnboardingProgress = (): number => {
  const value = localStorage.getItem(ONBOARDING_PROGRESS_KEY)
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const resetOnboarding = (): void => {
  localStorage.removeItem(ONBOARDING_KEY)
  localStorage.removeItem(ONBOARDING_PROGRESS_KEY)
}
