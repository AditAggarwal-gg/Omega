<template>
  <div
    class="fixed inset-0 bg-ink-950/80 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')"
  >
    <div class="card p-6 w-full max-w-sm">
      <h3 class="text-lg mb-4">
        Report this content
      </h3>

      <div
        v-if="checkingSession"
        class="text-paper-400 text-sm"
      >
        Checking your session…
      </div>

      <div
        v-else-if="!currentUser"
        class="text-paper-200 text-sm"
      >
        <p class="mb-4">
          Sign in to submit a report.
        </p>
        <NuxtLink
          to="/login"
          class="text-signal-500 hover:underline"
        >Sign in</NuxtLink>
      </div>

      <form
        v-else-if="!submitted"
        class="space-y-4"
        @submit.prevent="submit"
      >
        <div>
          <label
            class="block text-sm text-paper-200 mb-1"
            for="reason"
          >Reason</label>
          <select
            id="reason"
            v-model="reason"
            class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2"
          >
            <option value="spam">
              Spam
            </option>
            <option value="abuse">
              Abuse or harassment
            </option>
            <option value="copyright">
              Copyright
            </option>
            <option value="misinformation">
              Misinformation
            </option>
            <option value="other">
              Other
            </option>
          </select>
        </div>
        <div>
          <label
            class="block text-sm text-paper-200 mb-1"
            for="details"
          >Details (optional)</label>
          <textarea
            id="details"
            v-model="details"
            rows="3"
            class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm"
          />
        </div>
        <p
          v-if="errorMessage"
          class="text-danger-500 text-sm"
        >
          {{ errorMessage }}
        </p>
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            class="px-4 py-2 text-sm text-paper-400 hover:text-paper-50"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50"
          >
            {{ submitting ? 'Submitting…' : 'Submit report' }}
          </button>
        </div>
      </form>

      <div
        v-else
        class="text-paper-200 text-sm"
      >
        <p class="mb-4">
          Thanks — your report has been submitted for review.
        </p>
        <button
          class="rounded-md border border-ink-600 px-4 py-2 text-sm hover:border-signal-500"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ contentId?: string, orgId?: string, flaggedUrl?: string }>()
defineEmits(['close'])

const supabase = useSupabaseClient()
const reason = ref<'spam' | 'abuse' | 'copyright' | 'misinformation' | 'other'>('spam')
const details = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')
const currentUser = ref<any>(null)
const checkingSession = ref(true)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  currentUser.value = user
  checkingSession.value = false
})

async function submit() {
  submitting.value = true
  errorMessage.value = ''
  const { error } = await supabase.from('reports').insert({
    content_id: props.contentId ?? null,
    org_id: props.orgId ?? null,
    flagged_url: props.flaggedUrl ?? null,
    reason: reason.value,
    details: details.value || null,
    reporter_id: currentUser.value.id,
  })
  submitting.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }
  submitted.value = true
}
</script>
