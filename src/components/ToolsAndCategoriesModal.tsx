import { useState } from 'preact/hooks'

import CategorySelect from '@/components/CategorySelect'
import Modal from '@/components/Modal'
import ModalContent from '@/components/ModalContent'
import ToolSelect from '@/components/ToolSelect'
import GameKey from '@/stores/game-key'
import ModalKey from '@/stores/modal-key'
import { injectStrict } from '@/utils/inject-strict'

export default function ToolsAndCategoriesModal() {
  const { state, selectToolAndCategories, exitSelectionOfToolAndCategories } =
    injectStrict(GameKey, 'GameKey')
  const { modalState, hideToolsAndCategoriesModal } = injectStrict(
    ModalKey,
    'ModalKey',
  )
  const [tool, setTool] = useState('')

  const select = (categories: string[]) => {
    selectToolAndCategories(tool, categories)
    hideToolsAndCategoriesModal()
  }

  const hide = () => {
    exitSelectionOfToolAndCategories()
    setTool('')
    hideToolsAndCategoriesModal()
  }

  return (
    <Modal
      isShow={
        state.isSelectToolsKeyPressed ||
        modalState.isToolsAndCategoriesModalVisible
      }
      onClose={hide}
    >
      <ModalContent isShow={tool === ''} isEnterFromRight={true}>
        <ToolSelect onSelectTool={setTool} />
      </ModalContent>
      <ModalContent isShow={tool !== ''} isEnterFromRight={false}>
        <CategorySelect
          tool={tool}
          categories={[...state.categories]}
          onSelectToolAndCategories={select}
          onResetTool={() => setTool('')}
        />
      </ModalContent>
    </Modal>
  )
}
