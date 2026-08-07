export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return navigateTo('/login')

  const { data } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single()

  if (!data?.is_platform_admin) {
    return navigateTo('/app')
  }
})
