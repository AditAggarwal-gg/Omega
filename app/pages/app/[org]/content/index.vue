<template>
  <section class="max-w-4xl mx-auto px-6 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="badge mb-2">CONTENT</p>
        <h1 class="text-3xl">{{ membership?.organizations.name }}</h1>
      </div>
      <NuxtLink :to="`/app/${orgSlug}/content/new`"
        class="rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400">
        + New content
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-paper-400">Loading…</div>

    <div v-else-if="items.length" class="card divide-y divide-ink-700">
      <div v-for="item in items" :key="item.id" class="p-4 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="badge">{{ item.type }}</span>
            <span class="badge" :class="item.status === 'published' ? 'border-live-500 text-live-500' : ''">{{ item.status }}</span>
            <span v-if="item.is_premium" class="badge border-signal-500 text-signal-500">premium</span>
          </div>
          <p class="font-medium truncate">{{ item.title }}</p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button class="text-sm text-paper-400 hover:text-signal-500" @click="togglePublish(item)">
            {{ item.status === 'published' ? 'Unpublish' : 'Publish' }}
          </button>
          <NuxtLink :to="`/app/${orgSlug}/content/${item.id}/edit`" class="text-sm text-paper-400 hover:text-signal-500">Edit</NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="card p-8 text-center text-paper-400">
      No content yet. Create your first piece.
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-member' })

const route = useRoute()
const orgSlug = route.params.org as string
const supabase = useSupabaseClient()
const { membership } = useCurrentOrg()

const items = ref<any[]>([])
const pending = ref(true)

async function load() {
  if (!membership.value) return
  pending.value = true
  const { data } = await supabase
    .from('content_items')
    .select('*')
    .eq('org_id', membership.value.org_id)
    .order('created_at', { ascending: false })
  items.value = data ?? []
  pending.value = false
}

async function togglePublish(item: any) {
  const newStatus = item.status === 'published' ? 'draft' : 'published'
  const { error } = await supabase
    .from('content_items')
    .update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null })
    .eq('id', item.id)
  if (!error) {
    item.status = newStatus
  }
}

watch(membership, (v) => { if (v) load() }, { immediate: true })

useSeoMeta({ title: () => `Content · ${membership.value?.organizations.name ?? ''}` })
</script>
