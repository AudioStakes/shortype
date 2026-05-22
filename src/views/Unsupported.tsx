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
      <div class="z-10 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[50rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 overflow-y-auto rounded-lg border-4 border-gray-500 bg-white p-4 top-1/2 left-1/2 absolute sm:w-3/4">
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
          class="mx-auto my-3 w-fit rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          onClick={onProceed}
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
