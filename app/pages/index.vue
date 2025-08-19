<template>    
    <div class="container py-4 px-6 sm:px-24 mx-auto min-h-screen">
        <ClientOnly>
            <h1 class="text-3xl mb-6">
                Welcome<span v-if="userName" class="font-bold">, {{ userName.split(' ')[0] }}!</span>
            </h1>
        
            <template v-if="authStore.isLoading">
                <div class="flex flex-col items-center space-y-4 mt-8">
                    <span class="loading loading-spinner loading-lg"></span>
                    <p>Loading...</p>
                </div>
            </template>
            <template v-else>
                <CarList v-if="authStore.isAuthenticated" />
                <div v-else class="text-center py-16">
                    <h3 class="text-2xl font-semibold text-base-content/70">You are not logged in</h3>
                    <NuxtLink to="/auth/login" class="btn btn-primary mt-4">Login</NuxtLink>
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup>
const authStore = useAuthStore()
const userName = computed(() => {
    return authStore.userData?.name || ''
})
useHead({
    title: 'Home - DWS-myWULING'
})

onMounted(async () => {
    // Wait for auth initialization
    while (authStore.isLoading && !authStore.initialized) {
        await new Promise(r => setTimeout(r, 50))
    }
    try {
        const alreadyRedirected = sessionStorage.getItem('defaultRedirectDone') === '1'
        const defaultVin = localStorage.getItem('defaultCarVin')
        if (!alreadyRedirected && defaultVin && authStore.isAuthenticated) {
            // Navigate to default car details once per session
            const router = useRouter()
            sessionStorage.setItem('defaultRedirectDone', '1')
            router.replace({ path: '/car/status', query: { vin: defaultVin } })
        }
    } catch (e) {
        // ignore storage errors
    }
})
</script>