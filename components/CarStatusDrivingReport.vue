<template>
    <div v-if="carInfo?.car.isEV && drivingReport" class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Driving Report</h3>
            <p class="text-sm text-gray-500 mb-4">
                {{ new Date(drivingReport.report.beginDate).toLocaleDateString() }} - 
                {{ new Date(drivingReport.report.endDate).toLocaleDateString() }}
            </p>
            <div class="grid grid-cols-2 gap-6">
                <!-- Charging Stats -->
                <div class="space-y-4">
                    <div>
                        <p class="font-bold mb-2">Total Charged</p>
                        <p class="text-2xl font-mono">{{ drivingReport.report.charging.total_charged }} kWh</p>
                        <p class="text-sm text-gray-500">Rank: {{ drivingReport.report.charging.rank_charged }}</p>
                    </div>
                    <div>
                        <p class="font-bold mb-2">Total Charging Time</p>
                        <p class="text-xl">{{ Math.floor(drivingReport.report.charging.total_charging_time / 60) }}h {{ drivingReport.report.charging.total_charging_time % 60 }}m</p>
                    </div>
                </div>
                <!-- Mileage Stats -->
                <div class="space-y-4">
                    <div>
                        <p class="font-bold mb-2">Total Mileage</p>
                        <p class="text-2xl font-mono">{{ drivingReport.report.mileage.total_mileage }} km</p>
                        <p class="text-sm text-gray-500">Rank: {{ drivingReport.report.mileage.rank_mileage }}</p>
                    </div>
                    <div>
                        <p class="font-bold mb-2">Total Driving Time</p>
                        <p class="text-xl">{{ Math.floor(drivingReport.report.mileage.total_driving_time / 60) }}h {{ drivingReport.report.mileage.total_driving_time % 60 }}m</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    carInfo: {
        type: Object,
        required: true
    },
    drivingReport: {
        type: Object,
        required: true
    }
})
</script>
