import type { Database } from '~/types/database.types'

type Membership = Database['public']['Tables']['memberships']['Row'] & {
  organizations: Database['public']['Tables']['organizations']['Row']
}

export const useCurrentOrg = () => {
  const supabase = useSupabaseClient<Database>()

  const membership = useState<Membership | null>('current-membership', () => null)
  const pending = useState<boolean>('current-membership-pending', () => false)

  async function loadForSlug(slug: string) {
    pending.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      membership.value = null
      pending.value = false
      return
    }
    const { data, error } = await supabase
      .from('memberships')
      .select('*, organizations!inner(*)')
      .eq('organizations.slug', slug)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    if (!error) membership.value = data as unknown as Membership
    pending.value = false
  }

  const role = computed(() => membership.value?.role ?? null)
  const isOwner = computed(() => role.value === 'owner')
  const isManager = computed(() => role.value === 'owner' || role.value === 'manager')

  return { membership, role, isOwner, isManager, pending, loadForSlug }
}
