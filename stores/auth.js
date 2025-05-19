import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    jwt: null,
    userData: null,
  }),
  actions: {
    setAuth(jwt, userData) {
      this.jwt = jwt
      this.userData = userData
      localStorage.setItem('jwt', jwt)
    },
    clearAuth() {
      this.jwt = null
      this.userData = null
      localStorage.removeItem('jwt')
    },
    initAuth() {
      const jwt = localStorage.getItem('jwt')
      if (jwt) {
        this.jwt = jwt
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.jwt
  }
})