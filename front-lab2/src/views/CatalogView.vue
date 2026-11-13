<script setup lang="ts">
import type { Product } from '@/types'
import { useFetch } from '@vueuse/core'
import ProductCard from '../components/ProductCard.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const apiUrl = computed(() => {
  const params = new URLSearchParams()

  if (route.query.q) params.set('title_like', route.query.q as string)
  if (route.query.category) params.set('category', route.query.category as string)
  if (route.query.price_gte) params.set('price_gte', route.query.price_gte as string)
  if (route.query.price_lte) params.set('price_lte', route.query.price_lte as string)
  if (route.query.sort) params.set('_sort', route.query.sort as string)
  if (route.query.order) params.set('_order', route.query.order as string)

  const query = params.toString()
  return `/api/products${query ? '?' + query : ''}`
})

const { isFetching, error, data } = useFetch<Product[]>(apiUrl).json()
</script>

<template>
  <template v-if="isFetching">
    <ProductCard v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" :product="null" />
  </template>
  <template v-else-if="error">
    {{ error }}
  </template>
  <template v-else-if="!data || data.length === 0">
    <div class="text-center py-12 text-gray-500">
      Товары не найдены
    </div>
  </template>
  <template v-else>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 ">
      <ProductCard v-for="product in data" :key="product.id" :product="product" />
    </div>
  </template>
</template>
