import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveOnboardingProgress, markOnboardingComplete } from './onboardingStorage'
import { getRootPath } from '@/shared/lib/routePaths'

const TOTAL_STEPS = 5

export const useOnboardingState = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<number>(0)

  const handleNext = useCallback(() => {
    const nextStep = currentStep + 1

    if (nextStep >= TOTAL_STEPS) {
      markOnboardingComplete()
      navigate(getRootPath(), { replace: true })
      return
    }

    setCurrentStep(nextStep)
    saveOnboardingProgress(nextStep)
  }, [currentStep, navigate])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      saveOnboardingProgress(prevStep)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    markOnboardingComplete()
    navigate(getRootPath(), { replace: true })
  }, [navigate])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    handleNext,
    handleBack,
    handleSkip,
    canGoBack: currentStep > 0,
    isLastStep: currentStep === TOTAL_STEPS - 1,
  }
}
