<template>
    <div v-if="carStatus?.car.car_status" class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Vehicle Status</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="font-bold">Doors</p>
                    <p class="capitalize" :class="{
                        'text-warning': (carStatus?.car.car_status?.ignition === 'off' && carStatus?.car.car_status?.door !== 'locked') ||
                                       (carStatus?.car.car_status?.ignition === 'on' && carStatus?.car.car_status?.door !== 'locked'),
                        'text-success': carStatus?.car.car_status?.ignition === 'off' && carStatus?.car.car_status?.door === 'locked'
                    }">{{ carStatus?.car.car_status?.door }}</p>
                </div>
                <div>
                    <p class="font-bold">Ignition</p>
                    <p class="capitalize" :class="{
                        'text-content': carStatus?.car.car_status?.ignition === 'off', 
                        'text-success': carStatus?.car.car_status?.ignition === 'on' 
                    }">{{ carStatus?.car.car_status?.ignition }}</p>
                </div>
                <div>
                    <p class="font-bold">Trunk</p>
                    <p class="capitalize" :class="{
                        'text-warning': (carStatus?.car.car_status?.ignition === 'off' && carStatus?.car.car_status?.trunk_ajar !== 'closed') ||
                                       (carStatus?.car.car_status?.ignition === 'on' && carStatus?.car.car_status?.trunk_ajar !== 'closed'),
                        'text-success': carStatus?.car.car_status?.ignition === 'off' && carStatus?.car.car_status?.trunk_ajar === 'closed'
                    }">{{ carStatus?.car.car_status?.trunk_ajar }}</p>
                </div>
                <div>
                    <p class="font-bold">Windows</p>
                    <p class="capitalize" :class="{
                        'text-warning': (carStatus?.car.car_status?.ignition === 'off' && carStatus?.car.car_status?.window_ajar !== 'closed') ||
                                       (carStatus?.car.car_status?.ignition === 'on' && carStatus?.car.car_status?.window_ajar !== 'closed'),
                        'text-success': carStatus?.car.car_status?.ignition === 'off' && carStatus?.car.car_status?.window_ajar === 'closed'
                    }">{{ carStatus?.car.car_status?.window_ajar }}</p>
                </div>
                <div>
                    <p class="font-bold">Lights</p>
                    <p :class="{
                        'text-success': carStatus?.car.car_status?.ignition === 'off' && 
                                      !carStatus?.car.car_status?.lights?.lowBeam && 
                                      !carStatus?.car.car_status?.lights?.highBeam,
                        'text-warning': carStatus?.car.car_status?.ignition === 'off' && 
                                       (carStatus?.car.car_status?.lights?.lowBeam || carStatus?.car.car_status?.lights?.highBeam)
                    }">
                        {{ carStatus?.car.car_status?.lights?.lowBeam ? 'Low Beam On' : '' }}
                        {{ carStatus?.car.car_status?.lights?.highBeam ? 'High Beam On' : '' }}
                        {{ !carStatus?.car.car_status?.lights?.lowBeam && !carStatus?.car.car_status?.lights?.highBeam ? 'Off' : '' }}
                    </p>
                </div>
                <div>
                    <p class="font-bold">Odometer</p>
                    <p>{{ carStatus?.car.odometer }} km</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    carStatus: {
        type: Object,
        required: true
    }
})
</script>
