import ModalKey from '@/stores/modal-key'
import { injectStrict } from '@/utils/inject-strict'

export default function Header() {
  const { showAboutModal, showToolsAndCategoriesModal } = injectStrict(
    ModalKey,
    'ModalKey',
  )

  return (
    <header class="w-full flex flex-col gap-3 self-center px-4 py-3 bg-gray-200 sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <div class="flex flex-col gap-0.5 sm:flex-row sm:items-center">
        <span class="text-2xl font-bold sm:mx-2 sm:text-3xl">Shortype</span>
        <span class="text-sm sm:m-2 sm:text-base">ショートカットキークイズ</span>
      </div>
      <nav class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          class="w-full px-4 py-2 cursor-pointer hover:text-black transition duration-200 hover:ease-out sm:w-auto"
          onClick={showAboutModal}
        >
          About
        </button>
        <button
          type="button"
          class="w-full border rounded-full px-4 py-2 bg-white hover:bg-gray-300 transition duration-200 hover:ease-out sm:w-auto"
          onClick={showToolsAndCategoriesModal}
        >
          <span class="mx-2 font-bold text-[14px]">ツールを選ぶ</span>
          <kbd class="h-6 bg-white text-[12px] rounded border-[1px] border-gray-300 shadow-3d-sm px-2 py-1 relative -top-px">
            T
          </kbd>
        </button>
      </nav>
    </header>
  )
}
