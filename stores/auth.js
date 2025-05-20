import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {  state: () => ({
    jwt: null,
    userData: null,
    wulingUserData: null, // Separate state for Wuling.id user data
    isLoading: true,
    authType: null, // 'dws' or 'wuling.id'
    initialized: false, // Track if auth has been initialized
  }),
  actions: {
    setAuth(jwt, userData, authType = 'dws') {
      if (authType === 'dws') {
        this.jwt = null
        this.userData = userData
        this.wulingUserData = null
      } else {
        this.jwt = jwt
        this.wulingUserData = userData
        this.userData = null
      }
      this.authType = authType
      if (typeof window !== 'undefined') {
        // Do not store jwt in localStorage
        localStorage.removeItem('jwt')
        localStorage.setItem('authType', authType)
        if (userData) {
          localStorage.setItem('userData', JSON.stringify(userData))
        }
      }
      this.isLoading = false
    },    
    clearAuth() {
      console.warn('Clear auth called!')
      this.jwt = null
      this.userData = null
      this.wulingUserData = null
      this.authType = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt')
        localStorage.removeItem('authType')
        localStorage.removeItem('userData')
      }
      this.isLoading = false
    },
    initAuth() {
      let authType = null
      let userData = null
      if (typeof window !== 'undefined') {
        authType = localStorage.getItem('authType')
        const storedUserData = localStorage.getItem('userData')
        if (storedUserData) {
          try {
            userData = JSON.parse(storedUserData)
          } catch {}
        }
      }
      // If DWS session is present, restore and validate
      if (authType === 'dws' && userData) {
        this.jwt = null
        this.authType = 'dws'
        this.userData = userData
        this.wulingUserData = null
        // Always check DWS backend for validity
        this.fetchUserData().finally(() => {
          this.isLoading = false
          this.initialized = true
        })
      } else if (authType === 'dws') {
        // DWS type but no userData, just reset state without clearing storage
        this.jwt = null
        this.authType = null
        this.userData = null
        this.wulingUserData = null
        this.isLoading = false
        this.initialized = true
      } else if (authType === 'wuling.id') {
        // For wuling.id, don't restore state but don't clear storage
        this.jwt = null
        this.authType = null
        this.userData = null
        this.wulingUserData = null
        this.isLoading = false
        this.initialized = true
      } else {
        // No stored auth type
        this.jwt = null
        this.authType = null
        this.userData = null
        this.wulingUserData = null
        this.isLoading = false
        this.initialized = true
      }
    },
    async fetchUserData() {
      try {
        const config = useRuntimeConfig()
        let response
        let data

        if (this.authType === 'dws') {
          response = await fetch(`${config.public.API_DARELISME_URL}/dws/user?loginWithCookies=true`, {
            credentials: 'include'
          })
          if (!response.ok) {
            console.warn('Invalid DWS token.')
            this.clearAuth()
            throw new Error('Invalid token')
          }
          data = await response.json()
          this.userData = data
          if (typeof window !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(data))
          }

          const providerId = data?.data?.user?.user_metadata?.provider_id
          if (providerId) {
            // Try to get JWT from backend
            const jwtResp = await fetch(`${config.public.BASE_API_URL}/account/jwtFromDWS?id=${encodeURIComponent(providerId)}`)
            if (jwtResp.ok) {
              let jwt = await jwtResp.text()
              jwt = jwt.replace(/^"|"$/g, '')
              if (jwt) {
                try {
                  // Validate JWT by using fetchWulingUserdata with 'dws' flow type
                  await this.fetchWulingUserdata(jwt, 'dws')
                  // JWT is valid, treat as already bound
                  return data
                } catch {
                  // JWT validation failed
                  this.wulingUserData = null
                }
              }
            }
            
            // If we reach here, DWS is valid but not bound
            // Handle the redirect here instead of relying on middleware
            if (process.client) {
              const router = useRouter()
              router.push('/account/bindDWS')
            }
            return data
          }          // If no providerId, just return DWS data and redirect
          if (process.client) {
            const router = useRouter()
            router.push('/')
          }
          return data
        } else if (this.authType === 'wuling.id' && this.jwt) {
          // For Wuling.id auth type, fetch and return Wuling user data
          return await this.fetchWulingUserdata(this.jwt, 'wuling.id')
        } else {
          // No valid session
          this.clearAuth()
          throw new Error('No valid session')
        }      } catch (error) {
        // Always clear auth on error for both DWS and Wuling.id
        this.clearAuth()
        throw error
      }
    },
    async fetchWulingUserdata(jwt, flowType) {
      if(!jwt) {
        console.warn('No Wuling.id JWT provided.')
        this.clearAuth()
        throw new Error('No Wuling.id JWT provided')
      }

      if(!flowType || !['dws', 'wuling.id'].includes(flowType)) {
        throw new Error('Invalid flow type. Must be either "dws" or "wuling.id"')
      }

      try {
        const config = useRuntimeConfig()
        let response
        let data
        response = await fetch(`${config.public.BASE_API_URL}/account`, {
          headers: {
            'Authorization': jwt
          }
        })
        if (!response.ok) {
          console.warn('Invalid wuling.id token.')
          this.clearAuth()
          throw new Error('Invalid token')
        }
        data = await response.json()
        // console.log('Fetched Wuling user data:', data)
        
        // Store data based on flow type
        if (flowType === 'dws') {
          // Store in wulingUserData for DWS flow
          this.wulingUserData = data
          this.jwt= jwt
        } else if (flowType === 'wuling.id') {
          // Store in userData for Wuling.id flow
          this.userData = data
          this.jwt= jwt
        }
        
        return data
      } catch (error) {
        console.error('Error fetching Wuling user data:', error)
        throw error
      }
    },
    async bindWulingIdToDws({ providerId, jwt }) {
      // POST to bind Wuling.id to DWS
      const config = useRuntimeConfig()
      const resp = await fetch(`${config.public.BASE_API_URL}/account/bindFromDWS`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: providerId, jwt })
      })
      const data = await resp.json()
      // Do NOT set this.jwt or this.authType here. Only update userData if needed.
      return data
    },
    async unbindWulingIdFromDws(providerId) {
      // DELETE to unbind Wuling.id from DWS
      const config = useRuntimeConfig()
      await fetch(`${config.public.BASE_API_URL}/account/bindFromDWS?uuid=${encodeURIComponent(providerId)}`, {
        method: 'DELETE'
      })
      this.jwt = null
      this.authType = 'dws'
      console.warn('JWT invalid, unbinding Wuling.id from DWS')
      localStorage.setItem('authType', 'dws')
    },

    // Only set authType to 'wuling.id' and set this.jwt when logging in with Wuling.id
    async loginWithWulingId({ email, password }) {
      const config = useRuntimeConfig()
      const resp = await fetch(`${config.public.BASE_API_URL}/account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })
      if (!resp.ok) throw new Error('Invalid Wuling.id credentials')
      const data = await resp.json()
      const jwt = data.jwt
      this.jwt = jwt
      
      // Fetch and set Wuling user data with 'wuling.id' flow type
      const wulingData = await this.fetchWulingUserdata(jwt, 'wuling.id')
      this.authType = 'wuling.id'
      localStorage.setItem('authType', 'wuling.id')
      return wulingData
    },

  },
  getters: {
    // Authenticated if Wuling.id JWT is present, or DWS session is present
    isAuthenticated: (state) => {
      return !!state.jwt || (state.authType === 'dws' && !!state.userData)
    },
    isBindOK: (state) => {
      if(state.authType && state.jwt ) {
        return true
      } else {
        return false
      }
      
    }
  },  persist: {
    paths: ['jwt', 'userData', 'wulingUserData', 'authType']
  }
})