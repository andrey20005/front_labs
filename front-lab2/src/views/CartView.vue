<script setup lang="ts">
import type { Product } from '@/types'
import { useCartStore } from '@/stores/useCartStore'
import { useFetch } from '@vueuse/core'
import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import ProductCard from '../components/ProductCard.vue'

const cart = useCartStore()
const message = useMessage()

const { data, isFetching, error } = useFetch('/api/products').json<Product[]>()

const products = computed(() => {
  const ids = new Set(cart.ids.map(String))
  return (data.value ?? []).filter(product => ids.has(String(product.id)))
})

const total = computed(() => products.value.reduce((sum, product) => sum + product.price, 0))

function placeOrder() {
  cart.clear()
  message.success('Заказ оформлен')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-semibold">Корзина</h1>

    <template v-if="!data && isFetching">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        <ProductCard v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" :product="null" />
      </div>
    </template>
    <n-alert v-else-if="error" type="error" title="Не удалось загрузить товары">
      {{ error }}
    </n-alert>
    <n-empty v-else-if="!products.length" class="py-12" description="Корзина пуста" />
    <template v-else>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <n-card>
        <div class="flex items-center justify-between gap-6">
          <div class="flex items-baseline gap-3">
            <n-text depth="3">Итого:</n-text>
            <span class="text-2xl font-semibold">{{ total.toLocaleString('ru-RU') }} ₽</span>
          </div>

          <n-button type="primary" size="large" strong @click="placeOrder">
            Заказать
          </n-button>
        </div>
      </n-card>
    </template>
  </div>
</template>