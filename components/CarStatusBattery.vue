<template>
    <div v-if="carInfo?.car.isEV" class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Battery Status</h3>
            <div class="grid grid-cols-2 gap-4">                            
                <div class="col-span-2">
                    <p class="font-bold mb-3">Charge Level</p>                                
                    <progress 
                        v-if="!carStatus?.car.battery?.charging"
                        class="relative progress w-full rounded-xl" 
                        :class="{
                            'progress-error': carStatus?.car.battery?.soc <= 20,
                            'progress-warning': carStatus?.car.battery?.soc > 20 && carStatus?.car.battery?.soc <= 50,
                            'progress-success': carStatus?.car.battery?.soc > 50
                        }" 
                        :value="carStatus?.car.battery?.soc" 
                        max="100"
                    ></progress>
                    <div v-else class="relative w-full h-2 rounded-xl bg-base-200">
                        <div 
                            class="absolute left-0 top-0 h-full rounded bg-accent transition-all duration-300 flex items-center"
                            :style="`width: ${carStatus?.car.battery?.soc || 0}%; min-width: 16px;`"
                        >
                            <div class="w-full h-full animate-battery-wave" style="background: repeating-linear-gradient(-60deg,rgba(255,255,255,0.25) 0 8px,transparent 8px 16px); opacity:0.7;"></div>
                        </div>
                    </div>
                    <p class="text-right mt-1">{{ carStatus?.car.battery?.soc }}%</p>
                </div>
                <div>
                    <p class="font-bold">Estimated Range</p>
                    <p class="text-2xl font-mono" :title="`This estimated range is being calculated according to WLTP standards. \n\nWLTP is generally considered a superior vehicle testing standard compared to CLTC because its cycle is designed to more accurately reflect diverse global real-world driving conditions with a wider range of speeds and more dynamic phases, promoting international harmonization and facilitating easier performance comparisons across markets.`">{{ carStatus?.car.battery?.range_wltp }} km </p>
                    <p class="text-sm text-gray-500">{{ carStatus?.car.battery?.range }} km (CLTC)</p>
                </div>
                <div>
                    <p class="font-bold">Capacity</p>
                    <section class="flex flex-row items-baseline gap-1 flex-wrap">
                        <span class="text-2xl font-mono whitespace-nowrap">{{ carStatus?.car.battery?.current_capacity }}<span class="text-base">kW</span></span>
                        <span class="text-xl font-mono mx-1">/</span>
                        <span class="text-base font-mono -mt-2 sm:mt-0 text-gray-500 whitespace-nowrap">{{ carStatus?.car.battery?.full_capacity }}kW</span>
                    </section>
                </div>
                <div>
                    <p class="font-bold">Charging Status</p>
                    <p :class="carStatus?.car.battery?.charging ? 'text-success font-bold text-xl' : ''">
                        {{ carStatus?.car.battery?.charging ? 'Charging' : 'Not Charging' }}
                        <span v-if="carStatus?.car.battery?.charging && carStatus?.car.battery?.charging_power" class="block text-sm text-gray-500 font-normal">
                            {{ carStatus.car.battery.charging_power }}kW
                        </span>
                    </p>
                </div>
                <div v-if="carStatus?.car.battery?.charging && carStatus?.car.battery?.charging_power">
                    <p class="font-bold">Estimated Charge Time</p>
                    <p class="text-success font-bold text-xl">
                        {{ estimatedChargeTime.text }}
                        <span class="block text-sm text-gray-500 font-normal">(done: {{ estimatedChargeTime.completion }})</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    carInfo: {
        type: Object,
        required: true
    },
    carStatus: {
        type: Object,
        required: true
    }
})

const estimatedChargeTime = computed(() => {
    if (!props.carStatus?.car.battery?.charging_power) return { text: 'Calculating...', completion: null }

    const hoursToCharge = (props.carStatus.car.battery.full_capacity - props.carStatus.car.battery.current_capacity) / props.carStatus.car.battery.charging_power
    const minutesToCharge = Math.ceil(hoursToCharge * 60)
    const completionTime = new Date(Date.now() + minutesToCharge * 60 * 1000)

    // Format completion time
    const timeFormat = new Intl.DateTimeFormat('en', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    })
    const dateFormat = new Intl.DateTimeFormat('en', { 
        month: 'short',
        day: 'numeric' 
    })

    const isToday = new Date().toDateString() === completionTime.toDateString()
    const isTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString() === completionTime.toDateString()
    
    let timeText
    let completionText

    if (minutesToCharge < 60) {
        timeText = `${minutesToCharge} minutes`
    } else {
        const hours = Math.floor(hoursToCharge)
        const minutes = Math.round((hoursToCharge - hours) * 60)
        timeText = minutes > 0 ? `${hours} hours ${minutes} minutes` : `${hours} hours`
    }

    if (isToday) {
        completionText = `today at ${timeFormat.format(completionTime)}`
    } else if (isTomorrow) {
        completionText = `tomorrow at ${timeFormat.format(completionTime)}`
    } else {
        completionText = `${dateFormat.format(completionTime)} at ${timeFormat.format(completionTime)}`
    }

    return {
        text: timeText,
        completion: completionText
    }
})
</script>

<style scoped>
@keyframes battery-wave {
  0% { background-position-x: 0; }
  100% { background-position-x: 60px; }
}
.animate-battery-wave {
  animation: battery-wave 1.2s linear infinite;
}
</style>
