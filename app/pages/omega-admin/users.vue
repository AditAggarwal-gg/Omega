<template>
  <section class="max-w-3xl mx-auto px-6 py-12">
    <p class="badge mb-2">
      PLATFORM ADMIN
    </p>
    <h1 class="text-3xl mb-8">
      Users
    </h1>

    <input
      v-model="search"
      type="search"
      placeholder="Search by name…"
      class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 mb-6 focus:border-signal-500"
    >

    <div
      v-if="pending"
      class="text-paper-400"
    >
      Loading…
    </div>
    <div
      v-else
      class="card divide-y divide-ink-700"
    >
      <div
        v-for="p in filtered"
        :key="p.id"
        class="p-4 flex items-center justify-between"
      >
        <div>
          <p class="font-medium">
            {{ p.full_name || 'Unnamed' }}
          </p>
          <p
            v-if="p.is_platform_admin"
            class="text-xs text-signal-500 font-mono"
          >
            platform admin
          </p>
        </div>
        <button
          class="text-sm text-paper-400 hover:text-signal-500"
          @click="toggleAdmin(p)"
        >
          {{ p.is_platform_admin ? 'Revoke admin' : 'Make admin' }}
        </button>
      </div>
      <p
        v-if="!filtered.length"
        class="p-4 text-paper-400 text-sm"
      >
        No users found.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-platform-admin' })
useSeoMeta({ title: 'Manage users' })

const supabase = useSupabaseClient()
const profiles = ref<any[]>([])
const pending = ref(true)
const search = ref('')

const filtered = computed(() => {
  if (!search.value.trim()) return profiles.value
  const q = search.value.toLowerCase()
  return profiles.value.filter(p => (p.full_name ?? '').toLowerCase().includes(q))
})

async function load() {
  pending.value = true
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  profiles.value = data ?? []
  pending.value = false
}

async function toggleAdmin(p: any) {
  const makeAdmin = !p.is_platform_admin
  if (!confirm(`${makeAdmin ? 'Grant' : 'Revoke'} platform admin for ${p.full_name || 'this user'}?`)) return
  const { error } = await supabase.rpc('set_platform_admin', { target_user: p.id, make_admin: makeAdmin })
  if (!error) p.is_platform_admin = makeAdmin
}

onMounted(load)
</script>
