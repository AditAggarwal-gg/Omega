<template>
  <section class="max-w-5xl mx-auto px-6 py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="badge mb-2">
          {{ membership?.role?.toUpperCase() }}
        </p>
        <h1 class="text-3xl">
          {{ membership?.organizations.name }}
        </h1>
      </div>
      <NuxtLink
        v-if="isManager"
        :to="`/app/${orgSlug}/team`"
        class="rounded-md border border-ink-600 px-4 py-2 text-sm hover:border-signal-500"
      >
        Manage team
      </NuxtLink>
    </div>

    <div class="grid md:grid-cols-3 gap-4">
      <NuxtLink
        :to="`/app/${orgSlug}/content`"
        class="card p-5 hover:border-signal-500 transition-colors block"
      >
        <p class="text-paper-400 text-sm">Content</p>
        <p class="text-2xl mt-1">Manage →</p>
      </NuxtLink>
      <NuxtLink
        v-if="isManager"
        :to="`/app/${orgSlug}/team`"
        class="card p-5 hover:border-signal-500 transition-colors block"
      >
        <p class="text-paper-400 text-sm">Team members</p>
        <p class="text-2xl mt-1">Manage →</p>
      </NuxtLink>
      <div
        v-else
        class="card p-5"
      >
        <p class="text-paper-400 text-sm">
          Team members
        </p>
        <p class="text-2xl mt-1">
          —
        </p>
      </div>
      <NuxtLink
        v-if="isManager"
        :to="`/app/${orgSlug}/reports`"
        class="card p-5 hover:border-signal-500 transition-colors block"
      >
        <p class="text-paper-400 text-sm">Open reports</p>
        <p
          class="text-2xl mt-1 font-mono"
          :class="openReports > 0 ? 'text-signal-500' : ''"
        >{{ openReports }}</p>
      </NuxtLink>
      <div
        v-else
        class="card p-5"
      >
        <p class="text-paper-400 text-sm">
          Open reports
        </p>
        <p class="text-2xl mt-1">
          —
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-member' })

const route = useRoute()
const orgSlug = route.params.org as string
const supabase = useSupabaseClient()
const { membership, isManager } = useCurrentOrg()
const openReports = ref(0)

async function loadReportCount() {
  if (!membership.value || !isManager.value) return
  const { count } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', membership.value.org_id)
    .eq('status', 'open')
  openReports.value = count ?? 0
}

watch(membership, (v) => { if (v) loadReportCount() }, { immediate: true })

useSeoMeta({ title: () => membership.value?.organizations.name ?? 'Dashboard' })
</script>
