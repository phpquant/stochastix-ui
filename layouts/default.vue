<template>
    <div>
        <div class="hidden md:flex fixed top-0 left-0 h-full">
            <AppSidebar />
        </div>

        <div class="block md:hidden">
            <AppMobileHeader @open-drawer="isDrawerOpen = true" />
        </div>

        <main class="md:pl-64">
            <div class="p-4 sm:p-6 lg:p-8">
                <slot />
            </div>
        </main>

        <UDrawer v-model:open="isDrawerOpen" direction="left" :ui="{ background: 'bg-white dark:bg-gray-900' }">
            <template #body>
                <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
                    <UIcon name="i-heroicons-chart-bar-square" class="w-7 h-7" />
                    <span>{{ t('app.name') }}</span>
                </NuxtLink>
                <div class="mt-5">
                    <AppNavigation @navigate="isDrawerOpen = false" />
                </div>
            </template>
        </UDrawer>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const isDrawerOpen = ref(false);
</script>
