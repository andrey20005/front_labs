<script setup lang="ts">
import type { Product, Reviews } from '@/types'
import { useCartStore } from '@/stores/useCartStore'
import { useFetch } from '@vueuse/core'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const props = defineProps<{ id: string }>()

const cart = useCartStore()
const router = useRouter()
const message = useMessage()

const productUrl = computed(() => `/api/products/${props.id}`)
const reviewsUrl = computed(() => `/api/reviews?productId=${props.id}`)

const {
  data: product,
  isFetching,
  error,
} = useFetch(productUrl, { refetch: true }).json<Product>()

const {
  data: reviewsData,
  isFetching: isFetchingReviews,
  error: reviewsError,
} = useFetch(reviewsUrl, { refetch: true }).json<Reviews[]>()

const categoryLabels: Record<string, string> = {
  kettle: 'Чайники',
  toaster: 'Тостеры',
  microwave: 'Микроволновки',
}

const specLabels: Record<string, string> = {
  volume: 'Объём',
  power: 'Мощность',
  material: 'Материал',
  filter: 'Фильтр',
  smart: 'Умное управление',
  grill: 'Гриль',
  control: 'Управление',
  slices: 'Количество отделений',
  modes: 'Режимы',
}

const inCart = computed(() => (product.value ? cart.hasItem(product.value.id) : false))
const specText = computed(() =>
  Object.entries(product.value?.specs ?? {})
    .map(([key, value]) => `${specLabel(key)}:    ${value}`)
    .join('\n')
)
const reviews = computed(() => reviewsData.value ?? [])

function specLabel(key: string) {
  return specLabels[key] ?? key
}

function imageUrl(image: string) {
  return image.startsWith('http') ? image : `/api${image}`
}

function addToCart() {
  if (!product.value) return

  cart.add(product.value.id)
  message.success(`Успешно добавлен ${product.value.title}`)
}

function removeFromCart() {
  if (!product.value) return

  cart.remove(product.value.id)
  message.info(`Убран ${product.value.title}`)
}
</script>

<template>
  <template v-if="isFetching && !product">
    <div class="grid grid-cols-2 items-start gap-10">
      <n-skeleton height="520px" />
      <div class="flex flex-col gap-4">
        <n-skeleton text width="30%" />
        <n-skeleton text width="80%" height="40px" />
        <n-skeleton text width="25%" />
        <n-skeleton text width="35%" height="36px" />
        <n-skeleton text :repeat="3" />
      </div>
    </div>
  </template>
  <n-alert v-else-if="error" type="error" title="Не удалось загрузить товар">
    {{ error }}
  </n-alert>
  <n-empty v-else-if="!product" class="py-12" description="Товар не найден" />
  <template v-else>
    <div class="grid grid-cols-2 items-start gap-10">
      <n-card :content-style="{ padding: 0 }" class="overflow-hidden">
        <div class="aspect-square w-full bg-[var(--clr-almond-light)]">
          <img
            :src="imageUrl(product.image)"
            :alt="product.title"
            class="h-full w-full object-contain p-8"
          />
        </div>
      </n-card>

      <div class="flex flex-col gap-5">
        <n-text depth="3">
          {{ product.brand }} · {{ categoryLabels[product.category] ?? product.category }}
        </n-text>

        <h1 class="text-3xl font-semibold">{{ product.title }}</h1>

        <div class="flex items-center gap-2">
          <n-rate readonly allow-half :default-value="product.rating" color="#FBCD01FF" />
          <n-text depth="3">{{ product.rating }}</n-text>
        </div>

        <div class="text-3xl font-semibold">
          {{ product.price.toLocaleString('ru-RU') }} ₽
        </div>

        <n-text>{{ product.description }}</n-text>

        <div>
          <n-tag :type="product.inStock ? 'success' : 'error'" size="small">
            {{ product.inStock ? 'В наличии' : 'Нет в наличии' }}
          </n-tag>
        </div>

        <n-button v-if="!inCart" size="large" strong @click="addToCart">
          Добавить в корзину
        </n-button>
        <div v-else class="flex gap-3">
          <n-button size="large" strong class="flex-1" @click="router.push('/cart')">
            К корзине
          </n-button>
          <n-button size="large" strong class="flex-1" @click="removeFromCart">
            Убрать
          </n-button>
        </div>
      </div>
    </div>

    <section v-if="specText" class="mt-10">
      <h2 class="mb-4 text-2xl font-semibold">Характеристики</h2>

      <n-ellipsis
        :line-clamp="2"
        expand-trigger="click"
        style="white-space: pre-wrap; line-height: 1.9"
      >{{ specText }}</n-ellipsis>
    </section>

    <section class="mt-10">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-semibold">Отзывы</h2>
        <n-text depth="3">{{ reviews.length }}</n-text>
      </div>

      <n-skeleton v-if="isFetchingReviews" text :repeat="3" />

      <n-alert v-else-if="reviewsError" type="error" title="Не удалось загрузить отзывы">
        {{ reviewsError }}
      </n-alert>

      <n-empty v-else-if="!reviews.length" description="Отзывов пока нет" />

      <n-list v-else bordered>
        <n-list-item v-for="review in reviews" :key="review.id">
          <div class="mb-2 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <n-text strong>{{ review.author }}</n-text>
              <n-text depth="3">{{ review.date }}</n-text>
            </div>
            <n-rate readonly :default-value="review.rating" size="small" color="#FBCD01FF" />
          </div>

          <n-text v-if="review.text">{{ review.text }}</n-text>
          <n-text v-else depth="3">Без текста</n-text>
        </n-list-item>
      </n-list>
    </section>
  </template>
</template>
