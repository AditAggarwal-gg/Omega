<template>
  <section class="max-w-3xl mx-auto px-6 py-12">
    <div
      v-if="pending"
      class="text-paper-400"
    >
      Loading…
    </div>

    <div
      v-else-if="!teaser"
      class="card p-8 text-center text-paper-400"
    >
      This content doesn't exist or hasn't been published.
    </div>

    <template v-else>
      <NuxtLink
        :to="`/content`"
        class="text-sm text-paper-400 hover:text-signal-500"
      >← All content</NuxtLink>

      <div class="flex items-center gap-2 mt-4 mb-2">
        <span class="badge">{{ teaser.type }}</span>
        <span class="text-xs text-paper-400 font-mono">{{ teaser.org_name }}</span>
      </div>
      <h1 class="text-3xl mb-4">
        {{ teaser.title }}
      </h1>

      <div
        v-if="teaser.locked"
        class="card p-8 text-center"
      >
        <p class="text-signal-500 mb-2">
          🔒 Premium content
        </p>
        <p class="text-paper-200 mb-6">
          {{ teaser.summary || 'This piece is available to premium members.' }}
        </p>
        <NuxtLink
          v-if="!user"
          :to="`/login?next=/content/${route.params.org}/${route.params.slug}`"
          class="rounded-md bg-signal-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-signal-400"
        >
          Sign in to check access
        </NuxtLink>
        <p
          v-else
          class="text-paper-400 text-sm"
        >
          Your account doesn't have premium access to {{ teaser.org_name }} yet.
          Ask an owner or manager there to grant it.
        </p>
      </div>

      <div v-else-if="full">
        <p
          v-if="full.summary"
          class="text-paper-200 mb-6"
        >
          {{ full.summary }}
        </p>

        <div
          v-if="full.type === 'article'"
          class="prose prose-invert max-w-none whitespace-pre-wrap"
        >
          {{ full.body }}
        </div>

        <video
          v-else-if="full.type === 'video'"
          :src="full.media_url"
          controls
          class="w-full rounded-lg border border-ink-700"
        />

        <audio
          v-else-if="full.type === 'audio'"
          :src="full.media_url"
          controls
          class="w-full"
        />

        <button
          class="mt-8 text-sm text-paper-400 hover:text-danger-500"
          @click="showReport = true"
        >
          Report this content
        </button>
        <ReportDialog
          v-if="showReport"
          :content-id="full.id"
          :org-id="full.org_id"
          @close="showReport = false"
        />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const teaser = ref<any>(null)
const full = ref<any>(null)
const pending = ref(true)
const showReport = ref(false)

async function load() {
  pending.value = true
  const { data } = await supabase.rpc('get_published_content', {
    p_org_slug: route.params.org as string,
    p_slug: route.params.slug as string,
  })
  teaser.value = Array.isArray(data) ? data[0] : data

  if (teaser.value && !teaser.value.locked) {
    const { data: row } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', teaser.value.id)
      .single()
    full.value = row
  }
  pending.value = false
}

onMounted(load)

useSeoMeta({
  title: () => teaser.value?.title ?? 'Content',
  description: () => teaser.value?.summary ?? undefined,
})
</script>
