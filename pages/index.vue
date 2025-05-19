<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-6">Welcome to myWuling</h1>
        <CarList v-if="authStore.isAuthenticated" />
        <div v-else>
            <p>Please log in to view your cars.</p>
            <NuxtLink to="/auth/login" class="btn btn-primary mt-4">Login</NuxtLink>
        </div>
    </div>
</template>

<script setup>
const authStore = useAuthStore()
</script>