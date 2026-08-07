<template>
  <section class="max-w-2xl mx-auto px-6 py-16">
    <p class="badge mb-4">YOUR ORGANIZATIONS</p>

    <div v-if="pending" class="text-paper-400">Loading…</div>

    <div v-else-if="memberships.length" class="space-y-3 mb-10">
      <NuxtLink v-for="m in memberships" :key="m.org_id" :to="`/app/${m.organizations.slug}`"
        class="card p-4 flex items-center justify-between hover:border-signal-500 transition-colors">
        <div>
          <p class="font-medium">{{ m.organizations.name }}</p>
          <p class="text-xs text-paper-400 font-mono">{{ m.role }}</p>
        </div>
        <span class="text-paper-400">→</span>
      </NuxtLink>
    </div>

    <div v-else class="card p-6 mb-10 text-paper-200">
      You're not part of an organization yet. Create one below, or ask a
      teammate for an invite link.
    </div>

    <h2 class="text-xl mb-3">Create a new organization</h2>
    <form class="card p-6 space-y-4" @submit.prevent="handleCreate">
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="org-name">Organization name</label>
        <input id="org-name" v-model="name" type="text" required placeholder="Acme Inc"
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500"
          @input="onNameInput" />
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="org-slug">URL slug</label>
        <div class="flex items-center gap-2">
          <span class="text-paper-400 text-sm font-mono">/app/</span>
          <input id="org-slug" v-model="slug" type="text" required pattern="[a-z0-9-]+"
            class="flex-1 rounded-md bg-ink-900 border border-ink-600 px-3 py-2 font-mono text-sm focus:border-signal-500" />
        </div>
      </div>

      <p v-if="errorMessage" class="text-danger-500 text-sm">{{ errorMessage }}</p>

      <button type="submit" :disabled="creating"
        class="rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50">
        {{ creating ? 'Creating…' : 'Create organization' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Your organizations' })

const supabase = useSupabaseClient()
const router = useRouter()

const memberships = ref<any[]>([])
const pending = ref(true)
const name = ref('')
const slug = ref('')
const slugTouched = ref(false)
const creating = ref(false)
const errorMessage = ref('')

function onNameInput() {
  if (slugTouched.value) return
  slug.value = name.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function loadMemberships() {
  pending.value = true
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    pending.value = false
    return
  }
  const { data } = await supabase
    .from('memberships')
    .select('org_id, role, organizations(name, slug)')
    .eq('user_id', currentUser.id)
    .eq('status', 'active')
  memberships.value = data ?? []
  pending.value = false

  if (memberships.value.length === 1) {
    router.replace(`/app/${memberships.value[0].organizations.slug}`)
  }
}

async function handleCreate() {
  creating.value = true
  errorMessage.value = ''
  const { data, error } = await supabase.rpc('create_organization', {
    p_name: name.value,
    p_slug: slug.value
  })
  creating.value = false
  if (error) {
    errorMessage.value = error.message.includes('duplicate')
      ? 'That slug is already taken — try another.'
      : error.message
    return
  }
  router.push(`/app/${(data as any).slug}`)
}

onMounted(loadMemberships)
</script>
