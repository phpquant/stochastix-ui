<template>
    <UCard>
        <template #header>
            <h3 class="font-semibold text-base">{{ title }}</h3>
        </template>
        <UTable :data="data" :columns="ohlcvColumns" />
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    data: OhlcvRecord[];
}>();

const { t } = useI18n();

const ohlcvColumns = computed(() => [
    { accessorKey: 'timestamp', header: t('data.inspect.cols.timestamp') },
    { accessorKey: 'utc', header: t('data.inspect.cols.utc') },
    { accessorKey: 'open', header: t('data.inspect.cols.open') },
    { accessorKey: 'high', header: t('data.inspect.cols.high') },
    { accessorKey: 'low', header: t('data.inspect.cols.low') },
    { accessorKey: 'close', header: t('data.inspect.cols.close') },
    { accessorKey: 'volume', header: t('data.inspect.cols.volume') },
]);
</script>
