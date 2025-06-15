<template>
    <div>
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const backtestStore = useBacktestStore();

watch(
    () => route.params.id,
    (newId) => {
        if (typeof newId === 'string' && newId) {
            // If we're navigating to a new backtest ID, reset previous results
            if (backtestStore.currentBacktestId !== newId) {
                backtestStore.resetResultState();
            }

            backtestStore.currentBacktestId = newId;
            // Always attempt to fetch the main result for the current ID.
            // The store's fetchResult action is smart enough not to re-fetch if data exists.
            backtestStore.fetchResult(newId);
        }
    },
    { immediate: true }
);
</script>
