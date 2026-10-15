import { createGenerator } from 'unocss'

import config from '../uno.config'

test('generate the existing layout and accessibility utilities', async () => {
  const utilities = [
    'space-x-2',
    'space-x-3',
    'space-x-8',
    'space-y-2',
    'space-y-4',
    'sr-only',
    'object-scale-down',
    'border-separate',
    'list-none',
  ]
  const generator = await createGenerator(config)
  const { matched } = await generator.generate(utilities.join(' '))

  expect([...matched]).toEqual(expect.arrayContaining(utilities))
})
