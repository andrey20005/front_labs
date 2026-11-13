<script setup lang="ts">
import type { Product } from '@/types'
import { useFetch } from '@vueuse/core'
import { computed } from 'vue'

const categories = [
  { category: 'kettle', title: 'Чайники' },
  { category: 'toaster', title: 'Тостеры' },
  { category: 'microwave', title: 'Микроволновки' },
]

const { data, isFetching, error } = useFetch('/api/products').json<Product[]>()

function randomProduct(category: string): Product | null {
  const products = data.value?.filter(product => product.category === category) ?? []
  if (!products.length) return null

  return products[Math.floor(Math.random() * products.length)] ?? null
}

const cards = computed(() =>
  categories.map(category => ({
    ...category,
    product: randomProduct(category.category),
  }))
)

function imageUrl(product: Product | null) {
  if (!product) return ''
  return product.image.startsWith('http') ? product.image : `/api${product.image}`
}
</script>

<template>
  <n-alert v-if="error" type="error" title="Не удалось загрузить товары">
    {{ error.message }}
  </n-alert>

  <div v-else class="grid grid-cols-3 gap-6">
    <router-link
      v-for="card in cards"
      :key="card.category"
      :to="{ path: '/catalog', query: { category: card.category } }"
      class="group block"
    >
      <n-card hoverable class="overflow-hidden" :content-style="{ padding: 0 }">
        <div class="relative aspect-[3/4] w-full bg-[var(--clr-almond-light)]">
          <n-skeleton v-if="isFetching" width="100%" height="100%" />
          <img
            v-else-if="card.product"
            :src="imageUrl(card.product)"
            :alt="card.title"
            class="absolute inset-0 h-full w-full object-contain p-10 pb-28 transition-transform duration-300 group-hover:scale-105"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
            Нет фото
          </div>

          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-6"
          >
            <h2 class="mb-1 text-3xl font-semibold text-white">{{ card.title }}</h2>
            <span class="text-white/80">Смотреть товары →</span>
          </div>
        </div>
      </n-card>
    </router-link>
  </div>
</template>
