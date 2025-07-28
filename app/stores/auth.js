
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    jwt: null,
    userData: null,
    authType: null,
    needsBinding: false,
    isLoading: true,
    initialized: false,
  }),
  actions: {
    setAuth(jwt, userData, authType = 'dws') {
      this.jwt = jwt
      this.userData = userData
      this.authType = authType
      this.needsBinding = false
      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt', jwt)
        localStorage.setItem('userData', JSON.stringify(userData))
        localStorage.setItem('authType', authType)
      }
      this.isLoading = false
    },
    clearAuth() {
      this.jwt = null
      this.userData = null
      this.authType = null
      this.needsBinding = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt')
        localStorage.removeItem('userData')
        localStorage.removeItem('authType')
      }
      this.isLoading = false
    },
    initAuth() {
      console.log('Auth - initAuth called')
      let jwt = null
      let userData = null
      let authType = null
      if (typeof window !== 'undefined') {
        jwt = localStorage.getItem('jwt')
        authType = localStorage.getItem('authType')
        const storedUserData = localStorage.getItem('userData')
        console.log('Auth - localStorage data:', {
          jwt: !!jwt,
          authType,
          storedUserData: !!storedUserData
        })
        if (storedUserData) {
          try {
            userData = JSON.parse(storedUserData)
            console.log('Auth - parsed userData:', !!userData)
          } catch {}
        }
      }
      if (jwt && userData) {
        console.log('Auth - Setting auth data')
        this.jwt = jwt
        this.userData = userData
        // Fix authType - if userData has DWS structure, ensure authType is 'dws'
        if (authType === 'wuling.id' && userData.avatar && !userData.userName) {
          // This looks like DWS data, fix the authType
          this.authType = 'dws'
          if (typeof window !== 'undefined') {
            localStorage.setItem('authType', 'dws')
          }
        } else {
          this.authType = authType || 'dws'
        }
        
        // Set loading to false immediately if we have valid data
        this.isLoading = false
        this.initialized = true
        
        console.log('Auth - Auth initialized:', {
          jwt: !!this.jwt,
          userData: !!this.userData,
          authType: this.authType,
          isAuthenticated: this.isAuthenticated
        })
        
        this.fetchUserData().catch((error) => {
          // Handle binding errors for DWS users without clearing auth
          if (error.message === 'NEEDS_BINDING' && this.authType === 'dws') {
            // User needs to bind but stays authenticated
            this.needsBinding = true
          }
        })
      } else {
        console.log('Auth - No valid auth data found')
        this.jwt = null
        this.userData = null
        this.authType = null
        this.isLoading = false
        this.initialized = true
      }
    },
    async fetchUserData() {
      try {
        const config = useRuntimeConfig()
        
        // For wuling.id users, we already have the JWT and don't need to fetch from DWS
        if (this.authType === 'wuling.id') {
          // JWT is already valid from Wuling.id login, just return existing userData
          return this.userData
        }
        
        // For DWS users, we need to get JWT from the backend using intent "dws"
        if (this.authType === 'dws') {
          let userId = null
          if (typeof window !== 'undefined') {
            userId = localStorage.getItem('userId')
          }
          // If userId is not found, try to extract from userData (schema)
          if (!userId) {
            let userData = this.userData
            if (!userData && typeof window !== 'undefined') {
              const storedUserData = localStorage.getItem('userData')
              if (storedUserData) {
                try {
                  userData = JSON.parse(storedUserData)
                } catch {}
              }
            }
            if (userData && userData.id) {
              userId = userData.id
              if (typeof window !== 'undefined') {
                localStorage.setItem('userId', userId)
              }
            } else {
              throw new Error('No user id found for DWS user')
            }
          }
          
          const response = await fetch(`${config.public.BASE_API_URL}/account/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: 'dws', id: userId })
          })
          if (!response.ok) {
            try {
              const errorData = await response.json()
              if (errorData && errorData.error === 'Rebind needed') {
                // Don't clear auth for DWS users who need to bind - let them stay authenticated
                // but redirect to bind page
                throw new Error('NEEDS_BINDING')
              }
            } catch (jsonError) {
              if (jsonError.message === 'NEEDS_BINDING') {
                throw jsonError
              }
            }
            throw new Error('Failed to fetch JWT from DWS backend')
          }
          const data = await response.json()
          this.jwt = data.jwt
          // DO NOT replace userData - keep the original DWS userData from /verify
          // this.userData = data.userData || this.userData
          if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', this.jwt)
            // Keep existing userData, don't overwrite it
            localStorage.setItem('userData', JSON.stringify(this.userData))
          }
          return this.userData
        } else {
          // Fallback for unknown auth types
          return this.userData
        }
      } catch (error) {
        if (error.message === 'NEEDS_BINDING') {
          // Don't clear auth for binding issues
          throw error
        }
        this.clearAuth()
        throw error
      }
    },
    isJwtValid() {
      if (!this.jwt) return false
      try {
        const payload = JSON.parse(atob(this.jwt.split('.')[1]))
        const currentTime = Math.floor(Date.now() / 1000)
        return payload.exp > currentTime
      } catch {
        return false
      }
    },
    handleJwtExpired() {
      if (this.authType === 'wuling.id') {
        // For Wuling.id users, clear auth and redirect to re-bind
        this.clearAuth()
        this.needsBinding = true
        if (typeof window !== 'undefined') {
          window.location.href = '/account/bindDWS'
        }
      } else {
        // For DWS users, try to refresh JWT
        this.fetchUserData().catch(() => {
          this.needsBinding = true
        })
      }
    },
  },
  getters: {
    isAuthenticated: (state) => {
      return !!state.jwt && !!state.userData && !state.needsBinding
    },
  },
  persist: {
    paths: ['jwt', 'userData', 'authType', 'needsBinding']
  }
})