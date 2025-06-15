export const useStrategyStore = defineStore('strategy', () => {
    const strategies = ref<StrategyDefinition[]>([]);
    const status = ref<LoadingStatus>('idle');
    const toast = useToast();

    // For any components that might still use isLoading
    const isLoading = computed(() => status.value === 'loading');

    async function fetchStrategies() {
        if (strategies.value.length > 0) return;

        status.value = 'loading';
        try {
            strategies.value = await $fetch<StrategyDefinition[]>('/api/strategies');
            status.value = 'success';
        } catch (e: any) {
            toast.add({
                title: 'Error Loading Strategies',
                description: e.data?.error || 'Could not connect to the API.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle',
            });
            console.error('Failed to fetch strategies:', e);
            status.value = 'error';
        }
    };

    return {
        strategies,
        status,
        isLoading,
        fetchStrategies,
    };
});
