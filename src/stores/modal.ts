import { reactive, readonly } from 'vue'

const modalStore = () => {
  const modalState = reactive({
    isShowAboutModal: false,
    isShowToolsAndCategoriesModal: false,
  })

  const showAboutModal = () => {
    modalState.isShowAboutModal = true
  }

  const hideAboutModal = () => {
    modalState.isShowAboutModal = false
  }

  const showToolsAndCategoriesModal = () => {
    modalState.isShowToolsAndCategoriesModal = true
  }

  const hideToolsAndCategoriesModal = () => {
    modalState.isShowToolsAndCategoriesModal = false
  }

  return {
    modalState: readonly(modalState),

    showAboutModal,
    hideAboutModal,

    showToolsAndCategoriesModal,
    hideToolsAndCategoriesModal,
  }
}

export default modalStore
export type ModalStore = ReturnType<typeof modalStore>
