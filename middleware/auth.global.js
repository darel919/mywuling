import { useAuthStore } from '~/stores/auth'
import { nextTick } from 'vue'

export default defineNuxtRouteMiddleware(async (to) => {
  // Only run auth logic on client
  if (typeof window === 'undefined') return

  const authStore = useAuthStore()
  const publicPaths = ['/auth/login', '/about']

  // Always initialize authStore on navigation
  if (typeof authStore.initAuth === 'function') {
    authStore.initAuth()
  }

  // Wait for isLoading to become false
  let waited = 0
  while (authStore.isLoading && waited < 2000) {
    await nextTick()
    await new Promise(r => setTimeout(r, 10))
    waited += 10
  }

  // Only redirect if there is no jwt at all
  if (!authStore.jwt && !publicPaths.includes(to.path)) {
    return window.location.href = '/auth/login'
  }
})
