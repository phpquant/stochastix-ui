<template>
    <UCard>
        <template #header>
            <h3 class="text-lg font-semibold">{{ t('data.download.title') }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('data.download.description') }}</p>
        </template>

        <UForm id="data-download-form" :state="formState" @submit="handleSubmit">
            <div class="space-y-4">
                <UFormField :label="t('data.download.form.exchange.label')" name="exchangeId" required>
                    <USelectMenu
                        class="w-full"
                        v-model="formState.exchangeId"
                        :items="downloadStore.exchanges"
                        :placeholder="t('data.download.form.exchange.placeholder')"
                        :loading="downloadStore.exchangesStatus === 'loading'"
                        :disabled="downloadStore.exchangesStatus !== 'success'"
                    />
                </UFormField>

                <UFormField :label="t('data.download.form.symbols.label')" name="symbols" required>
                    <USelectMenu
                        class="w-full"
                        v-model="formState.symbols"
                        :items="symbolsForSelectedExchange"
                        multiple
                        :placeholder="t('data.download.form.symbols.placeholder')"
                        :loading="isSymbolsLoading"
                        :disabled="!formState.exchangeId || isSymbolsLoading"
                        searchable
                        searchable-placeholder="Search a symbol..."
                    />
                </UFormField>

                <UFormField :label="t('data.download.form.timeframes.label')" name="timeframes" required>
                    <USelectMenu
                        class="w-full"
                        v-model="formState.timeframes"
                        :items="availableTimeframes"
                        multiple
                        :placeholder="t('data.download.form.timeframes.placeholder')"
                    />
                </UFormField>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField :label="t('data.download.form.startDate.label')" name="startDate" required>
                        <UInput class="w-full" v-model="formState.startDate" type="date" />
                    </UFormField>
                    <UFormField :label="t('data.download.form.endDate.label')" name="endDate" required>
                        <UInput class="w-full" v-model="formState.endDate" type="date" />
                    </UFormField>
                </div>
            </div>
        </UForm>

        <template #footer>
            <UButton
                type="submit"
                form="data-download-form"
                :loading="downloadStore.isQueueRunning"
            >
                {{ t('data.download.form.submitButton') }}
            </UButton>
        </template>
    </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n();
const downloadStore = useDataDownloadStore();

const formState = reactive<DataDownloadRequest>({
    exchangeId: null,
    symbols: [],
    timeframes: [],
    startDate: '2024-01-01',
    endDate: new Date().toISOString().split('T')[0] // Default to today
});

const availableTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

const isSymbolsLoading = computed(() => {
    if (!formState.exchangeId) return false;
    return downloadStore.symbolsByExchange[formState.exchangeId]?.status === 'loading';
});

const symbolsForSelectedExchange = computed(() => {
    if (!formState.exchangeId) return [];
    return downloadStore.symbolsByExchange[formState.exchangeId]?.list ?? [];
});

onMounted(() => {
    downloadStore.fetchExchanges();
});

watch(() => formState.exchangeId, (newExchangeId) => {
    if (newExchangeId) {
        formState.symbols = []; // Reset symbols when exchange changes
        downloadStore.fetchSymbols(newExchangeId);
    }
});

const handleSubmit = () => {
    downloadStore.queueDownloads(formState);
};
</script>
