<script setup>
import { onMounted, ref } from 'vue';

const versionInfo = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('/version-info.json');
    versionInfo.value = await response.json();
  } catch (error) {
    console.error('Failed to load version info:', error);
  }
});
</script>

<template>
    <footer class="bg-black text-white p-8">
        <div class="flex flex-col space-y-4">
            <div class="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:gap-8">
                <NuxtLink :to="{ path: '/' }" :exact="true" class="no-underline hover:no-underline">
                    <p class="text-xl sm:text-2xl font-bold">dws-myWULING</p>
                    <p v-if="versionInfo" class="text-xs opacity-30 font-mono">Version: {{ versionInfo.version }}</p>
                    <p v-if="versionInfo" class="text-xs opacity-30 font-mono">Build: {{ new Date(versionInfo.buildDate).toLocaleString() }}</p>
                </NuxtLink>
                <div class="flex flex-col">
                    <NuxtLink :to="{ path: '/about' }" class="my-1 text-sm hover:underline">About This Site</NuxtLink>
                </div>
                <div>
                  <a href="https://github.com/darel919/dws-mywuling" target="_blank" title="This project's GitHub Repository" class="my-1 text-sm hover:underline">GitHub Repository</a>
                </div>
            </div>
        </div>
    </footer>
</template>
