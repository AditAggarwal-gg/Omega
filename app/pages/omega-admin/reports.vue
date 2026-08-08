<template>
  <section class="max-w-4xl mx-auto px-6 py-12">
    <p class="badge mb-2">
      PLATFORM ADMIN
    </p>
    <h1 class="text-3xl mb-8">
      All reports
    </h1>

    <div class="flex gap-2 mb-6">
      <button
        v-for="s in statusFilters"
        :key="s"
        class="rounded-md border px-3 py-1.5 text-sm font-mono capitalize"
        :class="activeStatus === s ? 'border-signal-500 text-signal-500' : 'border-ink-600 text-paper-200'"
        @click="activeStatus = s"
      >
        {{ s }}
      </button>
    </div>

    <div
      v-if="pending"
      class="text-paper-400"
    >
      Loading…
    </div>
    <div
      v-else-if="filtered.length"
      class="card divide-y divide-ink-700"
    >
      <div
        v-for="r in filtered"
        :key="r.id"
        class="p-4"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="badge">{{ r.reason }}</span>
            <span
              v-if="!r.org_id"
              class="badge border-signal-500 text-signal-500"
            >no org · flagged link</span>
          </div>
          <select
            v-model="r.status"
            class="bg-ink-900 border border-ink-600 rounded-md px-2 py-1 text-sm capitalize"
            @change="updateStatus(r)"
          >
            <option value="open">
              Open
            </option>
            <option value="reviewing">
              Reviewing
            </option>
            <option value="resolved">
              Resolved
            </option>
            <option value="dismissed">
              Dismissed
            </option>
          </select>
        </div>
        <p
          v-if="r.details"
          class="text-sm text-paper-200 mb-2"
        >
          {{ r.details }}
        </p>
        <p
          v-if="r.flagged_url"
          class="text-xs text-paper-400 font-mono break-all mb-1"
        >
          {{ r.flagged_url }}
        </p>
        <p
          v-if="r.content_id"
          class="text-xs text-paper-400"
        >
          Content ID: {{ r.content_id }}
        </p>
        <p class="text-xs text-paper-400 mt-2">
          {{ new Date(r.created_at).toLocaleString() }}
        </p>
      </div>
    </div>
    <div
      v-else
      class="card p-8 text-center text-paper-400"
    >
      No {{ activeStatus }} reports.
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-platform-admin' })
useSeoMeta({ title: 'All reports' })

const supabase = useSupabaseClient()
const reports = ref<any[]>([])
const pending = ref(true)
const activeStatus = ref('open')
const statusFilters = ['open', 'reviewing', 'resolved', 'dismissed']

const filtered = computed(() => reports.value.filter(r => r.status === activeStatus.value))

async function load() {
  pending.value = true
  const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
  reports.value = data ?? []
  pending.value = false
}

async function updateStatus(r: any) {
  await supabase.from('reports').update({ status: r.status, reviewed_at: new Date().toISOString() }).eq('id', r.id)
}

onMounted(load)
</script>
