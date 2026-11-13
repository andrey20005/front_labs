<script setup lang="ts">
import type { CatalogFilters, CatalogSort, Product } from '@/types'
import { useDebounceFn, useFetch } from '@vueuse/core'
import ProductCard from '../components/ProductCard.vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { computed, onBeforeUnmount } from 'vue'

const route = useRoute()
const router = useRouter()

const categoryOptions = [
  { label: 'Чайники', value: 'kettle' },
  { label: 'Микроволновки', value: 'microwave' },
  { label: 'Тостеры', value: 'toaster' },
]

const brandOptions = ['Bosch', 'LG', 'Panasonic', 'Philips', 'Polaris', 'Samsung', 'Tefal', 'Xiaomi'].map(
  brand => ({ label: brand, value: brand })
)

const ratingOptions = [
  { label: 'Любой', value: 0 },
  { label: 'От 4.0', value: 4 },
  { label: 'От 4.5', value: 4.5 },
  { label: 'От 4.8', value: 4.8 },
]

const sortOptions: { label: string; value: CatalogSort }[] = [
  { label: 'По умолчанию', value: 'default' },
  { label: 'Сначала дешёвые', value: 'price-asc' },
  { label: 'Сначала дорогие', value: 'price-desc' },
  { label: 'По рейтингу', value: 'rating-desc' },
]

const apiSort: Record<CatalogSort, string | null> = {
  default: null,
  'price-asc': 'price',
  'price-desc': '-price',
  'rating-desc': '-rating',
}

function firstString(value: unknown): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value
  return typeof candidate === 'string' && candidate ? candidate : undefined
}

function stringList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value]
  return values.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function cascaderValues(value: unknown): string[] {
  if (value === null || value === undefined) return []

  const values = Array.isArray(value) ? value : [value]
  return values.map(String)
}

function numberValue(value: unknown): number | null {
  const valueString = firstString(value)
  if (valueString === undefined) return null

  const parsed = Number(valueString)
  return Number.isFinite(parsed) ? parsed : null
}

function parseSort(sort: string | undefined, order: string | undefined): CatalogSort {
  if (sort === 'price') return order === 'desc' ? 'price-desc' : 'price-asc'
  if (sort === 'rating' && order === 'desc') return 'rating-desc'
  return 'default'
}

const filters = computed<CatalogFilters>(() => ({
  categories: stringList(route.query.category),
  brands: stringList(route.query.brand),
  priceGte: numberValue(route.query.price_gte),
  priceLte: numberValue(route.query.price_lte),
  ratingGte: numberValue(route.query.rating_gte),
  inStock: firstString(route.query.inStock) === 'true',
  sort: parseSort(firstString(route.query.sort), firstString(route.query.order)),
}))

const hasActiveFilters = computed(() => {
  const current = filters.value
  return (
    current.categories.length > 0 ||
    current.brands.length > 0 ||
    current.priceGte !== null ||
    current.priceLte !== null ||
    current.ratingGte !== null ||
    current.inStock ||
    current.sort !== 'default'
  )
})

function buildQuery(current: CatalogFilters): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  const q = firstString(route.query.q)

  if (q) query.q = q
  if (current.categories.length) query.category = current.categories
  if (current.brands.length) query.brand = current.brands
  if (current.priceGte !== null) query.price_gte = String(current.priceGte)
  if (current.priceLte !== null) query.price_lte = String(current.priceLte)
  if (current.ratingGte !== null) query.rating_gte = String(current.ratingGte)
  if (current.inStock) query.inStock = 'true'

  if (current.sort === 'price-asc') {
    query.sort = 'price'
    query.order = 'asc'
  } else if (current.sort === 'price-desc') {
    query.sort = 'price'
    query.order = 'desc'
  } else if (current.sort === 'rating-desc') {
    query.sort = 'rating'
    query.order = 'desc'
  }

  return query
}

function applyFilters(patch: Partial<CatalogFilters>) {
  const next = { ...filters.value, ...patch }
  router.replace({ query: buildQuery(next) })
}

let pendingPrice: Partial<CatalogFilters> = {}

const applyPriceFilters = useDebounceFn(() => {
  const patch = pendingPrice
  pendingPrice = {}
  applyFilters(patch)
}, 300)

onBeforeUnmount(() => applyPriceFilters.cancel())

function updateFilters(patch: Partial<CatalogFilters>) {
  if ('priceGte' in patch || 'priceLte' in patch) {
    pendingPrice = { ...pendingPrice, ...patch }
    applyPriceFilters()
    return
  }

  applyFilters(patch)
}

function resetFilters() {
  applyPriceFilters.cancel()
  pendingPrice = {}

  const q = firstString(route.query.q)
  router.replace({ query: q ? { q } : {} })
}

const apiUrl = computed(() => {
  const current = filters.value
  const params = new URLSearchParams()
  const q = firstString(route.query.q)

  if (q) params.set('title:contains', q)
  if (current.categories.length) params.set('category:in', current.categories.join(','))
  if (current.brands.length) params.set('brand:in', current.brands.join(','))
  if (current.priceGte !== null) params.set('price_gte', String(current.priceGte))
  if (current.priceLte !== null) params.set('price_lte', String(current.priceLte))
  if (current.ratingGte !== null) params.set('rating_gte', String(current.ratingGte))
  if (current.inStock) params.set('inStock', 'true')

  const sort = apiSort[current.sort]
  if (sort) params.set('_sort', sort)

  const query = params.toString()
  return `/api/products${query ? '?' + query : ''}`
})

const { isFetching, error, data } = useFetch(apiUrl, { refetch: true }).json<Product[]>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <n-card size="small" title="Фильтры">
      <template #header-extra>
        <n-button text :disabled="!hasActiveFilters" @click="resetFilters">
          Сбросить фильтры
        </n-button>
      </template>

      <div class="flex flex-wrap items-end gap-4">
        <div class="w-56">
          <n-text depth="3" class="mb-1 block">Категории</n-text>
          <n-cascader
            :value="filters.categories"
            :options="categoryOptions"
            multiple
            clearable
            filterable
            :max-tag-count="2"
            placeholder="Все категории"
            @update:value="value => updateFilters({ categories: cascaderValues(value) })"
          />
        </div>

        <div class="w-56">
          <n-text depth="3" class="mb-1 block">Бренды</n-text>
          <n-cascader
            :value="filters.brands"
            :options="brandOptions"
            multiple
            clearable
            filterable
            :max-tag-count="2"
            placeholder="Все бренды"
            @update:value="value => updateFilters({ brands: cascaderValues(value) })"
          />
        </div>

        <div class="w-56">
          <n-text depth="3" class="mb-1 block">Цена</n-text>
          <div class="flex items-center gap-2">
            <n-input-number
              class="flex-1"
              :value="filters.priceGte"
              :min="0"
              :show-button="false"
              clearable
              placeholder="от"
              @update:value="priceGte => updateFilters({ priceGte })"
            />
            <span class="text-gray-400">—</span>
            <n-input-number
              class="flex-1"
              :value="filters.priceLte"
              :min="0"
              :show-button="false"
              clearable
              placeholder="до"
              @update:value="priceLte => updateFilters({ priceLte })"
            />
          </div>
        </div>

        <div class="w-40">
          <n-text depth="3" class="mb-1 block">Рейтинг</n-text>
          <n-select
            :value="filters.ratingGte ?? 0"
            :options="ratingOptions"
            @update:value="value => updateFilters({ ratingGte: value ? Number(value) : null })"
          />
        </div>

        <div class="w-52">
          <n-text depth="3" class="mb-1 block">Сортировка</n-text>
          <n-select
            :value="filters.sort"
            :options="sortOptions"
            @update:value="value => updateFilters({ sort: value as CatalogSort })"
          />
        </div>

        <div>
          <n-text depth="3" class="mb-1 block">Наличие</n-text>
          <div class="flex h-[34px] items-center">
            <n-checkbox
              :checked="filters.inStock"
              @update:checked="inStock => updateFilters({ inStock })"
            >
              Только в наличии
            </n-checkbox>
          </div>
        </div>
      </div>
    </n-card>

    <div>
      <n-text v-if="data && !error" depth="3" class="mb-4 block">
        Найдено товаров: {{ data.length }}
      </n-text>

      <template v-if="!data && isFetching">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          <ProductCard v-for="i in [0, 1, 2, 3, 4, 5]" :key="i" :product="null" />
        </div>
      </template>
      <n-alert v-else-if="error" type="error" title="Не удалось загрузить товары">
        {{ error.message }}
      </n-alert>
      <n-empty
        v-else-if="!data || data.length === 0"
        class="py-12"
        description="Товары не найдены"
      />
      <div
        v-else
        class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 transition-opacity"
        :class="{ 'pointer-events-none opacity-60': isFetching }"
      >
        <ProductCard v-for="product in data" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>
