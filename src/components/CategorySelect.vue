<script setup lang="ts">
import { ref } from 'vue'

import Button from '@/components/Button.vue'
import CategoryCard from '@/components/CategoryCard.vue'
import IconGlyph from '@/components/IconGlyph.vue'
import GameKey from '@/stores/game-key'
import { injectStrict } from '@/utils/inject-strict'

const { categoriesWithMasteredRate } = injectStrict(GameKey)
const props = defineProps<{ tool: string; categories: string[] }>()
const emit = defineEmits(['select-tool-and-categories', 'reset-tool'])

const categoriesWithRate = categoriesWithMasteredRate(props.tool)
const selectableCategories = categoriesWithRate.map((category) => category.name)
const selectableCategorySet = new Set(selectableCategories)
const selectedCategories = ref(new Set(props.categories))

const hasAnySelectedCategory = () => {
  for (const categoryName of selectableCategorySet) {
    if (selectedCategories.value.has(categoryName)) return true
  }

  return false
}

const areAllCategoriesSelected = () => {
  for (const categoryName of selectableCategorySet) {
    if (!selectedCategories.value.has(categoryName)) return false
  }

  return true
}

const toggleCategory = (categoryName: string) => {
  selectedCategories.value.has(categoryName)
    ? selectedCategories.value.delete(categoryName)
    : selectedCategories.value.add(categoryName)
}

const selectAllCategories = () => {
  for (const categoryName of selectableCategories) {
    selectedCategories.value.add(categoryName)
  }
}

const deselectAllCategories = () => {
  for (const categoryName of selectableCategories) {
    selectedCategories.value.delete(categoryName)
  }
}
</script>

<template>
  <div class="w-full h-4/5 flex flex-col items-center gap-4 bg-white">
    <div
      class="flex space-x-2 items-center w-10/12 pb-1 p-1.5 rounded-full hover:bg-gray-100 hover:text-gray-900 transition duration-200 hover:ease-out"
      @click="emit('reset-tool')"
    >
      <div class="w-4 h-4">
        <IconGlyph name="arrow-left" />
      </div>
      <h2 class="my-auto text-sm">ツールを選ぶ</h2>
    </div>

    <div
      class="flex flex-col space-y-2 justify-between items-start w-10/12 pb-1 border-b"
    >
      <h2 class="my-auto text-base">{{ tool }}</h2>
      <h2 class="my-auto text-lg font-bold">カテゴリーを選んでください</h2>
    </div>

    <div class="flex justify-around w-10/12 pb-1">
      <Button
        :name="'すべて選ぶ'"
        :is-disabled="areAllCategoriesSelected()"
        @click="selectAllCategories()"
      >
        <template #icon>
          <div class="flex h-6 w-6 justify-center">
            <IconGlyph
              name="check-circle"
              class="text-green-400 inline-block"
            />
          </div>
        </template>
      </Button>
      <Button
        :name="'すべての選択を外す'"
        :is-disabled="!hasAnySelectedCategory()"
        @click="deselectAllCategories()"
      >
        <template #icon>
          <div class="self-center h-5 w-5 rounded-full border-2 border-gray-300" />
        </template>
      </Button>
    </div>

    <div
      class="w-full h-fit max-h-[40rem] flex flex-col items-center gap-6 overflow-y-scroll"
    >
      <CategoryCard
        v-for="({ name, masteredRate }, index) in categoriesWithRate"
        :key="index"
        :name="name"
        :mastered-rate="masteredRate"
        :is-selected="selectedCategories.has(name)"
        @click="toggleCategory(name)"
      />
    </div>

    <Button
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 my-4"
      :name="'選んだカテゴリーの練習をはじめる'"
      :is-disabled="!hasAnySelectedCategory()"
      @click="emit('select-tool-and-categories', [...selectedCategories])"
    />
  </div>
</template>
