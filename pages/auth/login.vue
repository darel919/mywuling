<template>
    <div>
        <h1>Login to myWuling</h1>
        <h2>To use DWS-myWuling, you need to login to your myWuling account.</h2>
        <form @submit.prevent="handleLogin">
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Email</legend>
                <input type="email" v-model="username" class="input" placeholder="Type here" />
            </fieldset>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Password</legend>
                <input type="password" v-model="password" class="input" placeholder="Type here" />
            </fieldset>
            <button type="submit" :disabled="isLoading">{{ isLoading ? 'Logging in...' : 'Login' }}</button>
            <p v-if="error" class="text-red-500">{{ error }}</p>
        </form>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()

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
                username: username.value,
                password: password.value
            })
        })
        
        if (!response.ok) {
            throw new Error('Invalid credentials')
        }
        
        const data = await response.json()
        authStore.setAuth(data.jwt, data.userData)
        await navigateTo('/')
    } catch (err) {
        error.value = err.message
    } finally {
        isLoading.value = false
    }
}
</script>