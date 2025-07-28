<template>    
    <div class="container py-4 px-6 sm:px-24 mx-auto min-h-screen">        
        <!-- Breadcrumb -->
        <div class="text-sm breadcrumbs mb-6">
            <ul>
                <li><NuxtLink to="/">Home</NuxtLink></li>
                <li><NuxtLink :to="`/car/status?vin=${route.query.vin}`">Car Status</NuxtLink></li>
                <li><b>Service History</b></li>
            </ul>
        </div>

        <template v-if="loading">
            <div class="space-y-4">
                <div v-for="i in 3" :key="i" class="card bg-base-100 shadow-xl animate-pulse">
                    <div class="card-body">
                        <div class="h-4 bg-base-300 rounded w-1/4 mb-4"></div>
                        <div class="space-y-2">
                            <div class="h-3 bg-base-300 rounded w-1/3"></div>
                            <div class="h-3 bg-base-300 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else-if="error">
            <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ error }}</span>
            </div>
        </template>
        <template v-else>
            <div v-if="serviceHistory.length === 0" class="text-center py-8">
                <p class="text-gray-500">No service history found</p>
            </div>
            <div v-else class="space-y-4">
                <div v-for="service in serviceHistory" 
                        :key="service.service_id" 
                        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                        @click="navigateToDetails(service.service_id)">
                    <div class="card-body">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="card-title">Service Order #{{ service.service_no }}</h3>
                                <div class="mt-2 space-y-1">
                                    <p class="text-sm">
                                        Started: {{ formatDate(service.service_start_time) }}
                                    </p>
                                    <p class="text-sm">
                                        Completed: {{ formatDate(service.service_end_time) }}
                                    </p>
                                    <div v-if="service.service_advisor_name" class="mt-4">
                                        <p class="text-sm font-semibold">Service Advisor:</p>
                                        <p class="text-sm">{{ service.service_advisor_name }}</p>
                                        <p class="text-sm text-primary">{{ service.service_advisor_phone }}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span class="badge badge-primary">{{ service.service_status }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const serviceHistory = ref([])

function formatDate(dateStr) {
    try {
        const parts = dateStr.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/)
        if (parts) {
            return new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]).toLocaleString()
        }

        return new Date(dateStr).toLocaleString()
    } catch {
        return dateStr
    }
}

async function fetchServiceHistory() {
    const vin = route.query.vin
    if (!vin) {
        error.value = 'No VIN provided'
        loading.value = false
        return
    }

    loading.value = true
    error.value = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/service/history?vin=${vin}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch service history')
        }
        
        serviceHistory.value = await response.json()
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

function navigateToDetails(serviceId) {
    router.push(`/car/service/history/details?work_order=${serviceId}`)
}

onMounted(async () => {
    await fetchServiceHistory()
})

useHead({
    title: 'Service History - dws-myWULING'
})
</script>
