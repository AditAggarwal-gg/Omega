<template>
  <section class="max-w-md mx-auto px-6 py-20">
    <p class="badge mb-4">CREATE ACCOUNT</p>
    <h1 class="text-3xl mb-6">Join Omega</h1>

    <form class="card p-6 space-y-4" @submit.prevent="handleSignup">
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="name">Full name</label>
        <input id="name" v-model="fullName" type="text" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="email">Email</label>
        <input id="email" v-model="email" type="email" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="password">Password</label>
        <input id="password" v-model="password" type="password" minlength="8" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>

      <p v-if="errorMessage" class="text-danger-500 text-sm">{{ errorMessage }}</p>
      <p v-if="successMessage" class="text-live-500 text-sm">{{ successMessage }}</p>

      <button type="submit" :disabled="loading"
        class="w-full rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50">
        {{ loading ? 'Creating account…' : 'Create account' }}
      </button>
    </form>

    <p class="mt-4 text-sm text-paper-400">
      Already have an account?
      <NuxtLink to="/login" class="text-signal-500 hover:underline">Sign in</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Sign up' })

const supabase = useSupabaseClient()
const route = useRoute()

const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSignup() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  // Preserve an invite token (?next=/join/xxxx) through the confirmation
  // email round-trip, so a user coming from an invite link lands back on
  // the invite after confirming their email.
  const next = (route.query.next as string) || '/app'

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { full_name: fullName.value },
      emailRedirectTo: `${window.location.origin}/confirm?next=${encodeURIComponent(next)}`
    }
  })

  loading.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }
  successMessage.value = 'Check your email to confirm your account.'
}
</script>
