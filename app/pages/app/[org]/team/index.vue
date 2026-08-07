<template>
  <section class="max-w-3xl mx-auto px-6 py-12">
    <p class="badge mb-2">TEAM</p>
    <h1 class="text-3xl mb-8">{{ membership?.organizations.name }}</h1>

    <h2 class="text-lg mb-3">Members</h2>
    <div class="card divide-y divide-ink-700 mb-10">
      <div v-for="m in roster" :key="m.user_id" class="flex items-center justify-between p-4">
        <div>
          <p>{{ m.profiles?.full_name || 'Unnamed' }}</p>
          <p class="text-xs text-paper-400 font-mono">{{ m.role }}</p>
        </div>
        <select v-if="m.role !== 'owner'" v-model="m.role" class="bg-ink-900 border border-ink-600 rounded-md px-2 py-1 text-sm"
          @change="updateRole(m)">
          <option value="manager">manager</option>
          <option value="member">member</option>
        </select>
      </div>
      <p v-if="!roster.length" class="p-4 text-paper-400 text-sm">No members yet.</p>
    </div>

    <h2 class="text-lg mb-3">Invite someone</h2>
    <form class="card p-6 space-y-4" @submit.prevent="sendInvite">
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="invite-email">Email</label>
        <input id="invite-email" v-model="inviteEmail" type="email" required
          class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2 focus:border-signal-500" />
      </div>
      <div>
        <label class="block text-sm text-paper-200 mb-1" for="invite-role">Role</label>
        <select id="invite-role" v-model="inviteRole" class="w-full rounded-md bg-ink-900 border border-ink-600 px-3 py-2">
          <option value="member">Member</option>
          <option value="manager">Manager</option>
        </select>
      </div>

      <p v-if="errorMessage" class="text-danger-500 text-sm">{{ errorMessage }}</p>
      <div v-if="lastInviteLink" class="text-sm">
        <p class="text-live-500 mb-1">Invite created. Share this link:</p>
        <code class="block bg-ink-900 border border-ink-600 rounded-md px-3 py-2 break-all text-xs">{{ lastInviteLink }}</code>
      </div>

      <button type="submit" :disabled="inviting"
        class="rounded-md bg-signal-500 px-4 py-2.5 font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50">
        {{ inviting ? 'Sending…' : 'Create invite' }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'require-manager' })

const route = useRoute()
const orgSlug = route.params.org as string
const supabase = useSupabaseClient()
const { membership } = useCurrentOrg()

const roster = ref<any[]>([])
const inviteEmail = ref('')
const inviteRole = ref<'member' | 'manager'>('member')
const inviting = ref(false)
const errorMessage = ref('')
const lastInviteLink = ref('')

async function loadRoster() {
  if (!membership.value) return
  const { data } = await supabase
    .from('memberships')
    .select('user_id, role, profiles(full_name)')
    .eq('org_id', membership.value.org_id)
    .eq('status', 'active')
  roster.value = data ?? []
}

async function updateRole(m: any) {
  await supabase
    .from('memberships')
    .update({ role: m.role })
    .eq('org_id', membership.value!.org_id)
    .eq('user_id', m.user_id)
}

async function sendInvite() {
  inviting.value = true
  errorMessage.value = ''
  lastInviteLink.value = ''

  const { data, error } = await supabase
    .from('invites')
    .insert({
      org_id: membership.value!.org_id,
      email: inviteEmail.value,
      role: inviteRole.value,
      invited_by: membership.value!.user_id
    })
    .select('token')
    .single()

  inviting.value = false
  if (error) {
    errorMessage.value = error.message
    return
  }
  lastInviteLink.value = `${window.location.origin}/join/${data.token}`
  inviteEmail.value = ''
}

watch(membership, (v) => { if (v) loadRoster() }, { immediate: true })

useSeoMeta({ title: () => `Team · ${membership.value?.organizations.name ?? ''}` })
</script>
