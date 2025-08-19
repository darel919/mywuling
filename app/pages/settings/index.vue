<template>
    <div class="container py-4 px-6 sm:px-16 mx-auto  min-h-screen">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">My Account</h2>
                    <template v-if="isLoading">
                        <div class="skeleton h-6 w-48"></div>
                        <div class="skeleton h-4 w-64 mt-2"></div>
                    </template>
                    <template v-else>
                        <div v-if="authStore.userData" class="mt-2 space-y-2">
                            <p class="font-semibold">{{ username }}</p>
                            <p class="text-sm text-gray-500">{{ authStore.authType.toUpperCase() }} account</p>
                        </div>
                        <div v-else class="text-sm text-gray-500">Not signed in</div>
                    </template>
                </div>
            </div>

            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title">Default Car</h2>
                    <p class="text-sm text-gray-500 mb-4">Choose a default car to open automatically on app load.</p>

                    <div v-if="loadingCars" class="space-y-2">
                        <div class="skeleton h-6 w-full"></div>
                        <div class="skeleton h-6 w-3/4"></div>
                    </div>

                    <div v-else>
                        <select class="select select-bordered w-full" v-model="selectedVin">
                            <option value="">(No default)</option>
                            <option v-for="car in cars.data || []" :key="car.id" :value="car.vin">
                                {{ car.licenseNo || car.modelName }} - {{ car.vin }}
                            </option>
                        </select>

                        <div class="mt-4 flex gap-2">
                            <button class="btn btn-primary" @click="saveDefault" :disabled="!selectedVin">Save Default</button>
                            <button class="btn btn-ghost" @click="clearDefault">Clear</button>
                        </div>

                        <p v-if="savedMessage" class="text-sm text-success mt-3">{{ savedMessage }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-8">
            <NuxtLink to="/account/bindDWS" class="link">Manage account binding</NuxtLink>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(true)
const cars = ref([])
const loadingCars = ref(true)
const error = ref(null)
const selectedVin = ref('')
const savedMessage = ref('')

const username = computed(() => {
    return authStore.userData?.name || authStore.userData?.userName || ''
})

async function fetchCars() {
    loadingCars.value = true
    if (!authStore.jwt) {
        loadingCars.value = false
        cars.value = []
        return
    }
    try {
        const res = await fetch(`${config.public.BASE_API_URL}/car/list`, {
            headers: { 'Authorization': authStore.jwt }
        })
        if (!res.ok) throw new Error('Failed to fetch car list')
        cars.value = await res.json()
    } catch (e) {
        error.value = e.message
        cars.value = []
    } finally {
        loadingCars.value = false
    }
}

function loadDefault() {
    const vin = localStorage.getItem('defaultCarVin') || ''
    selectedVin.value = vin
}

function saveDefault() {
    if (!selectedVin.value) return
    localStorage.setItem('defaultCarVin', selectedVin.value)
    savedMessage.value = 'Default car saved.'
    setTimeout(() => savedMessage.value = '', 2000)
}

function clearDefault() {
    localStorage.removeItem('defaultCarVin')
    selectedVin.value = ''
    savedMessage.value = 'Default car cleared.'
    setTimeout(() => savedMessage.value = '', 2000)
}

onMounted(async () => {
    if (!authStore.userData) {
        try { await authStore.fetchUserData() } catch (e) { }
    }
    await fetchCars()
    loadDefault()
    isLoading.value = false
})
</script>

<style scoped>
.skeleton { background: rgba(0,0,0,0.08); border-radius: 6px; }
</style>
