import Key from '@/components/Key'

export default function SelfScoring() {
  return (
    <div class="flex space-x-8 justify-center items-center">
      <div class="w-32 flex flex-col space-y-2 justify-center items-center">
        <span class="text-xl">正解した</span>
        <Key keyName="y" class="w-14 h-14" />
      </div>
      <div class="w-32 flex flex-col space-y-2 justify-center items-center">
        <span class="text-xl">不正解だった</span>
        <Key keyName="n" class="w-14 h-14" />
      </div>
    </div>
  )
}
