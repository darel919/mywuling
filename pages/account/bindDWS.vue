<template>
  <div class="container py-8 px-4 mx-auto max-w-md min-h-screen flex flex-col items-center justify-center">
    <div class="card w-full bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="text-2xl font-bold mb-4 text-center">Bind your Wuling.id Account</h1>
        <p class="mb-4 text-base-content/70 text-center">
          To access all features, please bind your Wuling.id account to your DWS account.<br>
          Enter your Wuling.id credentials below.
        </p>
        <form @submit.prevent="handleBind" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Email</span></label>
            <input type="email" v-model="email" class="input input-bordered w-full" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Password</span></label>
            <input type="password" v-model="password" class="input input-bordered w-full" required />
          </div>
          <div v-if="error" class="alert alert-error py-2 text-sm">{{ error }}</div>
          <button type="submit" class="btn btn-primary w-full flex items-center justify-center" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-md mr-2"></span>
            <span>{{ isLoading ? 'Binding...' : 'Bind Wuling.id' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

onMounted(async () => {
  // If DWS user, check if already bound (jwtFromDWS exists and is valid)
  const providerId = authStore.userData?.data?.user?.user_metadata?.provider_id
  if (authStore.authType === 'dws' && providerId) {
    try {
      // Try to get JWT from backend
      const jwtResp = await fetch(`${config.public.BASE_API_URL}/account/jwtFromDWS?id=${encodeURIComponent(providerId)}`)
      if (jwtResp.ok) {
        let jwt = await jwtResp.text() // jwtFromDWS returns the raw JWT string
        jwt = jwt.replace(/^"|"$/g, '') // Remove leading/trailing quotes if present
        if (jwt) {
          // Validate JWT
          const validResp = await fetch(`${config.public.BASE_API_URL}/account`, {
            headers: { 'Authorization': jwt }
          })
          if (validResp.ok) {
            // JWT is valid, treat as already bound, set store and redirect
            await authStore.bindWulingIdToDws({ providerId, jwt })
            await authStore.fetchUserData()
            await router.replace('/account')
            return
          }
        }
      }
    } catch (e) {
      // Ignore, allow binding UI to show
    }
  }
})

async function handleBind() {
  error.value = ''
  isLoading.value = true
  try {
    // Validate Wuling.id credentials
    const resp = await fetch(`${config.public.BASE_API_URL}/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.value, password: password.value })
    })
    if (!resp.ok) throw new Error('Invalid Wuling.id credentials')
    const data = await resp.json()
    const jwt = data.jwt
    // Validate JWT
    const validResp = await fetch(`${config.public.BASE_API_URL}/account`, {
      headers: { 'Authorization': jwt }
    })
    if (!validResp.ok) throw new Error('Wuling.id JWT is invalid')
    // Bind to DWS
    const providerId = authStore.userData?.data?.user?.user_metadata?.provider_id
    if (!providerId) throw new Error('Missing DWS provider_id')
    const bindResult = await authStore.bindWulingIdToDws({ providerId, jwt })
    if (!bindResult.success) throw new Error(bindResult.error || 'Failed to bind Wuling.id')
    // Refresh user data
    await authStore.fetchUserData()
    await router.replace('/account')
  } catch (e) {
    error.value = e.message || 'Failed to bind Wuling.id'
  } finally {
    isLoading.value = false
  }
}
</script>
