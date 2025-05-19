import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    jwt: null,
    userData: null,
    isLoading: true,
  }),
  actions: {
    setAuth(jwt, userData) {
      this.jwt = jwt
      this.userData = userData
      localStorage.setItem('jwt', jwt)
      this.isLoading = false
    },
    clearAuth() {
      this.jwt = null
      this.userData = null
      localStorage.removeItem('jwt')
      this.isLoading = false
    },
    initAuth() {
      const jwt = localStorage.getItem('jwt')
      if (jwt) {
        this.jwt = jwt
        this.fetchUserData().finally(() => {
          this.isLoading = false
        })
      } else {
        this.isLoading = false
      }
    },
    async fetchUserData() {
      try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.BASE_API_URL}/account`, {
          headers: {
            'Authorization': `${this.jwt}`
          }
        })
        
        if (!response.ok) {
          this.clearAuth()
          throw new Error('Invalid token')
        }
        
        const data = await response.json()
        this.userData = data
        return data
      } catch (error) {
        this.clearAuth()
        throw error
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.jwt
  }
})