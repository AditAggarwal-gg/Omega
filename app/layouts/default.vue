<template>
  <div class="min-h-full flex flex-col">
    <header class="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-40">
      <nav class="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <NuxtLink to="/" class="flex items-center gap-2 font-display text-lg text-paper-50">
          <span class="signal-dot" aria-hidden="true" />
          Omega
        </NuxtLink>
        <div class="flex items-center gap-6 text-sm text-paper-200">
          <NuxtLink to="/content" class="hover:text-paper-50">Content</NuxtLink>
          <NuxtLink to="/pricing" class="hover:text-paper-50">Premium</NuxtLink>
          <template v-if="user">
            <NuxtLink to="/app" class="hover:text-paper-50">Dashboard</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="hover:text-paper-50">Sign in</NuxtLink>
            <NuxtLink to="/signup" class="rounded-md bg-signal-500 px-3 py-1.5 font-medium text-ink-950 hover:bg-signal-400">
              Get started
            </NuxtLink>
          </template>
        </div>
      </nav>
      <div class="frequency-divider" aria-hidden="true" />
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-ink-700 py-8 text-center text-xs text-paper-400">
      © {{ new Date().getFullYear() }} Omega. Built on Nuxt + Supabase.
    </footer>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
