<template>
    <div>
        <h2 class="text-2xl font-bold mb-4">My Cars</h2>
        <div v-if="loading" class="text-center">
            Loading cars...
        </div>
        <div v-else-if="error" class="text-red-500">
            {{ error }}
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">            <div v-for="car in cars.data" :key="car.id" class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow" @click="navigateTo(`/car/status?vin=${car.vin}`)">                
                <div class="card-body">
                    <img :src="car.picUrl" :alt="`${ car.modelPrefix ? car.modelPrefix : car.modelName }`" class="w-48 h-full object-cover mb-4" />
                    <h3 class="card-title">{{ car.modelPrefix ? car.modelPrefix : car.modelName }}</h3>
                    <p>VIN: {{ car.vin }}</p>
                    <p :title="`Delivery date: ${car.billDate}`">Year: {{ new Date(car.billDate).getFullYear() }}</p>
                </div>
            </div>
        </div>
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