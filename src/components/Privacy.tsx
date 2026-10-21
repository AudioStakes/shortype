import Modal from '@/components/Modal'
import ModalKey from '@/stores/modal-key'
import { useStrictContext } from '@/utils/use-strict-context'

type Props = {
  isShow: boolean
}

export default function Privacy({ isShow }: Props) {
  const { hidePrivacyModal } = useStrictContext(ModalKey, 'ModalKey')

  return (
    <Modal
      isShow={isShow}
      onClose={hidePrivacyModal}
      label="プライバシー"
      closeLabel="プライバシーを閉じる"
    >
      <div class="flex flex-col space-y-4 text-left">
        <h1 class="text-2xl font-bold">プライバシー</h1>
        <h2 class="text-lg font-bold">ブラウザに保存する学習データ</h2>
        <p>
          正解判定の結果、「次から出題しない」設定、選択したツールとカテゴリーを、お使いのブラウザの
          localStorage
          に保存します。これらの学習データや入力したショートカットキーは、アクセス解析へ送信しません。
        </p>
        <p>
          ブラウザでこのサイトのデータを削除すると、保存した学習データも削除されます。
        </p>
        <h2 class="text-lg font-bold">アクセス解析</h2>
        <p>
          サービス改善のため、Cloudflare Web Analytics
          で閲覧ページ・参照元・端末・ブラウザ・国・表示速度などを集計します。
        </p>
        <p>
          アクセス解析には Cookie や
          localStorage、個人を識別するフィンガープリントを使いません。IP
          アドレスは国の判定のために一時的に処理されますが、解析データには保存されません。
        </p>
        <p>
          詳しくは{' '}
          <a
            class="text-blue-700 underline"
            href="https://www.cloudflare.com/web-analytics/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare Web Analytics
            <span class="sr-only">（別タブで開く）</span>
          </a>
          、{' '}
          <a
            class="text-blue-700 underline"
            href="https://developers.cloudflare.com/speed/observatory/rum-beacon/"
            target="_blank"
            rel="noopener noreferrer"
          >
            解析データの説明
            <span class="sr-only">（別タブで開く）</span>
          </a>
          、{' '}
          <a
            class="text-blue-700 underline"
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare のプライバシーポリシー
            <span class="sr-only">（別タブで開く）</span>
          </a>
          をご確認ください。
        </p>
      </div>
    </Modal>
  )
}
