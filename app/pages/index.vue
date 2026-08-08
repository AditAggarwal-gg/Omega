<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-omega-watermark bg-no-repeat bg-top bg-contain"
      aria-hidden="true"
    />

    <div
      class="pointer-events-none absolute right-[6%] top-[28%] h-[420px] w-[420px] rounded-full bg-signal-500/50 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute right-[22%] top-[8%] h-[300px] w-[300px] rounded-full bg-live-500/40 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-live-500/20 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span class="badge border-signal-500/40 bg-signal-500/10 text-signal-600 mb-6">MULTI-ORG · SAFE BY DEFAULT</span>
        <h1 class="text-6xl leading-[1.03] font-bold">
          Every team,<br>
          its own<br>
          frequency.
        </h1>
        <p class="mt-6 text-paper-200 max-w-md text-lg">
          Omega gives every organization its own isolated space to publish
          articles, video, and audio — with role-based access, premium
          content, and tenant isolation enforced at the database level.
        </p>
        <div class="mt-8 flex gap-3">
          <NuxtLink
            to="/signup"
            class="rounded-lg bg-ink-950 px-6 py-3 font-medium text-ink-900 hover:opacity-90"
          >
            Start your organization
          </NuxtLink>
          <NuxtLink
            to="/content"
            class="glass-panel rounded-lg px-6 py-3 font-medium hover:border-signal-500"
          >
            Browse content
          </NuxtLink>
        </div>
      </div>

      <div class="relative glass-panel rounded-2xl p-6">
        <div class="flex items-center gap-2 text-live-500 text-sm font-mono mb-4">
          <span class="signal-dot" /> ORG STATUS: LIVE
        </div>
        <ul class="space-y-3 text-sm">
          <li class="flex justify-between border-b border-white/40 pb-2">
            <span class="text-paper-400">Tenant isolation</span>
            <span class="font-medium">Row Level Security</span>
          </li>
          <li class="flex justify-between border-b border-white/40 pb-2">
            <span class="text-paper-400">Roles</span>
            <span class="font-medium">Owner · Manager · Member</span>
          </li>
          <li class="flex justify-between">
            <span class="text-paper-400">Content</span>
            <span class="font-medium">Articles · Video · Audio</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Omega — multi-organization publishing platform',
  description: 'Every team gets an isolated space to publish articles, video, and audio, with role-based access and premium content.',
})
</script>
