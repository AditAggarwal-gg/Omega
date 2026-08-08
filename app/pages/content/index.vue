<template>
  <section class="max-w-5xl mx-auto px-6 py-12">
    <p class="badge mb-3">CONTENT</p>
    <h1 class="text-3xl mb-6">Latest from every organization</h1>

    <div class="flex gap-2 mb-8">
      <button v-for="t in typeFilters" :key="t.label"
        class="rounded-md border px-3 py-1.5 text-sm font-mono"
        :class="activeType === t.value ? 'border-signal-500 text-signal-500' : 'border-ink-600 text-paper-200 hover:border-ink-600'"
        @click="setType(t.value)">
        {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="text-paper-400">Loading…</div>

    <div v-else-if="items.length" class="grid md:grid-cols-2 gap-4">
      <NuxtLink v-for="item in items" :key="item.id" :to="`/content/${item.org_slug}/${item.slug}`"
        class="card p-5 hover:border-signal-500 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="badge">{{ item.type }}</span>
          <span v-if="item.locked" class="badge border-signal-500 text-signal-500">🔒 PREMIUM</span>
        </div>
        <h2 class="text-lg font-medium mb-1">{{ item.title }}</h2>
        <p v-if="item.summary" class="text-sm text-paper-400 line-clamp-2 mb-3">{{ item.summary }}</p>
        <p class="text-xs text-paper-400 font-mono">{{ item.org_name }}</p>
      </NuxtLink>
    </div>

    <div v-else class="card p-8 text-center text-paper-400">
      No published content yet. Check back soon.
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Content', description: 'Articles, video, and audio published by teams on Omega.' })

const supabase = useSupabaseClient()
const items = ref<any[]>([])
const pending = ref(true)
const activeType = ref<'article' | 'video' | 'audio' | undefined>(undefined)

type ContentType = 'article' | 'video' | 'audio' | undefined
const typeFilters: { label: string; value: ContentType }[] = [
  { label: 'All', value: undefined },
  { label: 'Articles', value: 'article' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' }
]

async function load() {
  pending.value = true
  const { data } = await supabase.rpc('list_published_content', {
    p_org_slug: undefined,
    p_type: activeType.value
  })
  items.value = data ?? []
  pending.value = false
}

function setType(t: 'article' | 'video' | 'audio' | undefined) {
  activeType.value = t
  load()
}

onMounted(load)
</script>
