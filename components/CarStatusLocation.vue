<template>
    <ClientOnly>
        <div v-if="carStatus?.car.location?.lat && carStatus?.car.location?.lng" class="card bg-base-100 shadow-xl">
            <!-- <div class="card-body">
                <h3 class="card-title">Location</h3> -->
                <div class="h-[400px] w-full rounded-xl overflow-hidden">
                    <LMap ref="map" :useGlobalLeaflet="false" @ready="onMapReady">
                        <LTileLayer
                            :key="isDark"
                            :url="isDark 
                                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'"
                            :attribution="isDark 
                                ? `&copy; <a href='https://carto.com/attributions'>CARTO</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>`
                                : `&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors`"
                            layer-type="base"
                            :name="isDark ? 'Dark Map' : 'Light Map'">
                        </LTileLayer>
                        <LMarker :lat-lng="[carStatus.car.location.lat, carStatus.car.location.lng]">
                            <LPopup>Your car is here!</LPopup>
                        </LMarker>
                    </LMap>
                </div>
                <div class="px-4 py-4">
                    <p v-if="address" class="text-sm">📍 {{ address }}</p>
                    <p v-else-if="isLoadingAddress" class="text-sm">Loading address...</p>
                </div>
            </div>
        <!-- </div> -->
    </ClientOnly>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useColorMode } from '#imports'

const props = defineProps({
    carStatus: {
        type: Object,
        required: true
    }
})

const map = ref(null)
const colorMode = useColorMode()
const isDark = ref(false)

const updateTheme = () => {
    isDark.value = colorMode.value === 'dark'
    if (map.value) {
        const mapEl = map.value.getContainer()
        if (colorMode.value === 'dark') {
            mapEl.style.backgroundColor = '#242424'
            mapEl.style.color = '#fff'
        } else {
            mapEl.style.backgroundColor = '#fff'
            mapEl.style.color = '#222'
        }
    }
}

watch(colorMode, updateTheme, { immediate: true })

onMounted(() => {
    updateTheme()
})

const address = ref('')
const isLoadingAddress = ref(false)

const getAddress = async (lat, lng) => {
    isLoadingAddress.value = true
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        address.value = data.display_name
    } catch (error) {
        console.error('Error fetching address:', error)
        address.value = 'Unable to fetch address'
    } finally {
        isLoadingAddress.value = false
    }
}

// Update address when coordinates change
watch(() => props.carStatus?.car.location, (newLocation) => {
    if (newLocation?.lat && newLocation?.lng) {
        getAddress(newLocation.lat, newLocation.lng)
    }
}, { immediate: true })

const onMapReady = (mapInstance) => {
    map.value = mapInstance
    mapInstance.setView(
        [props.carStatus.car.location.lat, props.carStatus.car.location.lng],
        17
    )
    updateTheme()
}
</script>

<style>
.leaflet-container {
    height: 100%;
    width: 100%;
    transition: background-color 0.3s ease;
}

/* Theme-specific styles for map controls */
[data-theme='dark'] .leaflet-control-zoom,
[data-theme='dark'] .leaflet-control-attribution {
    filter: invert(1) hue-rotate(180deg);
}
</style>
