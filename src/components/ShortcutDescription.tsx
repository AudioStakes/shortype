import Key from '@/components/Key'
import GameKey from '@/stores/game-key'
import Keyboard from '@/utils/keyboard'
import { useStrictContext } from '@/utils/use-strict-context'

type Props = {
  isFillInBlankMode?: boolean
}

export default function ShortcutDescription({
  isFillInBlankMode = false,
}: Props) {
  const {
    wordsOfDescriptionFilledByCorrectKeys,
    wordsOfDescriptionFilledByPressedKeys,
  } = useStrictContext(GameKey, 'GameKey')

  const words = isFillInBlankMode
    ? wordsOfDescriptionFilledByPressedKeys
    : wordsOfDescriptionFilledByCorrectKeys

  return (
    <div class="flex flex-wrap justify-center items-center align-center space-x-2">
      {words.map((word, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: tokens keep their position as blank keys are filled
        <div key={`${word}-${index}`}>
          {Keyboard.isKey(word) || word === '' ? (
            <Key keyName={word} class="scale-[0.8]" />
          ) : (
            <span class="text-xl">{word}</span>
          )}
        </div>
      ))}
    </div>
  )
}
