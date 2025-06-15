<template>
    <div>
        <div v-if="!store.backtestResult" class="flex items-center justify-center h-96">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
        </div>
        <ViewBacktestDetailedResults v-else :statistics="store.backtestResult.statistics" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const store = useBacktestStore();
const runId = route.params.id as string;

// Fetch the main result if it's not already loaded (e.g., direct navigation)
onMounted(() => {
    if (!store.backtestResult || store.currentBacktestId !== runId) {
        store.fetchResult(runId);
        store.currentBacktestId = runId;
    }
});
</script>
