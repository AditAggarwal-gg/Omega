<template>
  <section class="max-w-2xl mx-auto px-6 py-12">
    <p class="badge mb-2">
      EDIT CONTENT
    </p>
    <h1 class="text-3xl mb-8">
      {{ membership?.organizations.name }}
    </h1>

    <div
      v-if="pending"
      class="text-paper-400"
    >
      Loading…
    </div>

    <form
      v-else-if="item"
      class="card p-6 space-y-4"
      @submit.prevent="save"
    >
      <div>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="title"
        >Title</label>
        <input
          id="title"
          v-model="item.title"
          type="text"
          required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500"
        >
      </div>

      <div>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="slug"
        >Slug</label>
        <input
          id="slug"
          v-model="item.slug"
          type="text"
          required
          pattern="[a-z0-9-]+"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 font-mono text-sm focus:border-signal-500"
        >
      </div>

      <div>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="summary"
        >Summary</label>
        <textarea
          id="summary"
          v-model="item.summary"
          rows="2"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm"
        />
      </div>

      <div v-if="item.type === 'article'">
        <label
          class="block text-sm text-paper-200 mb-1"
          for="body"
        >Body</label>
        <textarea
          id="body"
          v-model="item.body"
          rows="10"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm font-mono"
        />
      </div>
      <div v-else>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="media"
        >{{ item.type === 'video' ? 'Video' : 'Audio' }} URL</label>
        <input
          id="media"
          v-model="item.media_url"
          type="url"
          required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm"
        >
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input
          v-model="item.is_premium"
          type="checkbox"
          class="rounded"
        >
        Premium content
      </label>

      <label class="flex items-center gap-2 text-sm">
        <input
          v-model="isPublished"
          type="checkbox"
          class="rounded"
        >
        Published
      </label>

      <p
        v-if="errorMessage"
        class="text-danger-500 text-sm"
      >
        {{ errorMessage }}
      </p>

      <div class="flex items-center justify-between pt-2">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50"
        >
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
        <button
          type="button"
          class="text-sm text-danger-500 hover:underline"
          @click="remove"
        >
          Delete
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-member' })

const route = useRoute()
const router = useRouter()
const orgSlug = route.params.org as string
const itemId = route.params.id as string
const supabase = useSupabaseClient()
const { membership } = useCurrentOrg()

const item = ref<any>(null)
const pending = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const isPublished = ref(false)

async function load() {
  pending.value = true
  const { data } = await supabase.from('content_items').select('*').eq('id', itemId).single()
  item.value = data
  isPublished.value = data?.status === 'published'
  pending.value = false
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  const wasPublished = item.value.status === 'published'
  const nowPublished = isPublished.value

  const { error } = await supabase.from('content_items').update({
    title: item.value.title,
    slug: item.value.slug,
    summary: item.value.summary,
    body: item.value.body,
    media_url: item.value.media_url,
    is_premium: item.value.is_premium,
    status: nowPublished ? 'published' : 'draft',
    published_at: nowPublished && !wasPublished ? new Date().toISOString() : item.value.published_at,
  }).eq('id', itemId)

  saving.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }
  router.push(`/app/${orgSlug}/content`)
}

async function remove() {
  if (!confirm('Delete this content permanently?')) return
  await supabase.from('content_items').delete().eq('id', itemId)
  router.push(`/app/${orgSlug}/content`)
}

onMounted(load)
useSeoMeta({ title: 'Edit content' })
</script>
