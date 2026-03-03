<template>
    <header class="navbar bg-base-100">
        <div class="navbar-start">
            <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
                <p>dws-myWULING</p>
            </NuxtLink>
        </div>
       <ClientOnly>
            <div class="navbar-end ml-auto flex items-center">
                <div v-if="authStore.isAuthenticated" class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-ghost btn-circle avatar" aria-label="Open profile menu">
                        <div class="w-8 rounded-full">
                            <img v-if="avatar" :src="avatar" alt="avatar" />
                            <div v-else class="w-full h-full rounded-full bg-base-300 flex items-center justify-center text-xs font-semibold">
                                {{ userInitial }}
                            </div>
                        </div>
                    </button>
                    <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-40 p-2 shadow">
                        <li><NuxtLink to="/settings">Settings</NuxtLink></li>
                        <li><button @click="handleLogout">Logout</button></li>
                    </ul>
                </div>
                <template v-else>
                    <NuxtLink to="/auth/login" class="btn btn-primary btn-sm">Login</NuxtLink>
                </template>
            </div>
       </ClientOnly>
    </header>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()

const avatar = computed(() => {
    if (!authStore.isAuthenticated) return null
    
    if (authStore.authType === 'dws') {
        return authStore.userData?.avatar || authStore.userData?.avatar_url || null
    } else if (authStore.authType === 'wuling.id') {
        return authStore.userData?.iconsPhoto || null
    }
    return null
})

const userInitial = computed(() => {
    const name = authStore.userData?.name || authStore.userData?.full_name || authStore.userData?.userName || 'U'
    return String(name).trim().charAt(0).toUpperCase() || 'U'
})

async function handleLogout() {
    authStore.clearAuth()
    await router.push('/auth/login')
}
</script>