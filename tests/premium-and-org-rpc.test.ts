import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  adminClient, clientAsUser, createTestUser, deleteTestUser,
  createTestOrg, deleteTestOrg,
} from './helpers'

describe('premium content gating', () => {
  let owner: Awaited<ReturnType<typeof createTestUser>>
  let outsider: Awaited<ReturnType<typeof createTestUser>>
  let org: { id: string, slug: string }
  let premiumSlug: string

  beforeAll(async () => {
    owner = await createTestUser('premium-owner')
    outsider = await createTestUser('premium-outsider')

    const ownerClient = await clientAsUser(owner.email, owner.password)
    org = await createTestOrg(ownerClient, 'org-premium')

    premiumSlug = 'gated-article'
    const { error } = await ownerClient.from('content_items').insert({
      org_id: org.id,
      author_id: owner.id,
      type: 'article',
      title: 'Gated article',
      slug: premiumSlug,
      summary: 'Teaser summary, safe to show anyone.',
      body: 'The real body — only entitled users should ever see this.',
      is_premium: true,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    if (error) throw error
  })

  afterAll(async () => {
    await deleteTestOrg(org.id)
    await deleteTestUser(owner.id)
    await deleteTestUser(outsider.id)
  })

  it('teaser RPC marks the piece locked for a user with no entitlement', async () => {
    const outsiderClient = await clientAsUser(outsider.email, outsider.password)
    const { data, error } = await outsiderClient.rpc('get_published_content', {
      p_org_slug: org.slug,
      p_slug: premiumSlug,
    })
    expect(error).toBeNull()
    const row = Array.isArray(data) ? data[0] : data
    expect(row.locked).toBe(true)
    expect(row.body).toBeUndefined()
  })

  it('blocks a non-entitled user from reading the real content row directly', async () => {
    const outsiderClient = await clientAsUser(outsider.email, outsider.password)
    const { data } = await outsiderClient
      .from('content_items')
      .select('*')
      .eq('org_id', org.id)
      .eq('slug', premiumSlug)
    expect(data).toHaveLength(0)
  })

  it('grants access once a premium subscription exists, and teaser reflects it', async () => {
    await adminClient.from('premium_subscriptions').insert({
      org_id: org.id,
      user_id: outsider.id,
      status: 'active',
    })

    const outsiderClient = await clientAsUser(outsider.email, outsider.password)
    const { data: teaser } = await outsiderClient.rpc('get_published_content', {
      p_org_slug: org.slug,
      p_slug: premiumSlug,
    })
    const row = Array.isArray(teaser) ? teaser[0] : teaser
    expect(row.locked).toBe(false)

    const { data: full } = await outsiderClient
      .from('content_items')
      .select('body')
      .eq('org_id', org.id)
      .eq('slug', premiumSlug)
      .single()
    expect(full?.body).toContain('only entitled users should ever see this')
  })
})

describe('org creation RPC', () => {
  let user: Awaited<ReturnType<typeof createTestUser>>
  let orgId: string | undefined

  beforeAll(async () => {
    user = await createTestUser('org-create')
  })

  afterAll(async () => {
    if (orgId) await deleteTestOrg(orgId)
    await deleteTestUser(user.id)
  })

  it('atomically creates the org and makes the caller its owner', async () => {
    const client = await clientAsUser(user.email, user.password)
    const org = await createTestOrg(client, 'atomic-org')
    orgId = org.id

    const { data: membership } = await adminClient
      .from('memberships')
      .select('role, status')
      .eq('org_id', org.id)
      .eq('user_id', user.id)
      .single()

    expect(membership?.role).toBe('owner')
    expect(membership?.status).toBe('active')
  })
})
