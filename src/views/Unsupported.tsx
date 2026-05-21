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
    <div class="w-screen h-screen absolute top-0">
      <button
        type="button"
        class="w-screen h-screen bg-black opacity-30"
        aria-label="Close unsupported browser notice"
        onClick={onProceed}
      />
      <div class="z-10 w-3/4 max-w-[50rem] flex flex-col items-center gap-2 p-4 bg-white border-4 border-gray-500 rounded-lg top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute">
        <div class="flex flex-col">
          <IconGlyph
            name="information-circle"
            class="h-20 w-20 md:h-40 md:w-40 text-gray-500 mx-auto"
          />
          <div class="grid">
            <h1 class="text-2xl md:text-3xl self-center my-6">
              サポートされている{' '}
              <span class="font-bold">{notSupportedKinds.join('・')}</span>
              をご使用ください
            </h1>
          </div>
          <div>
            <ul>
              <li class="flex my-0.5">
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
              <li class="flex my-0.5">
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
          class="bg-gray-200 hover:bg-gray-300 my-4 py-2 px-4 rounded w-fit mx-auto"
          onClick={onProceed}
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
