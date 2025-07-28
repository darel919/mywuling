<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-8 font-mono">
    <div class="mt-4 text-center">
      <section v-if="processing && !error" class="flex flex-col items-center justify-center">
        <span class="loading loading-spinner loading-lg mb-4"></span>
        <h1 class="font-bold text-2xl mt-8">Validating your authentication session, please wait...</h1>
      </section>
      <section v-else-if="error" class="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-16 text-error">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <h1 class="text-2xl font-bold my-8">{{ error }}</h1>
      </section>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const error = ref('')
const processing = ref(true)

onMounted(async () => {
  try {
    const at = route.query.at
    const rt = route.query.rt
    if (at) {
      let response, data
      try {
        response = await Promise.race([
          fetch(`${config.public.API_DARELISME_URL}/auth/verify?at=${encodeURIComponent(at)}`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 5000))
        ])
      } catch (fetchErr) {
        console.error('Fetch error:', fetchErr)
        throw new Error('Failed to connect to backend (timeout or network error)')
      }
      if (!response.ok) {
        let errText = await response.text().catch(() => '')
        console.error('Backend error:', response.status, errText)
        throw new Error('Failed to authenticate with backend')
      }
      try {
        data = await response.json()
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr)
        throw new Error('Invalid response from backend')
      }
      authStore.setAuth(at, data.user?.user_metadata || null, 'dws')
      window.localStorage.setItem('authSuccess', 'true')
      if (window.opener) {
        try {
          window.opener.localStorage.setItem('authSuccess', 'true')
          window.opener.postMessage({ type: 'AUTH_SUCCESS' }, '*')
        } catch (e) {}
        setTimeout(() => {
          window.close()
        }, 500)
        return
      }
      if (sessionStorage.getItem('redirectionCompleted')) {
        processing.value = false
        return
      }
      const redirectPath = localStorage.getItem('redirectAfterAuth') || route.query.redirect || '/'
      localStorage.removeItem('redirectAfterAuth')
      sessionStorage.setItem('redirectionCompleted', 'true')
      setTimeout(() => {
        router.replace(redirectPath)
      }, 300)
    } else {
      error.value = 'Authentication failed - no tokens received'
      setTimeout(() => router.replace('/auth/login'), 3000)
    }
  } catch (err) {
    console.error('Auth verify error:', err)
    error.value = 'Authentication error: ' + (err.message || err)
    setTimeout(() => router.replace('/auth/login'), 3000)
  } finally {
    processing.value = false
  }
})
</script>
