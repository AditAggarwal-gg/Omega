import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  adminClient, clientAsUser, createTestUser, deleteTestUser,
  createTestOrg, deleteTestOrg
} from './helpers'

describe('tenant isolation', () => {
  let userA: Awaited<ReturnType<typeof createTestUser>>
  let userB: Awaited<ReturnType<typeof createTestUser>>
  let orgA: { id: string; slug: string }
  let orgB: { id: string; slug: string }
  let privateContentId: string

  beforeAll(async () => {
    userA = await createTestUser('a')
    userB = await createTestUser('b')

    const clientA = await clientAsUser(userA.email, userA.password)
    const clientB = await clientAsUser(userB.email, userB.password)

    orgA = await createTestOrg(clientA, 'org-a')
    orgB = await createTestOrg(clientB, 'org-b')

    const { data: content, error } = await clientA
      .from('content_items')
      .insert({
        org_id: orgA.id,
        author_id: userA.id,
        type: 'article',
        title: 'Org A internal draft',
        slug: 'org-a-internal-draft',
        body: 'Should never be visible to User B.',
        status: 'draft'
      })
      .select('id')
      .single()
    if (error) throw error
    privateContentId = content.id
  })

  afterAll(async () => {
    await deleteTestOrg(orgA.id)
    await deleteTestOrg(orgB.id)
    await deleteTestUser(userA.id)
    await deleteTestUser(userB.id)
  })

  it('blocks User B from reading User A org\'s draft content', async () => {
    const clientB = await clientAsUser(userB.email, userB.password)
    const { data, error } = await clientB
      .from('content_items')
      .select('*')
      .eq('id', privateContentId)

    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('blocks User B from reading User A org\'s membership list', async () => {
    const clientB = await clientAsUser(userB.email, userB.password)
    const { data } = await clientB
      .from('memberships')
      .select('*')
      .eq('org_id', orgA.id)

    expect(data).toHaveLength(0)
  })

  it('blocks User B from inserting content into User A\'s org', async () => {
    const clientB = await clientAsUser(userB.email, userB.password)
    const { error } = await clientB.from('content_items').insert({
      org_id: orgA.id,
      author_id: userB.id,
      type: 'article',
      title: 'Injected by an outsider',
      slug: 'injected',
      status: 'draft'
    })

    expect(error).not.toBeNull()
  })

  it('allows User A to read their own org\'s draft content', async () => {
    const clientA = await clientAsUser(userA.email, userA.password)
    const { data, error } = await clientA
      .from('content_items')
      .select('*')
      .eq('id', privateContentId)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0].title).toBe('Org A internal draft')
  })

  it('does not let a member of Org B become manager of Org A', async () => {
    const clientB = await clientAsUser(userB.email, userB.password)
    await clientB
      .from('memberships')
      .update({ role: 'owner' })
      .eq('org_id', orgA.id)
      .eq('user_id', userB.id)

    const { data: check } = await adminClient
      .from('memberships')
      .select('role')
      .eq('org_id', orgA.id)
      .eq('user_id', userB.id)
    expect(check).toHaveLength(0)
  })
})
