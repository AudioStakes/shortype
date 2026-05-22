import ModalKey from '@/stores/modal-key'
import { injectStrict } from '@/utils/inject-strict'

export default function Header() {
  const { showAboutModal, showToolsAndCategoriesModal } = injectStrict(
    ModalKey,
    'ModalKey',
  )

  return (
    <header class="flex w-full flex-col gap-2 self-center bg-gray-200 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-3">
      <div class="flex flex-col gap-0.5 sm:flex-row sm:items-center">
        <span class="text-xl font-bold sm:mx-2 sm:text-3xl">Shortype</span>
        <span class="text-xs sm:m-2 sm:text-base">
          ショートカットキークイズ
        </span>
      </div>
      <nav class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <button
          type="button"
          class="w-full cursor-pointer px-4 py-1.5 transition duration-200 hover:text-black hover:ease-out sm:w-auto sm:py-2"
          onClick={showAboutModal}
        >
          About
        </button>
        <button
          type="button"
          class="w-full rounded-full border border-gray-300 bg-white px-4 py-1.5 transition duration-200 hover:bg-gray-300 hover:ease-out sm:w-auto sm:py-2"
          onClick={showToolsAndCategoriesModal}
        >
          <span class="mx-2 font-bold text-[13px] sm:text-[14px]">
            ツールを選ぶ
          </span>
          <kbd class="ui-keycap-chip relative -top-px h-6 text-[12px] shadow-[1px_2px_0_rgb(208_213_219),1px_1px_0_rgb(208_213_219)]">
            T
          </kbd>
        </button>
      </nav>
    </header>
  )
}
