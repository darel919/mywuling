<template>
    <header class="navbar bg-base-100">
        <div class="navbar-start">
            <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
                <p>dws-myWULING</p>
            </NuxtLink>
        </div>
       <ClientOnly>
            <div class="navbar-end ml-auto flex items-center">
                <NuxtLink to="/account" v-if="avatar">
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
import { computed, ref, onMounted } from 'vue'
const authStore = useAuthStore()

const dwsUserData = ref(null)
const avatar = computed(() => {
    if(authStore.authType === 'dws') {
        return authStore.userData?.data?.user?.user_metadata?.avatar_url || dwsUserData.value?.data?.user?.user_metadata?.avatar_url || ''
    } else if(authStore.authType === 'wuling.id') {
        return authStore.userData?.iconsPhoto || ''
    }
    return null;
})

onMounted(() => {
    if (authStore.authType === 'dws' && !authStore.userData) {
        const stored = localStorage.getItem('userData')
        if (stored) {
            try {
                dwsUserData.value = JSON.parse(stored)
            } catch {}
        }
    }
})


</script>