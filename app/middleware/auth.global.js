import { useAuthStore } from '~/stores/auth'
import { nextTick } from 'vue'

export default defineNuxtRouteMiddleware(async (to) => {
  // Only run auth logic on client
  if (typeof window === 'undefined') return

  const authStore = useAuthStore()
  // Allow /auth/loginWithWulingID and its children as public
  const publicPaths = ['/auth/login', '/auth', '/about', '/auth/loginWithWulingID', '/account/bindDWS']

  // Support subroutes (e.g. /auth/loginWithWulingID/anything)
  const isPublic = publicPaths.some(path => to.path === path || to.path.startsWith(path + '/'))
  
  // Only initialize auth once - on first page load
  if (!authStore.initialized) {
    authStore.initAuth()
  }

  // Wait for isLoading to become false (hydration)
  let waited = 0
  while (authStore.isLoading && waited < 4000) {
    await nextTick()
    await new Promise(r => setTimeout(r, 10))
    waited += 10
  }

  // Recompute isDwsAuthed after hydration
  const isDwsAuthed = authStore.authType === 'dws' && !!authStore.userData

  // Handle DWS users who need to bind their account
  if (authStore.needsBinding && authStore.authType === 'dws' && to.path !== '/account/bindDWS') {
    try {
      // Prevent redirect loops by only redirecting once per session.
      // This flag is cleared by the bind page after a successful bind.
      if (typeof window !== 'undefined') {
        const alreadyRedirected = sessionStorage.getItem('bindRedirected') === 'true'
        if (!alreadyRedirected) {
          sessionStorage.setItem('bindRedirected', 'true')
          return navigateTo('/account/bindDWS')
        }
      }
    } catch (e) {
      // Fail silently and avoid blocking navigation
    }
  }

  // Redirect authenticated users away from /auth/login
  if ((authStore.isAuthenticated || isDwsAuthed) && to.path === '/auth/login') {
    return navigateTo('/')
  }

  // Only redirect if there is no jwt at all and not a DWS user
  if (!authStore.isAuthenticated && !isDwsAuthed && !isPublic) {
    return navigateTo('/auth/login')
  }
})
