import Key from '@/components/Key'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'
import Keyboard from '@/utils/keyboard'

type Props = {
  isFillInBlankMode?: boolean
}

export default function ShortcutDescription({
  isFillInBlankMode = false,
}: Props) {
  const {
    wordsOfDescriptionFilledByCorrectKeys,
    wordsOfDescriptionFilledByPressedKeys,
  } = injectStrict(GameKey, 'GameKey')

  const words = isFillInBlankMode
    ? wordsOfDescriptionFilledByPressedKeys
    : wordsOfDescriptionFilledByCorrectKeys

  return (
    <div class="flex flex-wrap justify-center items-center align-center space-x-2">
      {words.map((word, index) => (
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
