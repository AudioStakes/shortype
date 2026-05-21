export default function ShortcutsShow() {
  return (
    <ul class="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm py-3 px-2">
      <div class="flex justify-center items-center gap-2 whitespace-nowrap">
        <kbd class="bg-white rounded border-[1px] border-gray-300 shadow-3d px-2 py-1">
          Enter
        </kbd>
        <span>スキップ</span>
      </div>
      <div class="flex justify-center items-center gap-2 whitespace-nowrap">
        <div>
          <kbd class="bg-white rounded border-[1px] border-gray-300 shadow-3d px-2 py-1">
            R
          </kbd>
        </div>
        <span>次から出題しない</span>
      </div>
      <div class="flex justify-center items-center gap-2 whitespace-nowrap">
        <div>
          <kbd class="bg-white rounded border-[1px] border-gray-300 shadow-3d px-2 py-1">
            F
          </kbd>
        </div>
        <span>全画面モードを ON / OFF</span>
      </div>
    </ul>
  )
}
