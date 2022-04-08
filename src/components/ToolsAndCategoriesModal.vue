<script setup lang="ts">
import { ref } from 'vue'

import CategorySelect from '@/components/CategorySelect.vue'
import Modal from '@/components/Modal.vue'
import ModalContent from '@/components/ModalContent.vue'
import ToolSelect from '@/components/ToolSelect.vue'
import GameKey from '@/stores/gameKey'
import ModalKey from '@/stores/modalKey'
import { injectStrict } from '@/utils/injectStrict'

const { state, selectToolAndCategories } = injectStrict(GameKey)
const { modalState, hideToolsAndCategoriesModal } = injectStrict(ModalKey)
defineProps<{ isShow: boolean }>()

const tool = ref('')

const select = (categories: string[]) => {
  selectToolAndCategories(tool.value, categories)
  hideToolsAndCategoriesModal()
}
</script>

<template>
  <Modal
    ref="modal"
    :is-show="
      state.isSelectToolsKeyPressed || modalState.isShowToolsAndCategoriesModal
    "
  >
    <ModalContent :is-show="tool === ''" :is-enter-from-right="true">
      <ToolSelect @select-tool="(selectedTool) => (tool = selectedTool)" />
    </ModalContent>
    <ModalContent :is-show="tool !== ''" :is-enter-from-right="false">
      <CategorySelect
        :tool="tool"
        :categories="[...state.categories]"
        @select-tool-and-categories="(categories) => select(categories)"
        @reset-tool="tool = ''"
      /> </ModalContent
  ></Modal>
</template>
