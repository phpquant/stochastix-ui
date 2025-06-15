<template>
    <header class="bg-background/75 backdrop-blur border-b border-gray-200 dark:border-gray-800 -mb-px sticky top-0 z-50">
        <UContainer class="flex items-center justify-between gap-3 h-16">
            <div class="lg:flex-1 flex items-center gap-1.5">
                <slot name="left" />
            </div>

            <slot name="center" />

            <div class="flex items-center justify-end lg:flex-1 gap-1.5">
                <slot name="right" />
            </div>
        </UContainer>
    </header>
</template>
