<script setup lang="ts">
import { ref } from 'vue'

import CategorySelect from '@/components/CategorySelect.vue'
import Modal from '@/components/Modal.vue'
import ModalContent from '@/components/ModalContent.vue'
import ToolSelect from '@/components/ToolSelect.vue'
import GameKey from '@/stores/gameKey'
import { injectStrict } from '@/utils/injectStrict'

const { state, updateToolAndCategories } = injectStrict(GameKey)
defineProps<{ isShow: boolean }>()

const tool = ref('')
</script>

<template>
  <Modal :is-show="state.isSelectToolsKeyPressed || isShow">
    <ModalContent :is-show="tool === ''" :is-enter-from-right="true">
      <ToolSelect @select-tool="(selectedTool) => (tool = selectedTool)" />
    </ModalContent>
    <ModalContent :is-show="tool !== ''" :is-enter-from-right="false">
      <CategorySelect
        :tool="tool"
        :categories="[...state.categories]"
        @update-tool-and-categories="
          (categories) => updateToolAndCategories(tool, categories)
        "
        @reset-tool="tool = ''"
      /> </ModalContent
  ></Modal>
</template>
