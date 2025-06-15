<template>
    <div class="space-y-6">
        <div v-if="store.isLoading" class="flex items-center justify-center h-96">
            <div class="flex flex-col items-center gap-2">
                <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
                <p class="text-sm text-gray-500">{{ t('data.inspect.loading') }}</p>
            </div>
        </div>

        <div v-else-if="store.inspectResult" class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold">{{ t('data.inspect.title') }}</h2>
                <p class="text-gray-500 dark:text-gray-400">{{ t('data.inspect.subtitle', { symbol, timeframe, exchange: exchangeId }) }}</p>
            </div>

            <UAlert
                :icon="validationStatus.icon"
                :color="validationStatus.color"
                :title="validationStatus.title"
                :description="store.inspectResult.validation.message"
                variant="soft"
            />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataInspectInfoCard :title="t('data.inspect.fileInfo')" :items="fileInfo" />
                <DataInspectInfoCard :title="t('data.inspect.headerInfo')" :items="store.inspectResult.header" />
            </div>

            <div>
                <h3 class="text-xl font-semibold mb-3">{{ t('data.inspect.dataSample') }}</h3>
                <div class="space-y-4">
                    <DataInspectSampleTable :title="t('data.inspect.head')" :data="store.inspectResult.sample.head" />
                    <DataInspectSampleTable :title="t('data.inspect.tail')" :data="store.inspectResult.sample.tail" />
                </div>
            </div>

            <div v-if="store.inspectResult.validation.status !== 'skipped'">
                <h3 class="text-xl font-semibold mb-3">{{ t('data.inspect.validation.title') }}</h3>
                <div class="space-y-4">
                    <UCard>
                        <template #header><h4 class="font-semibold text-base">{{ t('data.inspect.gaps') }}</h4></template>
                        <pre v-if="store.inspectResult.validation.gaps && store.inspectResult.validation.gaps.length > 0" class="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{{ store.inspectResult.validation.gaps }}</pre>
                        <p v-else class="text-sm text-gray-500">{{ t('data.inspect.noIssues') }}</p>
                    </UCard>
                    <UCard>
                        <template #header><h4 class="font-semibold text-base">{{ t('data.inspect.duplicates') }}</h4></template>
                        <pre v-if="store.inspectResult.validation.duplicates && store.inspectResult.validation.duplicates.length > 0" class="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{{ store.inspectResult.validation.duplicates }}</pre>
                        <p v-else class="text-sm text-gray-500">{{ t('data.inspect.noIssues') }}</p>
                    </UCard>
                    <UCard>
                        <template #header><h4 class="font-semibold text-base">{{ t('data.inspect.outOfOrder') }}</h4></template>
                        <pre v-if="store.inspectResult.validation.outOfOrder && store.inspectResult.validation.outOfOrder.length > 0" class="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded-md">{{ store.inspectResult.validation.outOfOrder }}</pre>
                        <p v-else class="text-sm text-gray-500">{{ t('data.inspect.noIssues') }}</p>
                    </UCard>
                </div>
            </div>
        </div>

        <UAlert
            v-else-if="store.status === 'error'"
            icon="i-heroicons-exclamation-circle-20-solid"
            color="error"
            title="Could not load inspection data"
            description="The requested dataset could not be found or an error occurred during processing."
        />
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const store = useDataInspectStore();

const exchangeId = computed(() => route.params.exchangeId as string);
const symbol = computed(() => (route.params.symbol as string).replace('-', '/'));
const timeframe = computed(() => route.params.timeframe as string);

const validationStatus = computed(() => {
    if (!store.inspectResult) {
        return { icon: '', color: 'info', title: '' };
    }
    switch (store.inspectResult.validation.status) {
        case 'passed':
            return {
                icon: 'i-heroicons-check-circle-20-solid',
                color: 'success',
                title: t('data.inspect.validation.passed')
            };
        case 'skipped':
            return {
                icon: 'i-heroicons-information-circle-20-solid',
                color: 'info',
                title: t('data.inspect.validation.skipped')
            };
        case 'failed':
        default:
            return {
                icon: 'i-heroicons-exclamation-triangle-20-solid',
                color: 'error',
                title: t('data.inspect.validation.failed')
            };
    }
});

const fileInfo = computed(() => {
    if (!store.inspectResult) return {};
    return {
        filePath: store.inspectResult.filePath,
        fileSize: store.inspectResult.fileSize
    };
});
</script>
