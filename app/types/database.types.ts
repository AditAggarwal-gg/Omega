// Placeholder — regenerate against your real project once migrations are
// applied:
//
//   npx supabase gen types --lang=typescript --local > app/types/database.types.ts
//
// Keeping a minimal but structurally valid file here so the app type-checks
// before you've linked a Supabase project.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, { Row: any, Insert: any, Update: any }>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
