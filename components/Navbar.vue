<template>
    <header class="navbar bg-base-100">
        <div class="navbar-start">
            <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
                <p>dws-myWuling</p>
            </NuxtLink>
        </div>
        <div class="navbar-end">
            <template v-if="isLoading">
                <div class="loading loading-spinner"></div>
            </template>
            <template v-else-if="authStore.isAuthenticated && authStore.userData">
                <NuxtLink to="/account" class="btn btn-ghost avatar">
                    <div class="w-10 rounded-full">
                        <img :src="authStore.userData.iconsPhoto" :alt="authStore.userData.userName" />
                    </div>
                </NuxtLink>
            </template>
            <template v-else-if="!authStore.isAuthenticated">
                <button @click="goLogin" class="btn btn-primary">Login</button>
            </template>
        </div>
    </header>
</template>

<script setup>
const authStore = useAuthStore()
const isLoading = ref(true)

async function goLogin() {
    await navigateTo('/auth/login')
}

// Check and fetch user data if needed
onMounted(async () => {
    if (authStore.isAuthenticated) {
        try {
            await authStore.fetchUserData()
        } catch (error) {
            const message = 'You need to log in to myWULING to continue'
            alert(message)
            await navigateTo('/auth/login')
        }
    }
    isLoading.value = false
})
</script>