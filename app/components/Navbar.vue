<template>
    <header class="navbar bg-base-100">
        <div class="navbar-start">
            <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
                <p>dws-myWULING</p>
            </NuxtLink>
        </div>
       <ClientOnly>
            <div class="navbar-end ml-auto flex items-center">
                <NuxtLink to="/settings" v-if="authStore.isAuthenticated && avatar">
                    <img :src="avatar" class="w-8 h-8 rounded-full mr-2" alt="avatar" />
                </NuxtLink>
                <template v-else>
                    <NuxtLink to="/auth/login" class="btn btn-primary btn-sm">Login</NuxtLink>
                </template>
            </div>
       </ClientOnly>
    </header>
</template>

<script setup>
const authStore = useAuthStore()

const avatar = computed(() => {
    console.log('Navbar - authStore.isAuthenticated:', authStore.isAuthenticated)
    console.log('Navbar - authStore.jwt:', !!authStore.jwt)
    console.log('Navbar - authStore.userData:', !!authStore.userData)
    console.log('Navbar - authStore.authType:', authStore.authType)
    console.log('Navbar - authStore.needsBinding:', authStore.needsBinding)
    
    if (!authStore.isAuthenticated) return null
    
    if (authStore.authType === 'dws') {
        const avatarUrl = authStore.userData?.avatar || authStore.userData?.avatar_url || null
        console.log('Navbar - DWS avatar:', avatarUrl)
        return avatarUrl
    } else if (authStore.authType === 'wuling.id') {
        const avatarUrl = authStore.userData?.iconsPhoto || null
        console.log('Navbar - Wuling avatar:', avatarUrl)
        return avatarUrl
    }
    return null
})
</script>