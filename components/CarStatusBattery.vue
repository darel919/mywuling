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
                        <span v-if="carStatus?.car.battery?.charging && effectiveChargingPower" class="block text-sm text-gray-500 font-normal">
                            <span class="inline-flex items-center gap-2 mt-1">
                                <span>{{ effectiveChargingPower.value }}kW</span>
                                <span v-if="effectiveChargingPower.source === 'calculated'"
                                      class="text-xs badge badge-sm badge-success rounded-none"
                                      title="Charging power data calculated from battery percentage over time">
                                    calculated
                                </span>
                                <span v-else-if="effectiveChargingPower.source === 'reported'"
                                      class="text-xs badge badge-sm badge-info rounded-none"
                                      title="Using estimation data">
                                    estimated
                                </span>
                            </span>
                        </span>
                    </p>
                </div>                
                <div v-if="carStatus?.car.battery?.charging && effectiveChargingPower">
                    <p class="font-bold">Estimated Charge Time</p>
                    <p class="text-success font-bold text-xl">
                        {{ estimatedChargeTime.text }}
                        <span class="block text-sm text-gray-500 font-normal">(done: {{ estimatedChargeTime.completion }})</span>
                    </p>
                </div>                
                <div v-if="carStatus?.car.battery?.charging && effectiveChargingPower && effectiveChargingPower.source === 'calculated' && chargingStats.accuracy > 0" class="col-span-2">
                    <div class="mt-1 text-xs text-success font-semibold">Calculated from data</div>                    
                    <div class="mt-1 text-xs" v-if="chargingStats.accuracy > 0"  :class="{
                        'text-success': chargingStats?.accuracy >= 80,
                        'text-warning': chargingStats?.accuracy >= 60 && chargingStats?.accuracy < 80, 
                        'text-error': chargingStats?.accuracy < 60
                    }">
                        Accuracy: {{ chargingStats?.accuracy || 0 }}% 
                        <span v-if="chargingStats?.dataPoints && chargingStats?.timeWindow" class="ml-1 text-gray-500">
                            ({{ chargingStats.dataPoints }} points over {{ chargingStats.timeWindow }} min)
                        </span>
                    </div>
                    <div class="flex flex-row gap-8 items-center mt-2">
                        <div>
                            <span class="font-bold">10 min charge:</span>
                            <span class="ml-2">
                                <template v-if="chargingStats">+{{ chargingStats.percentGain }}%</template>
                                <template v-else>Calculating…</template>
                            </span>
                        </div>
                        <div v-if="chargingStats && chargingStats.rangeGain !== null">
                            <span class="font-bold">10 min range:</span>
                            <span class="ml-2">+{{ chargingStats.rangeGain }} km</span>
                        </div>
                    </div>
                    <div class="flex flex-row gap-8 items-center mt-1">
                        <div>
                            <span class="font-bold">1 hour charge:</span>
                            <span class="ml-2">
                                <template v-if="chargingStats && chargingStats.hourPercentGain !== null">+{{ chargingStats.hourPercentGain }}%</template>
                                <template v-else>Calculating…</template>
                            </span>
                        </div>
                        <div v-if="chargingStats && chargingStats.hourRangeGain !== null">
                            <span class="font-bold">1 hour range:</span>
                            <span class="ml-2">+{{ chargingStats.hourRangeGain }} km</span>
                        </div>
                    </div>
                </div>
                <!-- Battery Percentage History Chart -->
                <div v-if="carStatus?.car.battery?.charging && effectiveChargingPower && effectiveChargingPower.source === 'calculated' && chartData && batteryHistory.length > 1" class="col-span-2">
                    <p class="font-bold text-base mb-3">Charging History Chart</p>
                    <div class="h-64 w-full mb-2">
                        <Line 
                            :data="chartData" 
                            :options="chartOptions"
                            class="w-full h-full"
                        />
                    </div>
                    <p class="text-xs text-gray-500 italic">
                        Blue line: Normal | Green line: Charging | Chart shows last 24 hours of data
                    </p>
                </div>
                <!-- Rough Charge Time Estimate Accordion -->
                <div v-if="!carStatus?.car.battery?.charging" class="col-span-2">
                    <details>
                        <summary class="cursor-pointer font-bold text-base my-2">Rough Charge Time Estimate</summary>
                        <div class="mt-2">
                            <section class="flex flex-row items-baseline gap-1 flex-wrap mb-2">
                                <label class="block text-sm font-medium mb-1 mr-4">Assumed Charging Power (kW):</label>
                                <input type="number" step="0.1" min="0.1" v-model.number="assumedChargingPower" class="input input-bordered input-sm w-24 mb-2" />
                            </section>
                            <div class="mb-1">
                                <span class="font-bold">Estimated Time to Full Charge:</span>
                                <span class="ml-2">{{ roughChargeEstimate.text }}</span>
                            </div>
                            <p class="text-xs text-gray-500 italic">This is a rough estimate based on your input and may not reflect actual charging times. Actual times may vary depending on charger, battery condition, and other factors.</p>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler
)

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


const batteryHistory = ref([])
const calculatedChargingPower = ref(null)
const powerCalculationWindow = 5 
const graphDataWindow = 24 * 60

const addBatteryDataPoint = (battery) => {
    if (!battery) return
    
    const now = Date.now()
    const currentSoc = battery.soc

    batteryHistory.value.push({
        timestamp: now,
        soc: currentSoc,
        capacity: battery.current_capacity,
        charging: battery.charging
    });    
    const graphWindowMs = graphDataWindow * 60 * 1000
    batteryHistory.value = batteryHistory.value.filter(point => 
        now - point.timestamp <= graphWindowMs
    )    
    if (battery.charging) {
        const powerCalcWindowMs = powerCalculationWindow * 60 * 1000
        const recentData = batteryHistory.value.filter(point => 
            now - point.timestamp <= powerCalcWindowMs && point.charging
        )

        if (recentData.length >= 2) {
            const oldestPoint = recentData[0]
            const newestPoint = recentData[recentData.length - 1]
            
            const timeDiffHours = (newestPoint.timestamp - oldestPoint.timestamp) / (1000 * 60 * 60)
            const capacityChange = newestPoint.capacity - oldestPoint.capacity
            
            if (timeDiffHours > 0 && capacityChange > 0) {
                calculatedChargingPower.value = Math.round((capacityChange / timeDiffHours) * 10) / 10
            }
        }
    } else {
        calculatedChargingPower.value = null
    }
}

watch(() => props.carStatus?.car.battery, (newBattery) => {
    if (!newBattery) {
        return
    }

    addBatteryDataPoint(newBattery)
}, { deep: true, immediate: true })


const effectiveChargingPower = computed(() => {
    const reportedPower = props.carStatus?.car.battery?.charging_power
    const calculated = calculatedChargingPower.value
    

    if (calculated && calculated > 0 && calculated < 50) {
        return {
            value: calculated,
            source: 'calculated',
            confidence: batteryHistory.value.filter(p => p.charging).length >= 3 ? 'high' : 'medium'
        }
    }
    

    if (reportedPower && reportedPower > 0) {
        return {
            value: reportedPower,
            source: 'reported',
            confidence: 'unknown'
        }
    }
    
    return null
})


const chartData = computed(() => {
    if (batteryHistory.value.length < 2) return null

    const data = batteryHistory.value
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(point => ({
            x: new Date(point.timestamp),
            y: point.soc,
            charging: point.charging
        }))

    return {
        datasets: [
            {
                label: 'Battery %',
                data: data,
                borderColor: 'rgb(59, 130, 246)', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: (context) => {
                    return context.parsed.x === data[data.length - 1]?.x ? 4 : 2
                },
                pointHoverRadius: 6,
                segment: {
                    borderColor: (ctx) => {
                        const point = data[ctx.p1DataIndex]
                        return point?.charging ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
                    }
                }
            }
        ]
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'time',
            time: {
                displayFormats: {
                    minute: 'HH:mm',
                    hour: 'HH:mm'
                }
            },
            title: {
                display: true,
                text: 'Time'
            }
        },
        y: {
            beginAtZero: true,
            max: 100,
            title: {
                display: true,
                text: 'Battery %'
            }
        }
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                afterLabel: (context) => {
                    const point = batteryHistory.value.find(p => 
                        Math.abs(new Date(p.timestamp).getTime() - context.parsed.x) < 1000
                    )
                    return point?.charging ? 'Charging' : 'Not charging'
                }
            }
        }
    },
    elements: {
        point: {
            hoverBackgroundColor: 'white'
        }
    }
}

const estimatedChargeTime = computed(() => {
    const power = effectiveChargingPower.value?.value
    if (!power) return { text: 'Calculating...', completion: null }

    const hoursToCharge = (props.carStatus.car.battery.full_capacity - props.carStatus.car.battery.current_capacity) / power
    const minutesToCharge = Math.ceil(hoursToCharge * 60)
    const completionTime = new Date(Date.now() + minutesToCharge * 60 * 1000)

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

const assumedChargingPower = ref(1.5)

const roughChargeEstimate = computed(() => {
    const battery = props.carStatus?.car.battery
    if (!battery || battery.charging) return { text: '-', completion: null }
    const current = battery.current_capacity
    const full = battery.full_capacity
    const power = assumedChargingPower.value
    if (!current || !full || !power || power <= 0) return { text: '-', completion: null }
    const hoursToCharge = (full - current) / power
    if (hoursToCharge <= 0) return { text: 'Already full', completion: null }
    const minutesToCharge = Math.ceil(hoursToCharge * 60)
    let timeText
    if (minutesToCharge < 60) {
        timeText = `${minutesToCharge} minutes`
    } else {
        const hours = Math.floor(hoursToCharge)
        const minutes = Math.round((hoursToCharge - hours) * 60)
        timeText = minutes > 0 ? `${hours} hours ${minutes} minutes` : `${hours} hours`
    }
    return { text: timeText, completion: null }
})

const chargingStats = computed(() => {
    if (!props.carStatus?.car.battery?.charging || batteryHistory.value.length < 2) return null
    
    const now = Date.now()
    const dataWindowMs = 10 * 60 * 1000
    const minDataTimeMs = 2 * 60 * 1000
    
    const recentData = batteryHistory.value.filter(point => 
        now - point.timestamp <= dataWindowMs && point.charging
    )
    
    if (recentData.length < 2) return null
    
    const oldest = recentData[0]
    const newest = recentData[recentData.length - 1]    
    const timeElapsedMs = newest.timestamp - oldest.timestamp
    
    if (timeElapsedMs < minDataTimeMs) return null
      const timeElapsedMinutes = timeElapsedMs / (1000 * 60)
    const actualPercentGain = newest.soc - oldest.soc
    
    const ratePerMinute = actualPercentGain / timeElapsedMinutes
    
    const projectedTenMinGain = ratePerMinute * 10    
    const projectedHourGain = ratePerMinute * 60
    
    const tenMinRangeGain = props.carStatus.car.battery.range_wltp && projectedTenMinGain > 0
        ? Math.round((props.carStatus.car.battery.range_wltp / 100) * projectedTenMinGain * 100) / 100
        : null
          const hourRangeGain = props.carStatus.car.battery.range_wltp && projectedHourGain > 0
        ? Math.round((props.carStatus.car.battery.range_wltp / 100) * projectedHourGain * 100) / 100
        : null
    
    return {
        percentGain: Math.round(projectedTenMinGain * 100) / 100,
        rangeGain: tenMinRangeGain,
        hourPercentGain: Math.round(projectedHourGain * 100) / 100,
        hourRangeGain: hourRangeGain,
        accuracy: calculateAccuracy(recentData, timeElapsedMinutes, actualPercentGain),
        dataPoints: recentData.length,
        timeWindow: Math.round(timeElapsedMinutes * 10) / 10
    }
})

const calculateAccuracy = (dataPoints, timeElapsedMinutes, percentGain) => {
    const dataPointCount = dataPoints.length
    const timeWindow = timeElapsedMinutes
    const changeRate = Math.abs(percentGain)
      let accuracy = 0
    
    const timeScore = Math.min(timeWindow / 10, 1) * 40
    
    const dataPointsPerMinute = dataPointCount / timeWindow
    const densityScore = Math.min(dataPointsPerMinute / 2, 1) * 30
      let changeScore = 0
    if (changeRate >= 0.05) {
        if (changeRate <= 2.0) {
            changeScore = 30
        } else {
            changeScore = Math.max(30 - (changeRate - 2.0) * 5, 10)
        }
    } else {
        changeScore = 10
    }
      accuracy = timeScore + densityScore + changeScore
    
    return Math.min(Math.max(Math.round(accuracy), 20), 100)
}
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
