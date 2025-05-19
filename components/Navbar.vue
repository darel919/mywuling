<template>
    <header class="navbar bg-base-100">
        <NuxtLink to="/" class="btn btn-ghost normal-case text-xl">
            <p>dws-myWuling</p>
        </NuxtLink>
        <button @click="goLogin">Login</button>
    </header>
</template>

<script setup>

function goLogin() {
    navigateTo('/auth/login')
}
</script>