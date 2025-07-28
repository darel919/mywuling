import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Initialize auth on app startup
  if (typeof window !== 'undefined') {
    authStore.initAuth()
  }
})