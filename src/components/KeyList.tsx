import Key from '@/components/Key'

type Props = {
  keys: string[]
}

export default function KeyList({ keys }: Props) {
  return (
    <div class="flex justify-center align-center">
      {keys.map((keyName, index) => (
        <div key={`${keyName}-${index}`} class="flex">
          {index > 0 ? <span class="mx-4 my-auto">+</span> : null}
          <Key keyName={keyName} />
        </div>
      ))}
    </div>
  )
}
