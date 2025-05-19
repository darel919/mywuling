<template>
    <div class="container py-4 px-6 sm:px-24 mx-auto  min-h-screen">
        <template v-if="loading.info || (loading.status && !carStatus)">
            <!-- Skeleton Refresh Bar -->
            <div class="flex justify-between items-center mb-6">
                <div class="skeleton h-4 w-48"></div>
                <div class="skeleton h-8 w-20"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Car Information Card Skeleton -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <div class="skeleton h-[300px] w-full rounded-lg mb-4"></div>
                        <div class="skeleton h-8 w-48 mb-4"></div>
                        <div class="grid grid-cols-2 gap-4">
                            <div v-for="i in 4" :key="i">
                                <div class="skeleton h-4 w-20 mb-2"></div>
                                <div class="skeleton h-6 w-32"></div>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <div class="skeleton h-6 w-12"></div>
                            <div class="skeleton h-6 w-12"></div>
                        </div>
                    </div>
                </div>

                <!-- Status Information Skeleton -->
                <div class="space-y-4">
                    <!-- Battery Status Card Skeleton -->
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <div class="skeleton h-8 w-32 mb-4"></div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="col-span-2">
                                    <div class="skeleton h-4 w-24 mb-2"></div>
                                    <div class="skeleton h-6 w-full"></div>
                                    <div class="skeleton h-4 w-12 ml-auto mt-1"></div>
                                </div>
                                <div>
                                    <div class="skeleton h-4 w-32 mb-2"></div>
                                    <div class="skeleton h-8 w-full"></div>
                                    <div class="skeleton h-4 w-3/4 mt-1"></div>
                                </div>
                                <div>
                                    <div class="skeleton h-4 w-32 mb-2"></div>
                                    <div class="skeleton h-6 w-32"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Vehicle Status Card Skeleton -->
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <div class="skeleton h-8 w-32 mb-4"></div>
                            <div class="grid grid-cols-2 gap-4">
                                <div v-for="i in 6" :key="i">
                                    <div class="skeleton h-4 w-24 mb-2"></div>
                                    <div class="skeleton h-6 w-32"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Location Card Skeleton -->
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <div class="skeleton h-8 w-24 mb-4"></div>
                            <div class="skeleton h-6 w-48 mb-2"></div>
                            <div class="skeleton h-6 w-48"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div v-if="(error.info || error.status) && !carInfo" class="text-red-500">
                {{ error.info || error.status }}
            </div>
            <div v-else class="space-y-6">     
                <div class="text-sm breadcrumbs mb-6">
                    <ul>
                        <li><NuxtLink to="/">Home</NuxtLink></li>
                        <li><b>Car Status</b></li>
                    </ul>
                </div>       
                <!-- Refresh info -->
                <div v-if="carInfo?.car.isEV || carInfo?.car.isIOV" 
                     class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <p class="text-sm text-gray-500" v-if="carStatus.apiStatus && carStatus.apiStatus.time">
                            Last updated: {{ new Date(carStatus.apiStatus.time).toLocaleString() }}
                        </p>
                        <span v-if="refreshing" class="loading loading-spinner loading-sm"></span>
                    </div>
                    <button @click="refreshStatus()" class="btn btn-primary btn-sm" :disabled="refreshing">
                        <span v-if="refreshing">Refreshing...</span>
                        <span v-else>Refresh</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Car Information -->
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <div class="relative w-full aspect-video mb-4">
                                <img :src="carInfo?.car.car_picture" 
                                     :alt="carInfo?.car.car_name" 
                                     class="absolute inset-0 w-full h-full object-cover rounded" />
                            </div>
                            <div class="flex gap-2 mt-4">
                                <span v-if="carInfo?.car.isEV" class="badge badge-primary">EV</span>
                                <span v-if="carInfo?.car.isIOV" class="badge badge-secondary">IOV</span>
                            </div>
                            <section class="card-title flex-col items-start">
                                <p class="text-lg opacity-[0.3]">{{ carInfo?.car.licensePlate || 'N/A' }}</p>
                                <h2 class="text-2xl -mt-2">{{ carInfo?.car.car_name }}</h2>
                            </section>

                            <!-- Service History Button -->
                            <div class="mt-4">
                                <NuxtLink :to="`/car/service/history?vin=${route.query.vin}`" class="btn btn-primary w-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Service History
                                </NuxtLink>
                            </div>

                            <div class="collapse bg-base-200 mt-4">
                                <input type="checkbox" :checked="!carInfo?.car.isEV && !carInfo?.car.isIOV" /> 
                                <div class="collapse-title text-sm font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                    Vehicle Details
                                </div>
                                <div class="collapse-content bg-base-100"> 
                                    <div class="grid grid-cols-2 gap-x-6 gap-y-4 py-2">
                                        <div>
                                            <p class="font-bold text-sm text-base-content/70">Model</p>
                                            <p class="text-base-content">{{ carInfo?.car.modelName }}</p>
                                        </div>
                                        <div>
                                            <p class="font-bold text-sm text-base-content/70">VIN</p>
                                            <p class="text-base-content font-mono">{{ carInfo?.car.vin }}</p>
                                        </div>
                                        <div>
                                            <p class="font-bold text-sm text-base-content/70">Delivery Date</p>
                                            <p class="text-base-content">{{ new Date(carInfo?.car.delivery_date).toLocaleDateString() }}</p>
                                        </div>
                                        <div class="col-span-2 mt-4">
                                            <div v-if="manualBookState.loading" class="w-full flex items-center justify-center">
                                                <button class="btn btn-outline btn-primary w-full" disabled>
                                                    <span class="loading loading-spinner loading-sm mr-2"></span>
                                                    Checking Manual Book...
                                                </button>
                                            </div>
                                            <template v-else>
                                                <a v-if="manualBookState.available" 
                                                   :href="`${config.public.BASE_API_URL}/car/manual?carCode=${carInfo?.car.modelCode}&token=${authStore.jwt}`" 
                                                   target="_blank"
                                                   rel="noopener noreferrer" 
                                                   class="btn btn-outline btn-primary w-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                                    </svg>
                                                    Open Manual Book
                                                </a>
                                                <p v-else class="text-sm text-gray-500 text-center">Manual book is not available for this car.</p>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Status Information -->
                    <div class="space-y-4">
                        <div v-if="!carInfo?.car.isEV && !carInfo?.car.isIOV" 
                             class="alert flex items-center flex-col p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-12 h-12"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <h2 class="text-xl px-4">Real-time vehicle data is not available for this car</h2>
                        </div>
                        
                        <!-- Battery Status Component -->
                        <CarStatusBattery 
                            v-if="carInfo?.car.isEV"
                            :car-info="carInfo"
                            :car-status="carStatus"
                        />
                        <!-- Vehicle Status Component -->
                        <CarStatusVehicle 
                            v-if="carStatus?.car.car_status"
                            :car-status="carStatus"
                        />
                        <!-- Location Component -->
                        <CarStatusLocation 
                            v-if="carStatus?.car.location?.lat && carStatus?.car.location?.lng"
                            :car-status="carStatus"
                        />                  
                        <!-- Driving Report Component -->
                        <CarStatusDrivingReport
                            v-if="carInfo?.car.isEV && drivingReport"
                            :car-info="carInfo"
                            :driving-report="drivingReport"
                        />

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

const loading = ref({
    info: true,
    status: true,
    report: true
})
const refreshing = ref(false)
const error = ref({
    info: null,
    status: null,
    report: null
})
const carInfo = ref(null)
const carStatus = ref(null)
const drivingReport = ref(null)
const manualBookState = ref({
    loading: true,
    available: false
})
let refreshInterval = null

async function checkManualBookAvailability() {
    if (!carInfo.value?.car?.modelCode) return

    manualBookState.value.loading = true
    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/manual?carCode=${carInfo.value.car.modelCode}`, {
            method: 'HEAD',
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        manualBookState.value.available = response.ok
    } catch (err) {
        manualBookState.value.available = false
    } finally {
        manualBookState.value.loading = false
    }
}

async function fetchCarInfo() {
    const vin = route.query.vin
    if (!vin) {
        error.value.info = 'No VIN provided'
        return
    }

    loading.value.info = true
    error.value.info = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/info?vin=${vin}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch car information')
        }
        
        carInfo.value = await response.json()
        await checkManualBookAvailability()
    } catch (err) {
        error.value.info = err.message
    } finally {
        loading.value.info = false
    }
}

async function refreshStatus() {
    const vin = route.query.vin
    if (!vin) {
        error.value.status = 'No VIN provided'
        return
    }

    if (!refreshing.value) {
        loading.value.status = true
    }
    refreshing.value = true
    error.value.status = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/status?vin=${vin}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch car status')
        }
        
        carStatus.value = await response.json()
    } catch (err) {
        error.value.status = err.message
    } finally {
        loading.value.status = false
        refreshing.value = false
        document.title = `${carInfo.value?.car_name || 'Car Status'} - DWS-myWULING`
    }
}

async function fetchDrivingReport() {
    const vin = route.query.vin
    if (!vin) {
        error.value.report = 'No VIN provided'
        return
    }

    loading.value.report = true
    error.value.report = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/drivingReport?vin=${vin}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch driving report')
        }
        
        drivingReport.value = await response.json()
    } catch (err) {
        error.value.report = err.message
    } finally {
        loading.value.report = false
    }
}

onMounted(async () => {
    await fetchCarInfo()
    await refreshStatus()
    if (carInfo.value?.car.isEV) {
        await fetchDrivingReport()
    }
})

watch(() => carInfo.value, (newInfo) => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
    }
    
    if (newInfo?.isEV || newInfo?.isIOV) {
        refreshInterval = setInterval(() => refreshStatus(), 30000)
    }
}, { immediate: true })

// Update page title when car info changes
watch(() => carInfo.value?.car_name, (carName) => {
    if (carName) {
        useHead({
            title: `${carName} - dws-myWuling`
        })
    }
}, { immediate: true })

// Watch for car model code changes to check manual book availability
watch(() => carInfo.value?.car?.modelCode, (modelCode) => {
    if (modelCode) {
        checkManualBookAvailability()
    }
}, { immediate: true })

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})
</script>
