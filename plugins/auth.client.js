export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()
  const authStore = useAuthStore()
  
  authStore.initAuth()
  router.beforeEach((to, from) => {
    // Allow access to login and about pages without authentication
    const publicPaths = ['/auth/login', '/about']
    if (!authStore.isAuthenticated && !publicPaths.includes(to.path)) {
      return navigateTo('/auth/login')
    }
  })
})