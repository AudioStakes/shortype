import Key from '@/components/Key'

type Props = {
  keys: string[]
}

export default function KeyList({ keys }: Props) {
  return (
    <div class="flex max-w-full flex-wrap justify-center items-center gap-y-2">
      {keys.map((keyName, index) => (
        <div key={`${keyName}-${index}`} class="flex shrink-0">
          {index > 0 ? <span class="mx-4 my-auto">+</span> : null}
          <Key keyName={keyName} />
        </div>
      ))}
    </div>
  )
}
