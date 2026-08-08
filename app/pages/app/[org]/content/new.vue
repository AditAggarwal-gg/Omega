<template>
  <section class="max-w-2xl mx-auto px-6 py-12">
    <p class="badge mb-2">
      NEW CONTENT
    </p>
    <h1 class="text-3xl mb-8">
      {{ membership?.organizations.name }}
    </h1>

    <form
      class="card p-6 space-y-4"
      @submit.prevent="save"
    >
      <div>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="type"
        >Type</label>
        <select
          id="type"
          v-model="type"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2"
        >
          <option value="article">
            Article
          </option>
          <option value="video">
            Video
          </option>
          <option value="audio">
            Audio
          </option>
        </select>
      </div>

      <div>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="title"
        >Title</label>
        <input
          id="title"
          v-model="title"
          type="text"
          required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500"
          @input="onTitleInput"
        >
      </div>

      <div>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="slug"
        >Slug</label>
        <input
          id="slug"
          v-model="slug"
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
          v-model="summary"
          rows="2"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm"
        />
      </div>

      <div v-if="type === 'article'">
        <label
          class="block text-sm text-paper-200 mb-1"
          for="body"
        >Body</label>
        <textarea
          id="body"
          v-model="body"
          rows="10"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div v-else>
        <label
          class="block text-sm text-paper-200 mb-1"
          for="media"
        >{{ type === 'video' ? 'Video' : 'Audio' }} URL</label>
        <input
          id="media"
          v-model="mediaUrl"
          type="url"
          required
          placeholder="https://…"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 text-sm"
        >
        <p class="text-xs text-paper-400 mt-1">
          Link to a hosted file (S3, Supabase Storage, YouTube direct file, etc).
        </p>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input
          v-model="isPremium"
          type="checkbox"
          class="rounded"
        >
        Premium content (requires an active subscription to view)
      </label>

      <p
        v-if="errorMessage"
        class="text-danger-500 text-sm"
      >
        {{ errorMessage }}
      </p>

      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50"
          @click="publishNow = false"
        >
          {{ saving ? 'Saving…' : 'Save as draft' }}
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="rounded-md border border-signal-500 px-4 py-2.5 font-medium text-signal-500 hover:bg-signal-500/10 disabled:opacity-50"
          @click="publishNow = true"
        >
          Publish now
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
const supabase = useSupabaseClient()
const { membership } = useCurrentOrg()

const type = ref<'article' | 'video' | 'audio'>('article')
const title = ref('')
const slug = ref('')
const slugTouched = ref(false)
const summary = ref('')
const body = ref('')
const mediaUrl = ref('')
const isPremium = ref(false)
const saving = ref(false)
const publishNow = ref(false)
const errorMessage = ref('')

function onTitleInput() {
  if (slugTouched.value) return
  slug.value = title.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function save() {
  if (!membership.value) return
  saving.value = true
  errorMessage.value = ''

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    errorMessage.value = 'Your session expired — please sign in again.'
    saving.value = false
    return
  }

  const { error } = await supabase.from('content_items').insert({
    org_id: membership.value.org_id,
    author_id: user.id,
    type: type.value,
    title: title.value,
    slug: slug.value,
    summary: summary.value || null,
    body: type.value === 'article' ? body.value : null,
    media_url: type.value !== 'article' ? mediaUrl.value : null,
    is_premium: isPremium.value,
    status: publishNow.value ? 'published' : 'draft',
    published_at: publishNow.value ? new Date().toISOString() : null,
  })

  saving.value = false
  if (error) {
    errorMessage.value = error.message.includes('duplicate') ? 'That slug is already used in this org.' : error.message
    return
  }
  router.push(`/app/${orgSlug}/content`)
}

useSeoMeta({ title: 'New content' })
</script>
