import { reactive, readonly } from 'vue'

const createModalStore = () => {
  const modalState = reactive({
    isAboutModalVisible: false,
    isToolsAndCategoriesModalVisible: false,
  })

  const showAboutModal = () => {
    modalState.isAboutModalVisible = true
  }

  const hideAboutModal = () => {
    modalState.isAboutModalVisible = false
  }

  const showToolsAndCategoriesModal = () => {
    modalState.isToolsAndCategoriesModalVisible = true
  }

  const hideToolsAndCategoriesModal = () => {
    modalState.isToolsAndCategoriesModalVisible = false
  }

  return {
    modalState: readonly(modalState),

    showAboutModal,
    hideAboutModal,

    showToolsAndCategoriesModal,
    hideToolsAndCategoriesModal,
  }
}

export default createModalStore
export type ModalStore = ReturnType<typeof createModalStore>
