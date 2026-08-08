import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL!
const publishableKey = process.env.NUXT_PUBLIC_SUPABASE_KEY!
const secretKey = process.env.NUXT_SUPABASE_SECRET_KEY!

if (!url || !publishableKey || !secretKey) {
  throw new Error(
    'Missing Supabase env vars for tests. Set NUXT_PUBLIC_SUPABASE_URL, ' +
    'NUXT_PUBLIC_SUPABASE_KEY, and NUXT_SUPABASE_SECRET_KEY (in .env locally, ' +
    'or as repo secrets in CI).'
  )
}

export const adminClient: SupabaseClient = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function clientAsUser(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

const TEST_PASSWORD = 'omega-test-password-123'
let counter = 0

export async function createTestUser(label: string) {
  counter += 1
  const email = `omega-test-${Date.now()}-${counter}-${label}@example.com`
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: `Test ${label}` }
  })
  if (error) throw error
  return { id: data.user!.id, email, password: TEST_PASSWORD }
}

export async function deleteTestUser(userId: string) {
  await adminClient.auth.admin.deleteUser(userId)
}

export async function createTestOrg(ownerClient: SupabaseClient, namePrefix: string) {
  const slug = `${namePrefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const { data, error } = await ownerClient.rpc('create_organization', {
    p_name: slug,
    p_slug: slug
  })
  if (error) throw error
  return data as { id: string; slug: string; name: string }
}

export async function deleteTestOrg(orgId: string) {
  await adminClient.from('organizations').delete().eq('id', orgId)
}
