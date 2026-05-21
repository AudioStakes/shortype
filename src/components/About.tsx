import imageOfPieChartAndTable from '@/assets/pie-chart-and-table.png'
import imageOfRemovingShortcutKey from '@/assets/removing-shortcut-key.png'
import imageOfToolSelectButton from '@/assets/tool-select-button.png'
import IconGlyph from '@/components/IconGlyph'
import ModalKey from '@/stores/modal-key'
import { injectStrict } from '@/utils/inject-strict'

type Props = {
  isShow: boolean
}

export default function About({ isShow }: Props) {
  const { hideAboutModal } = injectStrict(ModalKey, 'ModalKey')

  if (!isShow) {
    return null
  }

  return (
    <div data-testid="modal">
      <button
        type="button"
        class="z-10 absolute w-screen h-screen bg-black opacity-30 top-0"
        aria-label="Close about modal"
        onClick={hideAboutModal}
      />
      <div class="z-10 p-5 h-4/5 w-4/5 max-w-[45rem] overflow-y-auto flex flex-col bg-white border border-gray-300 rounded-lg top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute">
        <button
          type="button"
          class="self-end rounded-lg transition duration-200 hover:ease-out hover:bg-gray-200 hover:text-gray-900"
          aria-label="Close about modal"
          onClick={hideAboutModal}
        >
          <IconGlyph name="x-mark" class="h-6 text-gray-400" />
        </button>

        <div class="w-full flex flex-col space-y-4 text-left">
          <h1 class="text-3xl font-bold text-center">Shortype について</h1>
          <p>
            Shortype は、クイズに答えるだけで自然とショートカットキーが身につく
            Web サービスです。
          </p>
          <h2 class="text-lg font-bold">
            操作はショートカットキーを入力するだけ
          </h2>
          <p>
            出題内容にあったショートカットキーをタイプする（入力する）だけで、問題が次々に進んでいきます。正解したときはそのまま次の問題へ進み、不正解だったときは画面に表示された正解を入力します。
          </p>
          <p>
            この繰り返しにより、自然とショートカットキーが身につく仕組みとなっています。
          </p>
          <p>
            このシンプルな操作「Shortcut key を type する」はサービス名 Shortype
            にも反映しています。
          </p>
          <h2 class="text-lg font-bold">
            公式ドキュメントのショートカットキーを完全網羅
          </h2>
          <p>
            練習できるツールは「Google Chrome」と「macOS の
            Terminal」の2つがあります。どちらも公式ドキュメントに掲載されているショートカットキーをすべて出題しています。
          </p>
          <p>
            ツールの選択は「T
            キーを押す」もしくは「『ツールを選ぶ』ボタン」から行えます。
          </p>
          <img
            class="object-scale-down h-16"
            src={imageOfToolSelectButton}
            alt="ツールを選ぶボタンの画像"
          />
          <p class="text-sm">
            ※
            正解判定できないショートカットキーは「自己採点」という形で出題しています。
          </p>
          <h2 class="text-lg font-bold">
            身についていないショートカットキーの出題頻度が自動的に高まる
          </h2>
          <p>
            回答するたびに正解判定の結果がブラウザに保存され、その正答率をもとに「身についたかどうか」がショートカットキー単位で判定されます。全体としてどれくらい身についているか、円グラフと表で確認できます。
          </p>
          <img
            class="object-scale-down h-60"
            src={imageOfPieChartAndTable}
            alt="練習の正答率を示す円グラフと表の画像"
          />
          <p>右の表は、円グラフをマウスでホバーすると表示されます。</p>
          <p>
            「身についたかどうか」は、出題頻度の調整にも使われます。身についていないショートカットキーは出題頻度が自動的に高まります。
          </p>
          <p>
            この仕組みにより、手間をかけることなく、苦手なショートカットキーを重点的に練習できるようになります。
          </p>
          <p class="text-sm">
            ※
            出題頻度の調整は、未回答のショートカットキーがなくなった後に開始されます。それまで、未回答のショートカットキーが最優先で出題されます。
            <br />※ 正解判定の結果はブラウザの localStorage に保存されます。
          </p>
          <h2 class="text-lg font-bold">
            身につけたいショートカットキーに絞って練習できる
          </h2>
          <p>
            公式ドキュメントのショートカットキーの中には「すでに覚えている」「興味がない」といったものも含まれているかもしれません。
          </p>
          <p>
            そのようなショートカットキーに対し、R
            キーを押して「次から出題しない」と設定できます。
          </p>
          <img
            class="object-scale-down h-60"
            src={imageOfRemovingShortcutKey}
            alt="次から出題しない設定を示す画像"
          />
          <p>
            これにより、身につけたいショートカットキーに絞って練習できるようになります。
          </p>
        </div>
      </div>
    </div>
  )
}
