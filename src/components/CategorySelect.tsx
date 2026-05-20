import { useMemo, useState } from 'preact/hooks'

import Button from '@/components/Button'
import CategoryCard from '@/components/CategoryCard'
import IconGlyph from '@/components/IconGlyph'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

type Props = {
  tool: string
  categories: string[]
  onSelectToolAndCategories: (categories: string[]) => void
  onResetTool: () => void
}

export default function CategorySelect({
  tool,
  categories,
  onSelectToolAndCategories,
  onResetTool,
}: Props) {
  const { categoriesWithMasteredRate } = injectStrict(GameKey, 'GameKey')
  const categoriesWithRate = useMemo(
    () => categoriesWithMasteredRate(tool),
    [tool, categoriesWithMasteredRate],
  )
  const selectableCategories = useMemo(
    () => categoriesWithRate.map((category) => category.name),
    [categoriesWithRate],
  )
  const [selectedCategories, setSelectedCategories] = useState(
    () => new Set(categories),
  )

  const hasAnySelectedCategory = () =>
    selectableCategories.some((categoryName) =>
      selectedCategories.has(categoryName),
    )

  const areAllCategoriesSelected = () =>
    selectableCategories.every((categoryName) =>
      selectedCategories.has(categoryName),
    )

  const toggleCategory = (categoryName: string) => {
    const next = new Set(selectedCategories)
    next.has(categoryName) ? next.delete(categoryName) : next.add(categoryName)
    setSelectedCategories(next)
  }

  const selectAllCategories = () => {
    const next = new Set(selectedCategories)
    for (const categoryName of selectableCategories) {
      next.add(categoryName)
    }
    setSelectedCategories(next)
  }

  const deselectAllCategories = () => {
    const next = new Set(selectedCategories)
    for (const categoryName of selectableCategories) {
      next.delete(categoryName)
    }
    setSelectedCategories(next)
  }

  return (
    <div class="w-full h-4/5 flex flex-col items-center gap-4 bg-white">
      <button
        type="button"
        class="flex space-x-2 items-center w-10/12 pb-1 p-1.5 rounded-full hover:bg-gray-100 hover:text-gray-900 transition duration-200 hover:ease-out"
        onClick={onResetTool}
      >
        <div class="w-4 h-4">
          <IconGlyph name="arrow-left" />
        </div>
        <h2 class="my-auto text-sm">ツールを選ぶ</h2>
      </button>

      <div class="flex flex-col space-y-2 justify-between items-start w-10/12 pb-1 border-b">
        <h2 class="my-auto text-base">{tool}</h2>
        <h2 class="my-auto text-lg font-bold">カテゴリーを選んでください</h2>
      </div>

      <div class="flex justify-around w-10/12 pb-1">
        <Button
          name="すべて選ぶ"
          isDisabled={areAllCategoriesSelected()}
          onClick={selectAllCategories}
          icon={
            <div class="flex h-6 w-6 justify-center">
              <IconGlyph
                name="check-circle"
                class="text-green-400 inline-block"
              />
            </div>
          }
        />
        <Button
          name="すべての選択を外す"
          isDisabled={!hasAnySelectedCategory()}
          onClick={deselectAllCategories}
          icon={
            <div class="self-center h-5 w-5 rounded-full border-2 border-gray-300" />
          }
        />
      </div>

      <div class="w-full h-fit max-h-[40rem] flex flex-col items-center gap-6 overflow-y-scroll">
        {categoriesWithRate.map(({ name, masteredRate }) => (
          <CategoryCard
            key={name}
            name={name}
            masteredRate={masteredRate}
            isSelected={selectedCategories.has(name)}
            onClick={() => toggleCategory(name)}
          />
        ))}
      </div>

      <Button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 my-4"
        name="選んだカテゴリーの練習をはじめる"
        isDisabled={!hasAnySelectedCategory()}
        onClick={() => onSelectToolAndCategories([...selectedCategories])}
      />
    </div>
  )
}
