export default function ShortcutsShow() {
  return (
    <ul class="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-2 py-3 text-sm">
      <li class="flex whitespace-nowrap justify-center gap-2">
        <kbd class="ui-keycap-chip">Enter</kbd>
        <span>スキップ</span>
      </li>
      <li class="flex whitespace-nowrap justify-center gap-2">
        <kbd class="ui-keycap-chip">R</kbd>
        <span>次から出題しない</span>
      </li>
      <li class="flex whitespace-nowrap justify-center gap-2">
        <kbd class="ui-keycap-chip">F</kbd>
        <span>全画面モードを ON / OFF</span>
      </li>
    </ul>
  )
}
