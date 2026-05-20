<script setup lang="ts">
defineProps<{
  name:
    | 'arrow-left'
    | 'arrow-path'
    | 'brightness-down'
    | 'brightness-up'
    | 'check'
    | 'check-circle'
    | 'chevron-right'
    | 'information-circle'
    | 'player-eject'
    | 'power'
    | 'volume-down'
    | 'volume-up'
    | 'x-circle'
    | 'x-mark'
}>()
</script>

<template>
  <svg
    v-if="name === 'arrow-left'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <path d="M10 5 3 12l7 7" />
    <path d="M4 12h17" />
  </svg>

  <svg
    v-else-if="name === 'arrow-path'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <path d="M4 12a8 8 0 0 1 13.66-5.66" />
    <path d="M16 4h3v3" />
    <path d="M20 12a8 8 0 0 1-13.66 5.66" />
    <path d="M8 20H5v-3" />
  </svg>

  <svg
    v-else-if="name === 'brightness-down'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
    <path d="M8 16h8" />
  </svg>

  <svg
    v-else-if="name === 'brightness-up'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M4.93 19.07l1.41-1.41" />
    <path d="M17.66 6.34l1.41-1.41" />
  </svg>

  <svg
    v-else-if="name === 'check'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2.5"
    aria-hidden="true"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>

  <svg
    v-else-if="name === 'check-circle'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path
      d="M9.2 12.7 11.2 14.7 15.3 9.9"
      fill="none"
      stroke="white"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2.5"
    />
  </svg>

  <svg
    v-else-if="name === 'chevron-right'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2.5"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>

  <svg
    v-else-if="name === 'information-circle'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>

  <svg
    v-else-if="name === 'player-eject'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <path d="M6 14h12" />
    <path d="m7 11 5-5 5 5" />
  </svg>

  <svg
    v-else-if="name === 'power'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <path d="M12 2v10" />
    <path d="M8.5 4.5a8 8 0 1 0 7 0" />
  </svg>

  <svg
    v-else-if="name === 'volume-up'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <path d="M5 15h4l5 4V5l-5 4H5z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
    <path d="M18.5 6.5a7 7 0 0 1 0 11" />
  </svg>

  <svg
    v-else-if="name === 'volume-down'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    aria-hidden="true"
  >
    <path d="M5 15h4l5 4V5l-5 4H5z" />
    <path d="M16 10v4" />
  </svg>

  <svg
    v-else-if="name === 'x-circle'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path
      d="M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"
      fill="none"
      stroke="white"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2.5"
    />
  </svg>

  <svg
    v-else-if="name === 'x-mark'"
    v-bind="$attrs"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2.5"
    aria-hidden="true"
  >
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
</template>
