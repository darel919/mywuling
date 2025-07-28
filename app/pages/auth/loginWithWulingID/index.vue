<template>
    <div class="container py-4 px-6 sm:px-16 mx-auto min-h-screen flex items-center justify-center">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
            <div class="card-body">
                <!-- Logo and Title -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold mb-2">Login with wuling.id</h1>
                    <p class="text-base-content/60">Sign in using your wuling.id account</p>
                    <NuxtLink to="/about" class="link link-primary text-sm mt-2 inline-block">Why this app?</NuxtLink>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <!-- Email Input -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Email</span>
                        </label>
                        <input 
                            type="email" 
                            v-model="username" 
                            class="input input-bordered w-full" 
                            :class="{'input-error': error}"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <!-- Password Input -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text">Password</span>
                        </label>
                        <input 
                            type="password" 
                            v-model="password" 
                            class="input input-bordered w-full" 
                            :class="{'input-error': error}"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="alert alert-error">
                        <svg xmlns="http://www.wuling.id/" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{{ error }}</span>
                    </div>

                    <!-- Submit Button -->
                    <button 
                        type="submit" 
                        class="btn btn-primary w-full flex items-center justify-center" 
                        :disabled="isLoading"
                    >
                        <span v-if="isLoading" class="loading loading-spinner loading-md mr-2"></span>
                        <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
                    </button>
                </form>

                <!-- Login with DWS alternative -->
                <div class="text-center mt-4">
                    <NuxtLink to="/auth/login" class="link link-secondary text-sm">
                        Login with DWS instead
                    </NuxtLink>
                </div>

                <!-- Help Text -->
                <div class="text-center mt-6">
                    <p class="text-sm text-base-content/60">
                        Don't have an account? Visit 
                        <a href="https://www.wuling.id/" target="_blank" class="link link-primary">wuling.id</a>
                        to create one.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()

useHead({
    title: 'Login with wuling.id - dws-myWULING'
})

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleLogin() {
    try {
        isLoading.value = true
        error.value = ''
        const response = await fetch(`${config.public.BASE_API_URL}/account/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'wuling.id',
                username: username.value,
                password: password.value
            })
        })
        if (!response.ok) {
            throw new Error('Invalid credentials')
        }
        const data = await response.json()
        authStore.setAuth(data.jwt, data.userData, 'wuling.id')
        await navigateTo('/')
    } catch (err) {
        error.value = err.message
    } finally {
        isLoading.value = false
    }
}
</script>
