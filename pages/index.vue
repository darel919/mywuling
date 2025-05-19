<template>    
    <div class="container py-4 px-6 sm:px-24 mx-auto min-h-screen">
        <ClientOnly>
            <h1 class="text-3xl mb-6">
                Welcome to myWULING<span v-if="authStore.userData" class="font-bold">, {{ authStore.userData.userName.split(' ')[0] }}!</span>
            </h1>
        
            <template v-if="authStore.isLoading">
                <div class="flex flex-col items-center space-y-4 mt-8">
                    <span class="loading loading-spinner loading-lg"></span>
                    <p>Loading...</p>
                </div>
            </template>
            <template v-else>
                <CarList v-if="authStore.isAuthenticated" />
                <div v-else>
                    <p>Please log in to view your cars.</p>
                    <NuxtLink to="/auth/login" class="btn btn-primary mt-4">Login</NuxtLink>
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup>
const authStore = useAuthStore()

useHead({
    title: 'Home - DWS-myWULING'
})
</script>