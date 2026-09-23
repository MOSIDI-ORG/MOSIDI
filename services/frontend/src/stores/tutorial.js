import { defineStore } from 'pinia'

const STORAGE_KEY = 'app_onboarding_tutorial_completed'

export const useTutorialStore = defineStore({
  id: 'tutorial',
  state: () => ({
    onboardingTutorial: false,
    onboardingCompleted: localStorage.getItem(STORAGE_KEY) === 'true',
  }),
  actions: {
    startOnboarding() {
      this.onboardingTutorial = true
    },
    endOnboarding() {
      this.onboardingTutorial = false
    },
    markOnboardingCompleted() {
      this.onboardingCompleted = true
      localStorage.setItem(STORAGE_KEY, 'true')
    },
    resetOnboardingCompleted() {
      this.onboardingCompleted = false
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})