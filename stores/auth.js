import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {  state: () => ({
    jwt: null,
    userData: null,
    wulingUserData: null,
    isLoading: true,
    authType: null,
    initialized: false,
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
      if (authType === 'dws' && userData) {
        this.jwt = null
        this.authType = 'dws'
        this.userData = userData
        this.wulingUserData = null
        this.fetchUserData().finally(() => {
          this.isLoading = false
          this.initialized = true
        })
      } else if (authType === 'dws') {
        this.jwt = null
        this.authType = null
        this.userData = null
        this.wulingUserData = null
        this.isLoading = false
        this.initialized = true
      } else if (authType === 'wuling.id') {
        this.jwt = null
        this.authType = null
        this.userData = null
        this.wulingUserData = null
        this.isLoading = false
        this.initialized = true
      } else {
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
            const jwtResp = await fetch(`${config.public.BASE_API_URL}/account/jwtFromDWS?id=${encodeURIComponent(providerId)}`)
            if (jwtResp.ok) {
              let jwt = await jwtResp.text()
              jwt = jwt.replace(/^"|"$/g, '')
              if (jwt) {
                try {
                  await this.fetchWulingUserdata(jwt, 'dws')
                  return data
                } catch {
                  this.wulingUserData = null
                }
              }
            }
            
            if (process.client) {
              const router = useRouter()
              router.push('/account/bindDWS')
            }
            return data
          }          
          if (process.client) {
            const router = useRouter()
            router.push('/')
          }
          return data
        } else if (this.authType === 'wuling.id' && this.jwt) {
          return await this.fetchWulingUserdata(this.jwt, 'wuling.id')
        } else {
          this.clearAuth()
          throw new Error('No valid session')
        }      } catch (error) {
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
        
        if (flowType === 'dws') {
          this.wulingUserData = data
          this.jwt= jwt
        } else if (flowType === 'wuling.id') {
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
      const config = useRuntimeConfig()
      const resp = await fetch(`${config.public.BASE_API_URL}/account/bindFromDWS`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: providerId, jwt })
      })
      const data = await resp.json()
      return data
    },
    async unbindWulingIdFromDws(providerId) {
      const config = useRuntimeConfig()
      await fetch(`${config.public.BASE_API_URL}/account/bindFromDWS?uuid=${encodeURIComponent(providerId)}`, {
        method: 'DELETE'
      })
      this.jwt = null
      this.authType = 'dws'
      console.warn('JWT invalid, unbinding Wuling.id from DWS')
      localStorage.setItem('authType', 'dws')
    },

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
      
      const wulingData = await this.fetchWulingUserdata(jwt, 'wuling.id')
      this.authType = 'wuling.id'
      localStorage.setItem('authType', 'wuling.id')
      return wulingData
    },

  },
  getters: {
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