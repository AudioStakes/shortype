const createModalStore = (onChange: () => void = () => {}) => {
  const modalState = {
    isAboutModalVisible: false,
    isPrivacyModalVisible: false,
    isToolsAndCategoriesModalVisible: false,
  }

  const showAboutModal = () => {
    modalState.isAboutModalVisible = true
    onChange()
  }

  const hideAboutModal = () => {
    modalState.isAboutModalVisible = false
    onChange()
  }

  const showPrivacyModal = () => {
    modalState.isPrivacyModalVisible = true
    onChange()
  }

  const hidePrivacyModal = () => {
    modalState.isPrivacyModalVisible = false
    onChange()
  }

  const showToolsAndCategoriesModal = () => {
    modalState.isToolsAndCategoriesModalVisible = true
    onChange()
  }

  const hideToolsAndCategoriesModal = () => {
    modalState.isToolsAndCategoriesModalVisible = false
    onChange()
  }

  return {
    modalState,

    showAboutModal,
    hideAboutModal,

    showPrivacyModal,
    hidePrivacyModal,

    showToolsAndCategoriesModal,
    hideToolsAndCategoriesModal,
  }
}

export default createModalStore
export type ModalStore = ReturnType<typeof createModalStore>
