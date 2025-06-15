<template>
    <div class="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-900/75 flex flex-col h-full">
        <div class="p-4 flex justify-between items-center">
            <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
                <img src="~/assets/images/logo.svg" alt="Stochastix Logo" class="w-7 h-7" />
                {{ t('app.name') }}
            </NuxtLink>
            <UtilityColorModeButton />
        </div>
        <div class="p-2">
            <AppNavigation />
        </div>
        <div class="mt-auto p-4">
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
