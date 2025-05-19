export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()
  const authStore = useAuthStore()
  
  authStore.initAuth()

  router.beforeEach((to, from) => {
    if (!authStore.isAuthenticated && to.path !== '/auth/login') {
      return navigateTo('/auth/login')
    }
  })
})