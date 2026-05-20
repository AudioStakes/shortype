<script setup lang="ts">
import KeyboardBackLightDownImg from '@/assets/key-icons/keyboard-backlight-down.png'
import KeyboardBackLightUpImg from '@/assets/key-icons/keyboard-backlight-up.png'
import MissionControlImg from '@/assets/key-icons/mission-control.png'
import IconGlyph from '@/components/IconGlyph.vue'

defineProps<{ iconName: string }>()
</script>

<template>
  <IconGlyph v-if="iconName === 'BrightnessDown'" name="brightness-down" />
  <IconGlyph v-else-if="iconName === 'BrightnessUp'" name="brightness-up" />
  <IconGlyph v-else-if="iconName === 'PlayerEject'" name="player-eject" />
  <IconGlyph v-else-if="iconName === 'Power'" name="power" />
  <IconGlyph v-else-if="iconName === 'VolumeUp'" name="volume-up" />
  <IconGlyph v-else-if="iconName === 'VolumeDown'" name="volume-down" />
  <img
    v-else-if="iconName === 'KeyboardBacklightUp'"
    class="h-10 w-10"
    :src="KeyboardBackLightUpImg"
  />
  <img
    v-else-if="iconName === 'KeyboardBacklightDown'"
    class="h-10 w-10"
    :src="KeyboardBackLightDownImg"
  />
  <img
    v-else-if="iconName === 'MissionControl'"
    class="h-10 w-10"
    :src="MissionControlImg"
  />
</template>
