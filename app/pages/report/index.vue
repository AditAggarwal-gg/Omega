<template>
  <section class="max-w-md mx-auto px-6 py-20">
    <p class="badge mb-4">REPORT</p>
    <h1 class="text-3xl mb-6">Report a link or issue</h1>

    <div v-if="!user" class="card p-6 text-paper-200">
      <p class="mb-4">Sign in to submit a report.</p>
      <NuxtLink to="/login?next=/report" class="text-signal-500 hover:underline">Sign in</NuxtLink>
    </div>

    <form v-else-if="!submitted" class="card p-6 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="url">Link (optional)</label>
        <input id="url" v-model="url" type="url" placeholder="https://…"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="reason">Reason</label>
        <select id="reason" v-model="reason" class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2">
          <option value="spam">Spam</option>
          <option value="abuse">Abuse or harassment</option>
          <option value="copyright">Copyright</option>
          <option value="broken_link">Broken link</option>
          <option value="misinformation">Misinformation</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="details">Details</label>
        <textarea id="details" v-model="details" rows="4" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm" />
      </div>
      <p v-if="errorMessage" class="text-danger-500 text-sm">{{ errorMessage }}</p>
      <button type="submit" :disabled="submitting"
        class="rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50">
        {{ submitting ? 'Submitting…' : 'Submit report' }}
      </button>
    </form>

    <div v-else class="card p-6 text-paper-200">
      <p>Thanks — your report has been submitted for review.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Report a link or issue' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const url = ref('')
const reason = ref<'spam' | 'abuse' | 'copyright' | 'broken_link' | 'misinformation' | 'other'>('spam')
const details = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

async function submit() {
  submitting.value = true
  errorMessage.value = ''
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    errorMessage.value = 'Your session expired — please sign in again.'
    submitting.value = false
    return
  }
  const { error } = await supabase.from('reports').insert({
    flagged_url: url.value || null,
    reason: reason.value,
    details: details.value,
    reporter_id: currentUser.id
  })
  submitting.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }
  submitted.value = true
}
</script>
