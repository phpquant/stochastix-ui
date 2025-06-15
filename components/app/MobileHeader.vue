<template>
    <header class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
            <img src="~/assets/images/logo.svg" alt="Stochastix Logo" class="w-7 h-7" />
            <span>{{ t('app.name') }}</span>
        </NuxtLink>

        <div class="flex items-center gap-2">
            <UtilityColorModeButton />
            <UButton
                icon="i-heroicons-bars-3-20-solid"
                variant="ghost"
                color="neutral"
                @click="emit('openDrawer')"
            />
        </div>
    </header>
</template>

<script setup lang="ts">
const { t } = useI18n();

const emit = defineEmits<{
    (e: 'openDrawer'): void;
}>();
</script>
