<template>
    <div class="container mx-auto px-4">
        <template v-if="loading">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="i in 3" :key="i" class="card bg-base-200 hover:shadow-lg transition-shadow duration-300">
                    <figure class="px-6 pt-6">
                        <div class="skeleton h-48 w-full rounded-lg"></div>
                    </figure>
                    <div class="card-body items-center text-center">
                        <div class="skeleton h-8 w-1/2 rounded mb-2"></div>
                        <div class="skeleton h-6 w-3/4 rounded"></div>
                        <div class="skeleton h-4 w-2/3 rounded"></div>
                    </div>
                </div>
            </div>
        </template>
        <template v-if="error">
            <div class="text-center py-16">
                <h3 class="text-2xl font-semibold text-error">Failed to load car list.</h3>
                <p class="text-base-content/60 mt-2">{{ error }}</p>
            </div>
        </template>

        <template v-else>
            <div v-if="(cars.data?.length || 0) > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="car in (cars.data || [])" 
                     :key="car.id" 
                     class="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                     @click="navigateTo(`/car/status?vin=${car.vin}`)">
                    <figure class="px-6 pt-6">
                        <img :src="car.picUrl" 
                             :alt="`${car.modelPrefix ? car.modelPrefix : car.modelName}`" 
                             class="w-full h-48 object-contain rounded-lg" 
                             loading="lazy" />
                    </figure>
                    <div class="card-body pt-4">
                        <h2 class="text-md font-bold opacity-[0.4]">{{ car.licenseNo || 'No Plate' }}</h2>
                        <h2 class="text-xl">
                            {{ car.billDate ? new Date(car.billDate).getFullYear() : 'N/A' }}
                        </h2>
                        
                        <h3 v-if="car.modelPrefix" class="text-3xl -mt-2 text-primary font-medium">
                            {{ car.modelPrefix }}
                        </h3>  
                        <h3 v-else class="text-xl -mt-2 text-primary font-medium">
                            {{  car.modelName }}
                        </h3>                       
                        <section v-if="car.stnkTaxDate" class="font-mono">
                            <p class="text-sm">STNK Tax Date: {{ car.stnkTaxDate }} </p>                            <p :class="{ 'text-orange-500': daysUntil(car.stnkTaxDate).warning }">
                                ({{ daysUntil(car.stnkTaxDate).value < 0 ? '' : 'in ' }}{{ Math.abs(daysUntil(car.stnkTaxDate).value) }} {{ daysUntil(car.stnkTaxDate).unit }}{{ daysUntil(car.stnkTaxDate).value < 0 ? ' ago' : '' }})
                            </p>
                        </section>
                        <section v-if="car.stnkExpirationDate" class="font-mono">
                            <p class="text-sm">STNK Expiration Date: {{ car.stnkExpirationDate }} </p>
                            <p :class="{ 'text-orange-500': daysUntil(car.stnkExpirationDate).warning }">
                                ({{ daysUntil(car.stnkExpirationDate).value < 0 ? '' : 'in ' }}{{ Math.abs(daysUntil(car.stnkExpirationDate).value) }} {{ daysUntil(car.stnkExpirationDate).unit }}{{ daysUntil(car.stnkExpirationDate).value < 0 ? ' ago' : '' }})
                            </p>
                        </section>
                        
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-16">
                <h3 class="text-2xl font-semibold text-base-content/70">No cars found</h3>
                <p class="text-base-content/60 mt-2">Your car list is empty</p>
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

const daysUntil = (dateString) => {
    if (!dateString) return { value: 0, unit: 'days', warning: false }
    const today = new Date()
    const targetDate = new Date(dateString)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isNegative = diffDays < 0
    
    // If more than 365 days, show in years
    if (Math.abs(diffDays) >= 365) {
        const years = Math.floor(Math.abs(diffDays) / 365)
        return { value: isNegative ? -years : years, unit: 'years', warning: false }
    }
    
    // If more than 30 days, show in months
    if (Math.abs(diffDays) >= 30) {
        const months = Math.floor(Math.abs(diffDays) / 30)
        return { value: isNegative ? -months : months, unit: 'months', warning: false }
    }
    
    // If days, mark as warning
    return { value: diffDays, unit: 'days', warning: true }
}

onMounted(async () => {
    try {
        
        
        // Wait for auth to be initialized
        while (authStore.isLoading && !authStore.initialized) {
            await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        
        
        if (!authStore.jwt) {
            error.value = 'No authentication token available'
            return
        }
        
        
        
        const response = await fetch(`${config.public.BASE_API_URL}/car/list`, {
            headers: {
                'Authorization': authStore.jwt
            }
        })
        
        
        
        
        if (!response.ok) {
            const errorText = await response.text()
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