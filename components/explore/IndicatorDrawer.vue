<template>
    <UDrawer v-model:open="isOpen">
        <template #body>
            <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <h2 class="text-lg font-semibold">Add Indicator</h2>
                </template>

                <div v-if="!store.availableIndicators" class="text-center">Loading...</div>
                <div v-else class="space-y-4">
                    <UInput v-model="searchQuery" placeholder="Search indicators..." icon="i-heroicons-magnifying-glass" />

                    <div v-for="(group, groupName) in filteredIndicators" :key="groupName">
                        <h3 class="font-semibold text-gray-500 mb-2">{{ groupName }}</h3>
                        <ul class="space-y-1">
                            <li
                                v-for="indicator in group"
                                :key="indicator.alias"
                                class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                @click="selectIndicator(indicator)"
                            >
                                {{ indicator.name }}
                            </li>
                        </ul>
                    </div>
                </div>
            </UCard>

            <UModal v-model:open="isConfigModalOpen">
                <template #header>
                    <h3 class="text-lg font-semibold">Configure {{ selectedIndicator.name }}</h3>
                </template>

                <template #body>
                    <BacktestFormParameterEditor :inputs="selectedIndicator.inputs" v-model="indicatorParams" />
                </template>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton color="neutral" variant="ghost" @click="isConfigModalOpen = false">Cancel</UButton>
                        <UButton @click="addIndicator">Add Indicator</UButton>
                    </div>
                </template>
            </UModal>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
const store = useChartExplorerStore();
const isOpen = defineModel<boolean>('open');

const searchQuery = ref('');
const isConfigModalOpen = ref(false);
const selectedIndicator = ref<AvailableIndicator | null>(null);
const indicatorParams = ref<Record<string, any>>({});

const filteredIndicators = computed(() => {
    if (!store.availableIndicators) return {};
    const query = searchQuery.value.toLowerCase();

    const filterGroup = (group: AvailableIndicator[]) =>
        group.filter(ind => ind.name.toLowerCase().includes(query) || ind.alias.toLowerCase().includes(query));

    return {
        'Built-in': filterGroup(store.availableIndicators.builtIn),
        'Custom': filterGroup(store.availableIndicators.custom),
    };
});

function selectIndicator(indicator: AvailableIndicator) {
    selectedIndicator.value = indicator;
    indicatorParams.value = {};
    indicator.inputs.forEach(input => {
        indicatorParams.value[input.name] = input.defaultValue;
    });
    isConfigModalOpen.value = true;
}

function addIndicator() {
    if (!selectedIndicator.value) return;

    const config: IndicatorConfig = {
        key: `${selectedIndicator.value.alias}_${Date.now()}`, // Unique key
        type: selectedIndicator.value.type,
        function: selectedIndicator.value.alias,
        params: indicatorParams.value,
        source: 'close', // Default, could be made configurable
    };

    store.addIndicator(config);
    isConfigModalOpen.value = false;
    isOpen.value = false;
}
</script>
