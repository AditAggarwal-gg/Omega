<template>
  <section class="max-w-md mx-auto px-6 py-24 text-center">
    <div class="signal-dot mx-auto mb-6" />
    <p v-if="!errorMessage" class="text-paper-200">Confirming your account…</p>
    <template v-else>
      <p class="text-danger-500 mb-4">{{ errorMessage }}</p>
      <NuxtLink to="/login" class="text-signal-500 hover:underline">Go to sign in</NuxtLink>
    </template>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()
const errorMessage = ref('')

onMounted(async () => {
  const next = (route.query.next as string) || '/app'

  for (let attempt = 0; attempt < 20; attempt++) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.replace(next)
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  errorMessage.value = 'This confirmation link may have expired or already been used. Try signing in directly.'
})
</script>
