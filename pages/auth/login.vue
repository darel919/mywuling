<template>
    <div class="container py-4 px-6 sm:px-16 mx-auto min-h-screen flex items-center justify-center">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
            <div class="card-body">
                <!-- Logo and Title -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold mb-2">Welcome to myWULING</h1>
                    <p class="text-base-content/60">Sign in to access your vehicle information</p>
                    <NuxtLink to="/about" class="link link-primary text-sm mt-2 inline-block">Why this app?</NuxtLink>
                </div>

                <!-- DWS Login Button -->
                <div class="flex flex-col items-center space-y-4">
                    <div v-if="loginError" class="text-error text-xs mb-1">{{ loginError }}</div>
                    <button
                        @click="handleLogin"
                        class="btn btn-primary w-full flex items-center justify-center"
                        :disabled="isLoggingIn"
                    >
                        <span v-if="isLoggingIn" class="loading loading-spinner loading-md mr-2"></span>
                        <span>{{ isLoggingIn ? 'Logging in...' : 'Login with DWS' }}</span>
                    </button>
                </div>

                <!-- Login with wuling.id alternative -->
                <div class="text-center mt-4">
                    <NuxtLink to="/auth/loginWithWulingID" class="link link-secondary text-sm">
                        Login with wuling.id instead
                    </NuxtLink>
                </div>

                <!-- Help Text -->
                <div class="text-center mt-6">
                    <p class="text-sm text-base-content/60">
                        Don't have an account? Visit 
                        <a href="https://www.wuling.id/" target="_blank" class="link link-primary">wuling.id</a>
                        to create one.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()
const isLoggingIn = ref(false)
const loginError = ref('')

useHead({
    title: 'Login to dws-myWULING'
})

function openLoginWindow(redirectPath, onAuthCancelled) {
    if (typeof window === 'undefined') return false;
    localStorage.setItem('redirectAfterAuth', redirectPath || window.location.pathname);
    sessionStorage.removeItem('redirectionCompleted');
    sessionStorage.removeItem('authCancelled');
    localStorage.removeItem('authSuccess');
    // Always use DARELISME_URL from nuxt config
    const darelismeUrl = config.public.DARELISME_URL;
    const redirectUrl = encodeURIComponent(`${window.location.origin}/auth`);
    const authUrl = `${darelismeUrl}/auth/login?redirectExternal=${redirectUrl}`;
    const loginWindow = window.open(authUrl, 'darelismeLogin', 'width=600,height=700');
    if (!loginWindow) {
        alert('Please allow popups for this site to enable login');
        if (onAuthCancelled) onAuthCancelled('Popup was blocked');
        return false;
    }
    let authDetected = false;
    const checkWindowClosed = setInterval(() => {
        if (authDetected) return;
        try {
            if (localStorage.getItem('authSuccess') === 'true') {
                localStorage.removeItem('authSuccess');
                clearInterval(checkWindowClosed);
                authDetected = true;
                window.location.reload();
                return;
            }
            if (loginWindow.closed) {
                clearInterval(checkWindowClosed);
                if (localStorage.getItem('authSuccess') === 'true') {
                    localStorage.removeItem('authSuccess');
                    authDetected = true;
                    window.location.reload();
                } else {
                    sessionStorage.setItem('authCancelled', 'true');
                    if (onAuthCancelled) onAuthCancelled('Login window was closed');
                }
            }
        } catch (e) {
            // ignore
        }
    }, 500);
    return true;
}

function handleLogin() {
    isLoggingIn.value = true;
    loginError.value = '';
    const success = openLoginWindow(window.location.pathname, (reason) => {
        isLoggingIn.value = false;
        loginError.value = 'Login cancelled';
        setTimeout(() => { loginError.value = ''; }, 3000);
    });
    if (!success) {
        isLoggingIn.value = false;
        loginError.value = 'Popup was blocked';
        setTimeout(() => { loginError.value = ''; }, 3000);
    }
}
</script>