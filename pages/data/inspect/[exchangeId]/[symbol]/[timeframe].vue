<template>
    <ViewDataInspect />
</template>

<script setup lang="ts">
const route = useRoute();
const store = useDataInspectStore();

// Restore the original symbol format for display purposes
const exchangeId = computed(() => route.params.exchangeId as string);
const symbol = computed(() => (route.params.symbol as string).replace('-', '/'));
const timeframe = computed(() => route.params.timeframe as string);

onMounted(() => {
    store.fetchInspectResult(exchangeId.value, symbol.value, timeframe.value);
});

onUnmounted(() => {
    store.reset();
});
</script>
