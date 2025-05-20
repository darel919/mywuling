<template>
    <div class="container py-4 px-6 sm:px-16 mx-auto min-h-screen">
        <div class="max-w-2xl mx-auto mt-12">
            <h1 class="text-4xl font-bold mb-8">Why this app?</h1>
            <div class="prose prose-lg">
                <p class="mb-6">As an attempt to reimagine what myWULING+ could and should be, I created this project to provide a better experience for WULING car owners.</p>
                <p class="mb-6">It is a work in progress, and I am open to suggestions and contributions.</p>                
                <div class="mt-8">
                    <NuxtLink :to="authStore.isAuthenticated ? '/' : '/auth/login'" class="btn btn-primary">
                        {{ authStore.isAuthenticated ? 'Go to Dashboard' : 'Get Started' }}
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const authStore = useAuthStore()

definePageMeta({
    auth: false
})

useHead({
    title: 'Why dws-myWULING instead of dws-myWULING?'
})
</script>