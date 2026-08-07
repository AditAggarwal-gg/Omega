<template>
  <section class="max-w-md mx-auto px-6 py-20 text-center">
    <div v-if="loadingPreview" class="text-paper-400">Loading invite…</div>

    <template v-else-if="preview">
      <p class="badge mb-4 mx-auto w-fit">INVITE</p>
      <h1 class="text-2xl mb-2">Join {{ preview.org_name }}</h1>
      <p class="text-paper-200 mb-6">
        You've been invited as <span class="font-mono">{{ preview.role }}</span>.
      </p>

      <p v-if="preview.is_expired" class="text-danger-500">This invite has expired.</p>
      <p v-else-if="preview.is_accepted" class="text-paper-400">This invite has already been used.</p>

      <template v-else>
        <div v-if="checkingSession" class="text-paper-400 text-sm">Checking your session…</div>
        <div v-else-if="!currentUser">
          <p class="text-paper-400 text-sm mb-4">Sign in or create an account with {{ preview.invited_email }} to accept.</p>
          <div class="flex gap-3 justify-center">
            <NuxtLink :to="`/login?next=/join/${token}`" class="rounded-md border border-ink-600 px-4 py-2 hover:border-signal-500">Sign in</NuxtLink>
            <NuxtLink :to="`/signup?next=/join/${token}`" class="rounded-md bg-signal-500 px-4 py-2 text-ink-950 font-medium hover:bg-signal-400">Create account</NuxtLink>
          </div>
        </div>
        <div v-else>
          <p v-if="errorMessage" class="text-danger-500 text-sm mb-3">{{ errorMessage }}</p>
          <button :disabled="accepting" class="rounded-md bg-signal-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50"
            @click="accept">
            {{ accepting ? 'Joining…' : `Accept and join ${preview.org_name}` }}
          </button>
        </div>
      </template>
    </template>

    <p v-else class="text-paper-400">Invite not found.</p>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const token = route.params.token as string
const preview = ref<any>(null)
const loadingPreview = ref(true)
const accepting = ref(false)
const errorMessage = ref('')
const currentUser = ref<any>(null)
const checkingSession = ref(true)

async function loadPreview() {
  const { data } = await supabase.rpc('get_invite_preview', { p_token: token })
  preview.value = Array.isArray(data) ? data[0] : data
  loadingPreview.value = false
}

async function checkSession() {
  const { data: { user } } = await supabase.auth.getUser()
  currentUser.value = user
  checkingSession.value = false
}

async function accept() {
  accepting.value = true
  errorMessage.value = ''
  const { error } = await supabase.rpc('accept_invite', { p_token: token })
  accepting.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }
  router.push('/app')
}

onMounted(() => {
  loadPreview()
  checkSession()
})
useSeoMeta({ title: 'Join organization' })
</script>
