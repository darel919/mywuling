<template>
    <div>
        <template v-if="loading">
            <!-- Car List Skeleton -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 3" :key="i" class="card bg-base-200">
                    <figure class="px-10 pt-10">
                        <div class="skeleton h-32 w-full"></div>
                    </figure>
                    <div class="card-body">
                        <div class="skeleton h-8 w-3/4"></div>
                        <div class="skeleton h-4 w-full"></div>
                        <div class="skeleton h-4 w-5/6"></div>
                        <div class="skeleton h-10 w-full mt-4"></div>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div v-if="cars.data.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="car in cars.data" :key="car.id" class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" @click="navigateTo(`/car/status?vin=${car.vin}`)">                
                    <div class="card-body">
                        <img :src="car.picUrl" :alt="`${ car.modelPrefix ? car.modelPrefix : car.modelName }`" class="w-48 h-full object-cover mb-4" />
                        <h3 class="card-title">{{ car.modelPrefix ? car.modelPrefix : car.modelName }}</h3>
                        <p>VIN: {{ car.vin }}</p>
                        <p :title="`Delivery date: ${car.billDate}`">Year: {{ new Date(car.billDate).getFullYear() }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-8">
                <p class="text-lg">No cars found.</p>
            </div>
        </template>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()

const cars = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/list`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch cars')
        }
        
        cars.value = await response.json()
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
})
</script>