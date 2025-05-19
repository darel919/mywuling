<template>
    <div v-if="carInfo?.car.isEV" class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Battery Status</h3>
            <div class="grid grid-cols-2 gap-4">                            
                <div class="col-span-2">
                    <p class="font-bold mb-2">Charge Level</p>                                
                    <progress 
                        class="progress w-full" 
                        :class="{
                            'progress-error': !carStatus?.car.battery?.charging && carStatus?.car.battery?.soc <= 20,
                            'progress-warning': !carStatus?.car.battery?.charging && carStatus?.car.battery?.soc > 20 && carStatus?.car.battery?.soc <= 50,
                            'progress-success': !carStatus?.car.battery?.charging && carStatus?.car.battery?.soc > 50,
                            'progress-secondary': carStatus?.car.battery?.charging
                        }" 
                        :value="carStatus?.car.battery?.soc" 
                        max="100"
                    ></progress>
                    <p class="text-right mt-1">{{ carStatus?.car.battery?.soc }}%</p>
                </div>
                <div>
                    <p class="font-bold">Estimated Range</p>
                    <p class="text-2xl font-mono" :title="`This estimated range is being calculated according to WLTP standards. \n\nWLTP is generally considered a superior vehicle testing standard compared to CLTC because its cycle is designed to more accurately reflect diverse global real-world driving conditions with a wider range of speeds and more dynamic phases, promoting international harmonization and facilitating easier performance comparisons across markets.`">{{ carStatus?.car.battery?.range_wltp }} km </p>
                    <p class="text-sm text-gray-500">{{ carStatus?.car.battery?.range }} km (CLTC)</p>
                </div>
                <div>
                    <p class="font-bold">Charging Status</p>
                    <p>{{ carStatus?.car.battery?.charging ? 'Charging' : 'Not Charging' }}</p>
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
    carStatus: {
        type: Object,
        required: true
    }
})
</script>
