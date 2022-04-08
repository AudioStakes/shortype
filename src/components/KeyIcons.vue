<script setup lang="ts">
import {
  BrightnessDownIcon,
  BrightnessUpIcon,
  PlayerEjectIcon,
  PowerIcon,
  Volume2Icon,
  VolumeIcon,
} from 'vue-tabler-icons'

import KeyboardBackLightDownImg from '@/assets/keyboard_backlight_down.png'
import KeyboardBackLightUpImg from '@/assets/keyboard_backlight_up.png'
import MissionControlImg from '@/assets/mission_control.png'

defineProps<{ iconName: string }>()
</script>

<template>
  <BrightnessDownIcon v-if="iconName === 'BrightnessDown'" />
  <BrightnessUpIcon v-else-if="iconName === 'BrightnessUp'" />
  <PlayerEjectIcon v-else-if="iconName === 'PlayerEject'" />
  <PowerIcon v-else-if="iconName === 'Power'" />
  <VolumeIcon v-else-if="iconName === 'VolumeUp'" />
  <Volume2Icon v-else-if="iconName === 'VolumeDown'" />
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
