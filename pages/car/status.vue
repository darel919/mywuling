<template>
    <div class="container mx-auto p-4">
        <template v-if="loading && !carData">
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
            <div v-if="error && !carData" class="text-red-500">
                {{ error }}
            </div>
            <div v-else class="space-y-6">            
                <!-- Refresh info -->
                <div v-if="carData.car.information.isEV || carData.car.information.isIOV" 
                     class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <p class="text-sm text-gray-500" v-if="carData?.apiStatus?.time">
                            Last updated: {{ new Date(carData.apiStatus.time).toLocaleString() }}
                        </p>
                        <span v-if="refreshing" class="loading loading-spinner loading-sm"></span>
                    </div>
                    <button @click="refreshData(false)" class="btn btn-primary btn-sm" :disabled="refreshing">
                        <span v-if="refreshing">Refreshing...</span>
                        <span v-else>Refresh</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Car Information -->
                    <div class="card bg-base-100 shadow-xl">
                        <div class="card-body">
                            <img :src="carData.car.information.car_picture" :alt="carData.car.information.car_name" class="w-full h-full object-cover mb-4 rounded" />
                            <h2 class="card-title text-2xl">{{ carData.car.information.car_name }}</h2>
                            <div class="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p class="font-bold">Model</p>
                                    <p>{{ carData.car.information.modelName }}</p>
                                </div>
                                <div>
                                    <p class="font-bold">VIN</p>
                                    <p>{{ carData.car.information.vin }}</p>
                                </div>
                                <div>
                                    <p class="font-bold">License Plate</p>
                                    <p>{{ carData.car.information.licensePlate || 'N/A' }}</p>
                                </div>
                                <div>
                                    <p class="font-bold">Delivery Date</p>
                                    <p>{{ new Date(carData.car.information.delivery_date).toLocaleDateString() }}</p>
                                </div>
                            </div>                    <div class="flex gap-2 mt-4">
                            <span v-if="carData.car.information.isEV" class="badge badge-primary">EV</span>
                            <span v-if="carData.car.information.isIOV" class="badge badge-secondary">IOV</span>
                        </div>
                    </div>
                </div>

                    <!-- Status Information -->
                    <div class="space-y-4">
                        <div v-if="!carData.car.information.isEV && !carData.car.information.isIOV" 
                             class="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>Real-time vehicle data is not available for this car</span>
                        </div>
                        <!-- Battery Status (if EV) -->
                        <div v-if="carData.car.information.isEV" class="card bg-base-100 shadow-xl">
                            <div class="card-body">
                                <h3 class="card-title">Battery Status</h3>
                                <div class="grid grid-cols-2 gap-4">                            
                                    <div class="col-span-2">
                                        <p class="font-bold mb-2">Charge Level</p>                                <progress 
                                            class="progress w-full" 
                                            :class="{
                                                'progress-error': !carData.car.data.battery.charging && carData.car.data.battery.soc <= 20,
                                                'progress-warning': !carData.car.data.battery.charging && carData.car.data.battery.soc > 20 && carData.car.data.battery.soc <= 50,
                                                'progress-success': !carData.car.data.battery.charging && carData.car.data.battery.soc > 50,
                                                'progress-secondary': carData.car.data.battery.charging
                                            }" 
                                            :value="carData.car.data.battery.soc" 
                                            max="100"
                                        ></progress>
                                        <p class="text-right mt-1">{{ carData.car.data.battery.soc }}%</p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Estimated Range</p>
                                        <p class="text-2xl font-mono">{{ carData.car.data.battery.range_wltp }} km (WLTP)</p>
                                        <p class="text-sm text-gray-500">{{ carData.car.data.battery.range }} km (CLTC)</p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Charging Status</p>
                                        <p>{{ carData.car.data.battery.charging ? 'Charging' : 'Not Charging' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Car Status -->
                        <div v-if="carData.car.data && carData.car.data.car_status" class="card bg-base-100 shadow-xl">
                            <div class="card-body">
                                <h3 class="card-title">Vehicle Status</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <p class="font-bold">Doors</p>
                                        <p class="capitalize">{{ carData.car.data.car_status.door }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Ignition</p>
                                        <p class="capitalize">{{ carData.car.data.car_status.ignition }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Trunk</p>
                                        <p class="capitalize">{{ carData.car.data.car_status.trunk_ajar }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Windows</p>
                                        <p class="capitalize">{{ carData.car.data.car_status.window_ajar }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Lights</p>
                                        <p>
                                            {{ carData.car.data.car_status.lights.lowBeam ? 'Low Beam On' : '' }}
                                            {{ carData.car.data.car_status.lights.highBeam ? 'High Beam On' : '' }}
                                            {{ !carData.car.data.car_status.lights.lowBeam && !carData.car.data.car_status.lights.highBeam ? 'Off' : '' }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="font-bold">Odometer</p>
                                        <p>{{ carData.car.data.odometer }} km</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Location -->
                        <div v-if="carData.car.data && carData.car.data.location.lat && carData.car.data.location.lng" class="card bg-base-100 shadow-xl">
                            <div class="card-body">
                                <h3 class="card-title">Location</h3>
                                <p>Lat: {{ carData.car.data.location.lat }}</p>
                                <p>Lng: {{ carData.car.data.location.lng }}</p>
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

const loading = ref(true)
const refreshing = ref(false)
const error = ref(null)
const carData = ref(null)
let refreshInterval = null

async function refreshData(isInitial = false) {
    const vin = route.query.vin
    if (!vin) {
        error.value = 'No VIN provided'
        return
    }

    if (isInitial) {
        loading.value = true
    } else {
        refreshing.value = true
    }
    error.value = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/status?vin=${vin}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch car status')
        }
        
        carData.value = await response.json()
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
        refreshing.value = false
        document.title = `${carData.value?.car?.information?.car_name || 'Car Status'} - DWS-myWULING`
    }
}

onMounted(async () => {
    await refreshData(true)
})

watch(() => carData.value, (newData) => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
    }
    
    if (newData?.car?.information?.isEV || newData?.car?.information?.isIOV) {
        refreshInterval = setInterval(() => refreshData(false), 30000)
    }
}, { immediate: true })

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})
</script>
