<template>
  <section class="max-w-3xl mx-auto px-6 py-20">
    <p class="badge mb-4">
      PREMIUM
    </p>
    <h1 class="text-4xl mb-6">
      Premium access, per organization
    </h1>
    <p class="text-paper-200 mb-10 max-w-xl">
      Omega doesn't sell one global subscription — each organization sets
      its own premium content and grants access to whoever it chooses.
      Browse what's out there, and if something's locked, the organization
      that published it controls the key.
    </p>

    <div class="grid md:grid-cols-2 gap-4 mb-10">
      <div class="card p-6">
        <p class="text-signal-500 font-mono text-sm mb-2">
          FOR READERS
        </p>
        <h2 class="text-lg mb-2">
          Unlock premium content
        </h2>
        <p class="text-sm text-paper-400">
          If a piece is marked premium, its organization's owners or
          managers can grant you access directly — no global paywall,
          no separate checkout.
        </p>
      </div>
      <div class="card p-6">
        <p class="text-signal-500 font-mono text-sm mb-2">
          FOR ORGANIZATIONS
        </p>
        <h2 class="text-lg mb-2">
          Publish premium content
        </h2>
        <p class="text-sm text-paper-400">
          Mark any article, video, or audio piece as premium when you
          publish it. It stays fully discoverable, just gated until
          someone has access.
        </p>
      </div>
    </div>

    <div class="flex gap-3">
      <NuxtLink
        to="/content"
        class="rounded-md border border-ink-600 px-5 py-2.5 hover:border-signal-500"
      >
        Browse content
      </NuxtLink>
      <NuxtLink
        to="/signup"
        class="rounded-md bg-signal-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-signal-400"
      >
        Start an organization
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Premium', description: 'How premium content works on Omega.' })
</script>
