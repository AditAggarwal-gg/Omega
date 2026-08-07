<template>
  <section class="max-w-md mx-auto px-6 py-20">
    <p class="badge mb-4">WELCOME BACK</p>
    <h1 class="text-3xl mb-6">Sign in</h1>

    <form class="card p-6 space-y-4" @submit.prevent="handleLogin">
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="email">Email</label>
        <input id="email" v-model="email" type="email" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="password">Password</label>
        <input id="password" v-model="password" type="password" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>

      <p v-if="errorMessage" class="text-danger-500 text-sm">{{ errorMessage }}</p>

      <button type="submit" :disabled="loading"
        class="w-full rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50">
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p class="mt-4 text-sm text-paper-400">
      No account yet?
      <NuxtLink to="/signup" class="text-signal-500 hover:underline">Create one</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Sign in' })

const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  loading.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }

  const next = (route.query.next as string) || '/app'
  router.push(next)
}
</script>
