export default defineNuxtRouteMiddleware(async (to) => {
  const slug = to.params.org as string
  if (!slug) return

  const { membership, loadForSlug } = useCurrentOrg()
  await loadForSlug(slug)

  if (!membership.value) {
    return navigateTo('/app')
  }
})
