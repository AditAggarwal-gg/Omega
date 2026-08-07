<template>
  <section class="max-w-6xl mx-auto px-6 pt-24 pb-20 grid md:grid-cols-2 gap-12 items-center">
    <div>
      <p class="badge mb-4">MULTI-ORG · SAFE BY DEFAULT</p>
      <h1 class="text-5xl leading-[1.05] font-medium">
        One platform.<br />
        Every team broadcasting<br />
        <span class="text-signal-500">on its own frequency.</span>
      </h1>
      <p class="mt-6 text-paper-200 max-w-md">
        Omega gives every organization its own isolated space to publish
        articles, video, and audio — with role-based access, premium
        content, and tenant isolation enforced at the database level.
      </p>
      <div class="mt-8 flex gap-3">
        <NuxtLink to="/signup" class="rounded-md bg-signal-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-signal-400">
          Start your organization
        </NuxtLink>
        <NuxtLink to="/content" class="rounded-md border border-ink-600 px-5 py-2.5 font-medium hover:border-signal-500">
          Browse public content
        </NuxtLink>
      </div>
    </div>
    <div class="card p-8">
      <div class="flex items-center gap-2 text-live-500 text-sm font-mono">
        <span class="signal-dot" /> ORG STATUS: LIVE
      </div>
      <ul class="mt-6 space-y-3 text-sm">
        <li class="flex justify-between border-b border-ink-700 pb-2">
          <span class="text-paper-400">Tenant isolation</span>
          <span>Row Level Security</span>
        </li>
        <li class="flex justify-between border-b border-ink-700 pb-2">
          <span class="text-paper-400">Roles</span>
          <span>Owner · Manager · Member</span>
        </li>
        <li class="flex justify-between border-b border-ink-700 pb-2">
          <span class="text-paper-400">Content</span>
          <span>Articles · Video · Audio</span>
        </li>
        <li class="flex justify-between">
          <span class="text-paper-400">Analytics</span>
          <span>Cookie-free, first-party</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Omega — multi-organization publishing platform',
  description: 'Every team gets an isolated space to publish articles, video, and audio, with role-based access and premium content.'
})
</script>
