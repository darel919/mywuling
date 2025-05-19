<template>
    <div class="container py-4 px-6 sm:px-16 mx-auto  min-h-screen">
        <h1 class="text-2xl font-bold mb-6">My Account</h1>
        
        <template v-if="isLoading">
            <div class="space-y-6">
                <!-- Profile Header Skeleton -->
                <div class="flex items-center space-x-4">
                    <div class="avatar placeholder">
                        <div class="w-24 rounded-full bg-neutral-focus">
                            <span class="text-3xl">?</span>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="skeleton h-8 w-48"></div>
                        <div class="skeleton h-4 w-32"></div>
                    </div>
                </div>

                <!-- Information Cards Skeleton -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-for="i in 4" :key="i" class="card bg-base-200">
                        <div class="card-body">
                            <div class="skeleton h-8 w-32 mb-4"></div>
                            <div class="space-y-4">
                                <div class="skeleton h-4 w-full"></div>
                                <div class="skeleton h-4 w-3/4"></div>
                                <div class="skeleton h-4 w-5/6"></div>
                                <div class="skeleton h-4 w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-else-if="authStore.userData" class="space-y-6">
            <!-- Profile Header -->
            <div class="flex items-center space-x-4">
                <div class="avatar">
                    <div class="w-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img :src="authStore.userData.iconsPhoto" :alt="authStore.userData.userName" />
                    </div>
                </div>
                <div>
                    <h2 class="text-xl font-semibold">{{ authStore.userData.userName }}</h2>
                    <p class="text-gray-600">{{ authStore.userData.nickname }}</p>
                </div>
            </div>

            <!-- User Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card bg-base-200">
                    <div class="card-body">
                        <h3 class="card-title">Personal Information</h3>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Email:</span> {{ authStore.userData.email }}</p>
                            <p><span class="font-semibold">Phone:</span> {{ authStore.userData.phone }}</p>
                            <p><span class="font-semibold">Birthday:</span> {{ authStore.userData.birthday }}</p>
                            <p><span class="font-semibold">Address:</span> {{ authStore.userData.address }}</p>
                        </div>
                    </div>
                </div>

                <div class="card bg-base-200">
                    <div class="card-body">
                        <h3 class="card-title">Driver Information</h3>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Driver No:</span> {{ authStore.userData.driverNo }}</p>
                            <p><span class="font-semibold">License Expiry:</span> {{ authStore.userData.driverLicenseExpired }}</p>
                            <p><span class="font-semibold">Grade:</span> {{ authStore.userData.grade }}</p>
                            <p><span class="font-semibold">Points:</span> {{ authStore.userData.points }}</p>
                        </div>
                    </div>
                </div>

                <div class="card bg-base-200">
                    <div class="card-body">
                        <h3 class="card-title">Social Statistics</h3>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Likes:</span> {{ authStore.userData.likeNum }}</p>
                            <p><span class="font-semibold">Following:</span> {{ authStore.userData.focusNum }}</p>
                            <p><span class="font-semibold">Fans:</span> {{ authStore.userData.fansNum }}</p>
                            <p><span class="font-semibold">Moments:</span> {{ authStore.userData.momentNum }}</p>
                        </div>
                    </div>
                </div>

                <div class="card bg-base-200">
                    <div class="card-body">
                        <h3 class="card-title">Vehicle Information</h3>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Vehicle Count:</span> {{ authStore.userData.countcar }}</p>
                            <p><span class="font-semibold">Owner Status:</span> {{ authStore.userData.owner === "1" ? "Yes" : "No" }}</p>
                        </div>
                    </div>
                </div>
            </div>            
            <!-- Action Buttons -->
            <div class="flex justify-end space-x-4">
                <button @click="handleLogout" class="btn btn-error">Logout</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(true)

// Watch for userData changes to update page title
watch(() => authStore.userData, (userData) => {
    if (userData) {
        useHead({
            title: `${userData.userName}'s Account - dws-myWuling`
        })
    }
}, { immediate: true })

// Redirect if not authenticated
onMounted(async () => {
    if (!authStore.isAuthenticated) {
        router.push('/auth/login')
        return
    }
    
    if (!authStore.userData) {
        try {
            await authStore.fetchUserData()
        } catch (error) {
            router.push('/auth/login')
        }
    }
    
    isLoading.value = false
})

async function handleLogout() {
    authStore.clearAuth()
    await router.push('/auth/login')
}
</script>
