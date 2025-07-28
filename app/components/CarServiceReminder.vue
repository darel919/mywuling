<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Service Reminder</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Last Service</p>
                    <p class="font-semibold">{{ lastServiceDate || 'No service record' }}</p>
                </div>                
                <div>
                    <p class="text-sm text-gray-500">Next Service</p>
                    <p :class="{'text-orange-500 font-bold': isNearingService, 'font-semibold': !isNearingService }">
                        {{ nextServiceDate || 'Not scheduled' }}
                        <span v-if="daysUntilService !== null" class="text-sm block">
                            ({{ daysUntilService }} days remaining)
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()

// Props and state
const props = defineProps({
    vin: {
        type: String,
        required: true
    }
})

const lastServiceDate = ref(null)
const nextServiceDate = ref(null)
const nextServiceTimestamp = ref(null)
const loading = ref(false)
const error = ref(null)

const daysUntilService = computed(() => {
    if (!nextServiceTimestamp.value) return null
    const now = new Date()
    const diff = nextServiceTimestamp.value - now
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const isNearingService = computed(() => {
    if (daysUntilService.value === null) return false
    return daysUntilService.value <= 14 && daysUntilService.value > 0
})


async function fetchServiceHistory() {
    if (!props.vin) {
        error.value = 'No VIN provided'
        return
    }

    if (!authStore.jwt) {
        error.value = 'Not authorized. Please log in again.'
        loading.value = false
        return
    }

    loading.value = true
    error.value = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/service/history?vin=${props.vin}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch service history')
        }
          const history = await response.json()
        if (history && history.length > 0) {
            // Parse the date in DD-MM-YYYY HH:mm format
            const [datePart, timePart] = history[0].service_start_time.split(' ')
            const [day, month, year] = datePart.split('-')
            const lastDate = new Date(`${year}-${month}-${day}T${timePart}`)
            
            lastServiceDate.value = lastDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })            // Calculate next service date (6 months from last service)
            const nextDate = new Date(lastDate) // Use the correctly parsed lastDate
            nextDate.setMonth(nextDate.getMonth() + 6)
            nextServiceTimestamp.value = nextDate
            nextServiceDate.value = nextDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}


onMounted(fetchServiceHistory)
</script>
