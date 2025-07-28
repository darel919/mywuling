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

// No provider_id logic needed in new flow

async function handleBind() {
  error.value = ''
  isLoading.value = true
  try {
    // Get user ID from existing DWS userData
    const userId = authStore.userData?.id || localStorage.getItem('userId')
    if (!userId) throw new Error('No DWS user ID found')
    
    // Bind the Wuling.id credentials directly to the DWS user account
    const bindResp = await fetch(`${config.public.BASE_API_URL}/account/bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: userId, 
        username: email.value, 
        password: password.value 
      })
    })
    if (!bindResp.ok) throw new Error('Failed to bind account')
    
    // Now fetch the JWT using DWS intent
    const loginResp = await fetch(`${config.public.BASE_API_URL}/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'dws', id: userId })
    })
    if (!loginResp.ok) throw new Error('Failed to get JWT after binding')
    const loginData = await loginResp.json()
    
    // Save ONLY the JWT while preserving existing DWS userData and authType
    authStore.setAuth(loginData.jwt, authStore.userData, authStore.authType)
    authStore.needsBinding = false
    
    // Redirect to account page
    await router.replace('/account')
  } catch (e) {
    error.value = e.message || 'Failed to bind Wuling.id'
  } finally {
    isLoading.value = false
  }
}
</script>
