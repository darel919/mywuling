<template>    
    <div class="container py-4 px-6 sm:px-24 mx-auto min-h-screen">        
        <!-- Breadcrumb -->
        <div class="text-sm breadcrumbs mb-6">
            <ul>
                <li><NuxtLink to="/">Home</NuxtLink></li>
                <li><NuxtLink :to="`/car/status?vin=${serviceDetails?.ownerInfo?.vin}`">Car Status</NuxtLink></li>
                <li><NuxtLink :to="`/car/service/history?vin=${serviceDetails?.ownerInfo?.vin}`">Service History</NuxtLink></li>
                <li><b>Service Details: #{{ serviceDetails?.serviceWorkOrder?.no || '' }}</b></li>
            </ul>
        </div>

        <template v-if="loading">
            <div class="space-y-6">
                <div class="card bg-base-100 shadow-xl animate-pulse">
                    <div class="card-body">
                        <div class="h-6 bg-base-300 rounded w-1/3 mb-4"></div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div v-for="i in 4" :key="i" class="space-y-2">
                                <div class="h-4 bg-base-300 rounded w-1/4"></div>
                                <div class="h-3 bg-base-300 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else-if="error">
            <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 9 9 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{{ error }}</span>
            </div>
        </template>        
        <div v-else class="space-y-6">
                <!-- Owner Information -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title mb-4">Vehicle & Owner Information</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <p class="font-bold text-sm text-base-content/70">Model</p>
                                <p>{{ serviceDetails.ownerInfo.model_code }}</p>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-base-content/70">License Plate</p>
                                <p>{{ serviceDetails.ownerInfo.license }}</p>
                            </div>
                        </div>
                        
                        <div class="collapse collapse-arrow bg-base-200">
                            <input type="checkbox" /> 
                            <div class="collapse-title font-medium">
                                Additional Details
                            </div>
                            <div class="collapse-content">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div>
                                        <p class="font-bold text-sm text-base-content/70">VIN</p>
                                        <p>{{ serviceDetails.ownerInfo.vin }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold text-sm text-base-content/70">Owner</p>
                                        <p>{{ serviceDetails.ownerInfo.owner }}</p>
                                        <p class="text-primary">{{ serviceDetails.ownerInfo.owner_phone }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold text-sm text-base-content/70">Engine Number</p>
                                        <p class="font-mono">{{ serviceDetails.ownerInfo.engine_no }}</p>
                                    </div>
                                    <div>
                                        <p class="font-bold text-sm text-base-content/70">Sales Date</p>
                                        <p>{{ formatDate(serviceDetails.ownerInfo.sales_date_str) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Work Order Information -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <div class="flex justify-between items-start mb-4">
                            <h2 class="card-title">Work Order #{{ serviceDetails.serviceWorkOrder.no }}</h2>
                            <span class="badge badge-primary">{{ serviceDetails.serviceWorkOrder.type }}</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p class="font-bold text-sm text-base-content/70">Service Date</p>
                                <p>{{ formatDate(serviceDetails.serviceWorkOrder.created_date_str) }}</p>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-base-content/70">End Time</p>
                                <p>{{ formatDate(serviceDetails.serviceWorkOrder.end_time_str) }}</p>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-base-content/70">Service Advisor</p>
                                <p>{{ serviceDetails.serviceWorkOrder.advisor }}</p>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-base-content/70">Repair Type</p>
                                <p>{{ serviceDetails.serviceWorkOrder.repair_type_code }}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="font-bold text-sm text-base-content/70">Customer Description</p>
                                <p class="whitespace-pre-wrap">{{ serviceDetails.serviceWorkOrder.customer_desc }}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="font-bold text-sm text-base-content/70">Trouble Description</p>
                                <p class="whitespace-pre-wrap">{{ serviceDetails.serviceWorkOrder.trouble_desc }}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="font-bold text-sm text-base-content/70">Remarks</p>
                                <p class="whitespace-pre-wrap">{{ serviceDetails.serviceWorkOrder.remark }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Labour Orders -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title mb-4">Labour Orders</h2>
                        <div v-if="serviceDetails.serviceLabourOrder.length > 0" class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Labour</th>
                                        <th>Technician</th>
                                        <th>Work Type</th>
                                        <th>Status</th>
                                        <th class="text-right">Price</th>
                                        <th class="text-right">Discount</th>
                                        <th class="text-right">Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="labour in serviceDetails.serviceLabourOrder" :key="labour.labour_code">
                                        <td>
                                            {{ labour.labour_name }}
                                            <br>
                                            <span class="text-sm text-gray-500">{{ labour.labour_code }}</span>
                                        </td>
                                        <td>{{ labour.technician }}</td>
                                        <td>{{ labour.work_type || '-' }}</td>
                                        <td>{{ labour.assign_tag }}</td>
                                        <td class="text-right font-mono">
                                            {{ formatCurrency(labour.work_hour_price) }}
                                        </td>
                                        <td class="text-right font-mono">
                                            <span v-if="labour.discount_rate && labour.discount_rate > 0">{{ (labour.discount_rate * 100).toFixed(0) }}%<br><span class="text-xs text-gray-400">-{{ formatCurrency(labour.discount_money) }}</span></span>
                                            <span v-else>-</span>
                                        </td>
                                        <td class="text-right font-mono">{{ formatCurrency(labour.receive_money || (labour.work_hour_price - (labour.discount_money || 0))) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p v-else class="text-gray-500">No labour orders recorded</p>
                    </div>
                </div>                
                <!-- Spare Parts -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title mb-4">Spare Parts</h2>
                        <div v-if="normalizedSpareParts.length > 0 && normalizedSpareParts.some(part => part.part_no)" class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Quantity</th>
                                        <th class="text-right">Original Price</th>
                                        <th class="text-right">Discount</th>
                                        <th class="text-right">Final Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="part in normalizedSpareParts.filter(p => p.part_no)" :key="part.part_no">
                                        <td>
                                            {{ part.part_name }}
                                            <br>
                                            <span class="text-sm text-gray-500">{{ part.part_no }}</span>
                                        </td>
                                        <td>{{ part.quantity }}</td>
                                        <td class="text-right font-mono">{{ formatCurrency(part.originalPrice) }}</td>
                                        <td class="text-right font-mono">
                                            <span v-if="part.discount && part.discount > 0">{{ (part.discount * 100).toFixed(0) }}%<br><span class="text-xs text-gray-400">-{{ formatCurrency(part.discountMoney) }}</span></span>
                                            <span v-else>-</span>
                                        </td>
                                        <td class="text-right font-mono">{{ formatCurrency(part.finalPrice) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p v-else class="text-gray-500">No spare parts changed</p>
                    </div>
                </div>

                <!-- Additional Items -->
                <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title mb-4">Additional Items</h2>
                        <div v-if="normalizedAddItemList.length > 0" class="overflow-x-auto">
                            <table class="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th class="text-right">Price</th>
                                        <th class="text-right">Discount</th>
                                        <th class="text-right">Final</th>
                                        <th>Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in normalizedAddItemList" :key="item.item_code">
                                        <td>
                                            {{ item.item_name }}
                                            <br>
                                            <span class="text-sm text-gray-500">{{ item.item_code }}</span>
                                        </td>
                                        <td>{{ item.quantity }}</td>
                                        <td class="text-right font-mono">{{ formatCurrency(item.price) }}</td>
                                        <td class="text-right font-mono">
                                            <span v-if="item.discountAmount && item.discountAmount > 0">-{{ formatCurrency(item.discountAmount) }}</span>
                                            <span v-else>-</span>
                                        </td>
                                        <td class="text-right font-mono">{{ formatCurrency(item.receivableAmount || (item.price - (item.discountAmount || 0))) }}</td>
                                        <td>
                                            <span v-if="item.remark">{{ item.remark }}</span>
                                            <span v-else>-</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p v-else class="text-gray-500">No additional items</p>
                    </div>
                </div>                
                <!-- Total Cost -->
                <div class="card bg-base-100 shadow-xl mt-6">
                    <div class="card-body">
                        <div class="flex justify-between items-baseline w-full mb-4">
                            <h2 class="card-title text-xl">Total Cost</h2>
                            <div class="font-mono text-2xl tabular-nums">{{ formatCurrency(getTotalCost()) }}</div>
                        </div>
                        <div class="grid grid-cols-1 gap-4 mt-4">
                            <div>
                                <p class="font-bold text-sm text-base-content/70">Labour Cost</p>
                                <div class="flex flex-col">
                                    <div class="flex justify-between">
                                        <span class="font-mono text-gray-500">Original:</span>
                                        <span class="font-mono">{{ formatCurrency(getTotalLabourCost()) }}</span>
                                    </div>
                                    <div v-if="getTotalLabourDiscount() > 0" class="flex justify-between">
                                        <span class="font-mono text-gray-500">Discount:</span>
                                        <span class="font-mono text-gray-500">-{{ formatCurrency(getTotalLabourDiscount()) }}</span>
                                    </div>
                                    <div class="flex justify-between font-bold">
                                        <span class="font-mono">Net:</span>
                                        <span class="font-mono">{{ formatCurrency(getTotalLabourCost() - getTotalLabourDiscount()) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-if="getOriginalPartsCost() > 0">
                                <p class="font-bold text-sm text-base-content/70">Parts Cost</p>
                                <div class="flex flex-col">
                                    <div class="flex justify-between">
                                        <span class="font-mono text-gray-500">Original:</span>
                                        <span class="font-mono">{{ formatCurrency(getOriginalPartsCost()) }}</span>
                                    </div>
                                    <div v-if="getTotalPartsDiscount() > 0" class="flex justify-between">
                                        <span class="font-mono text-gray-500">Discount:</span>
                                        <span class="font-mono text-gray-500">-{{ formatCurrency(getTotalPartsDiscount()) }}</span>
                                    </div>
                                    <div class="flex justify-between font-bold">
                                        <span class="font-mono">Net:</span>
                                        <span class="font-mono">{{ formatCurrency(getTotalPartsCost()) }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-if="getTotalAdditionalItemsCost() > 0">
                                <p class="font-bold text-sm text-base-content/70">Additional Items</p>
                                <p class="font-mono">{{ formatCurrency(getTotalAdditionalItemsCost()) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const serviceDetails = ref(null)

// Helper to normalize addItemList for display and calculation
const normalizedAddItemList = computed(() => {
    if (!serviceDetails.value?.addItemList) return []
    return serviceDetails.value.addItemList.map(item => ({
        item_code: item.addItemCode || item.item_code,
        item_name: item.addItemName || item.item_name,
        price: item.addItemAmount || item.price || 0,
        quantity: item.quantity || 1,
        discountAmount: item.discountAmount || 0,
        receivableAmount: item.receivableAmount || 0,
        remark: item.remark || ''
    }))
})

// Helper to normalize spareParts for display and calculation
const normalizedSpareParts = computed(() => {
    if (!serviceDetails.value?.spareParts) return []
    return serviceDetails.value.spareParts.map(part => ({
        part_no: part.partCoNo || part.part_no,
        part_name: part.partName || part.part_name,
        quantity: part.partQuantity || part.quantity || 1,
        originalPrice: part.partSalesPrice || 0,
        discount: part.discount || 0,
        discountMoney: part.discountMoneyShow || 0,
        finalPrice: part.afterDiscountAmount || 0
    }))
})

function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleString()
    } catch {
        return dateStr
    }
}

function getTotalLabourCost() {
    if (!serviceDetails.value?.serviceLabourOrder) return 0
    return serviceDetails.value.serviceLabourOrder
        .reduce((total, labour) => total + (labour.work_hour_price || 0), 0)
}

function getTotalLabourDiscount() {
    if (!serviceDetails.value?.serviceLabourOrder) return 0
    return serviceDetails.value.serviceLabourOrder
        .reduce((total, labour) => total + (labour.discount_money || 0), 0)
}

function getTotalPartsCost() {
    if (!normalizedSpareParts.value.length) return 0
    return normalizedSpareParts.value
        .reduce((total, part) => total + (part.finalPrice || 0), 0)
}

function getOriginalPartsCost() {
    if (!normalizedSpareParts.value.length) return 0
    return normalizedSpareParts.value
        .reduce((total, part) => total + (part.originalPrice || 0), 0)
}

function getTotalPartsDiscount() {
    if (!normalizedSpareParts.value.length) return 0
    return normalizedSpareParts.value
        .reduce((total, part) => total + (part.discountMoney || 0), 0)
}

function getTotalAdditionalItemsCost() {
    if (!normalizedAddItemList.value.length) return 0
    return normalizedAddItemList.value
        .reduce((total, item) => 
            total + ((item.price || 0) * (item.quantity || 1)), 0)
}

function getTotalCost() {
    if (!serviceDetails.value?.serviceWorkOrder) return 0
    
    return (getTotalLabourCost() - getTotalLabourDiscount()) + 
           getTotalPartsCost() + 
           getTotalAdditionalItemsCost()
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

async function fetchServiceDetails() {
    const workOrder = route.query.work_order
    if (!workOrder) {
        error.value = 'No work order provided'
        loading.value = false
        return
    }

    loading.value = true
    error.value = null

    try {
        const response = await fetch(`${config.public.BASE_API_URL}/car/service/history/detail?serviceId=${workOrder}`, {
            headers: {
                'Authorization': `${authStore.jwt}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to fetch service details')
        }
        
        serviceDetails.value = await response.json()
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchServiceDetails()
})

watch(() => serviceDetails.value?.serviceWorkOrder?.no, (orderNo) => {
    useHead({
        title: orderNo ? `Service Order #${orderNo} -dws-myWULING` : 'Service Details -dws-myWULING'
    })
}, { immediate: true })
</script>
