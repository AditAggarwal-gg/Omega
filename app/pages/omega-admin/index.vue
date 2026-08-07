<template>
  <section class="max-w-5xl mx-auto px-6 py-12">
    <p class="badge mb-2">PLATFORM ADMIN</p>
    <h1 class="text-3xl mb-8">Overview</h1>

    <div class="grid md:grid-cols-4 gap-4 mb-10">
      <div class="card p-5">
        <p class="text-paper-400 text-sm">Organizations</p>
        <p class="text-3xl mt-1 font-mono">{{ stats.orgs }}</p>
      </div>
      <div class="card p-5">
        <p class="text-paper-400 text-sm">Users</p>
        <p class="text-3xl mt-1 font-mono">{{ stats.users }}</p>
      </div>
      <div class="card p-5">
        <p class="text-paper-400 text-sm">Published content</p>
        <p class="text-3xl mt-1 font-mono">{{ stats.content }}</p>
      </div>
      <NuxtLink to="/omega-admin/reports" class="card p-5 hover:border-signal-500 transition-colors block">
        <p class="text-paper-400 text-sm">Open reports</p>
        <p class="text-3xl mt-1 font-mono" :class="stats.openReports > 0 ? 'text-signal-500' : ''">{{ stats.openReports }}</p>
      </NuxtLink>
    </div>

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl">Organizations</h2>
      <NuxtLink to="/omega-admin/users" class="text-sm text-paper-400 hover:text-signal-500">Manage users →</NuxtLink>
    </div>

    <div v-if="pending" class="text-paper-400">Loading…</div>
    <div v-else class="card divide-y divide-ink-700">
      <div v-for="org in orgs" :key="org.id" class="p-4 flex items-center justify-between">
        <div>
          <p class="font-medium">{{ org.name }}</p>
          <p class="text-xs text-paper-400 font-mono">/{{ org.slug }} · created {{ new Date(org.created_at).toLocaleDateString() }}</p>
        </div>
        <NuxtLink :to="`/app/${org.slug}`" class="text-sm text-paper-400 hover:text-signal-500">View →</NuxtLink>
      </div>
      <p v-if="!orgs.length" class="p-4 text-paper-400 text-sm">No organizations yet.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-platform-admin' })
useSeoMeta({ title: 'Admin overview' })

const supabase = useSupabaseClient()
const orgs = ref<any[]>([])
const pending = ref(true)
const stats = ref({ orgs: 0, users: 0, content: 0, openReports: 0 })

async function load() {
  pending.value = true

  const [orgsRes, usersRes, contentRes, reportsRes] = await Promise.all([
    supabase.from('organizations').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open')
  ])

  orgs.value = orgsRes.data ?? []
  stats.value = {
    orgs: orgsRes.data?.length ?? 0,
    users: usersRes.count ?? 0,
    content: contentRes.count ?? 0,
    openReports: reportsRes.count ?? 0
  }
  pending.value = false
}

onMounted(load)
</script>
