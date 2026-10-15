import IconGlyph from '@/components/IconGlyph'

type Props = {
  isUnsupportedBrowser: boolean
  isUnsupportedOs: boolean
  onProceed: () => void
}

export default function Unsupported({
  isUnsupportedBrowser,
  isUnsupportedOs,
  onProceed,
}: Props) {
  const notSupportedKinds: string[] = []

  if (isUnsupportedBrowser) notSupportedKinds.push('ブラウザ')
  if (isUnsupportedOs) notSupportedKinds.push('OS')

  return (
    <div class="overlay-shell">
      <button
        type="button"
        class="overlay-backdrop"
        aria-label="Close unsupported browser notice"
        onClick={onProceed}
      />
      <div class="overlay-panel flex max-w-[50rem] flex-col items-center gap-2 rounded-lg border-4 border-gray-500 bg-white p-4">
        <div class="flex flex-col">
          <IconGlyph
            name="information-circle"
            class="mx-auto h-16 w-16 text-gray-500 md:h-40 md:w-40"
          />
          <div class="grid">
            <h1 class="my-4 self-center text-2xl md:my-6 md:text-3xl">
              サポートされている{' '}
              <span class="font-bold">{notSupportedKinds.join('・')}</span>
              をご使用ください
            </h1>
          </div>
          <div>
            <ul>
              <li class="my-0.5 flex">
                <div class="h-6 w-6 min-h-[1.4rem] min-w-[1.4rem] mx-2">
                  <IconGlyph
                    name={isUnsupportedBrowser ? 'x-circle' : 'check-circle'}
                    class={
                      isUnsupportedBrowser
                        ? 'text-red-400 inline-block'
                        : 'text-green-400 inline-block'
                    }
                  />
                </div>
                <div>
                  ブラウザは
                  <span class="font-bold">Google Chrome</span> もしくは
                  <span class="font-bold">Microsoft Edge</span>
                  をご使用ください
                </div>
              </li>
              <li class="my-0.5 flex">
                <div class="h-6 w-6 min-h-[1.4rem] min-w-[1.4rem] mx-2">
                  <IconGlyph
                    name={isUnsupportedOs ? 'x-circle' : 'check-circle'}
                    class={
                      isUnsupportedOs
                        ? 'text-red-400 inline-block'
                        : 'text-green-400 inline-block'
                    }
                  />
                </div>
                <div>
                  OSは <span class="font-bold">macOS</span> をご使用ください
                </div>
              </li>
            </ul>
          </div>
        </div>
        <button
          type="button"
          class="mx-auto my-3 inline-flex w-fit items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-gray-700 transition duration-200 hover:bg-gray-300 hover:ease-out"
          onClick={onProceed}
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
