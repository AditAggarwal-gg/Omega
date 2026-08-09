// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Relaxed deliberately for this project: a lot of Supabase query
      // results are typed `any` for speed rather than hand-writing every
      // row shape. Not a real safety issue — RLS is the actual security
      // boundary, not TypeScript's type checker.
      '@typescript-eslint/no-explicit-any': 'off',
      '@stylistic/max-statements-per-line': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
)
