<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types'
import { useCartStore } from '../stores/useCartStore'
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';

const props = defineProps<{
  product: Product | null
}>()

const cart = useCartStore()
const message = useMessage()

const imageUrl = computed(() => {
  if (!props.product) return ''
  return props.product.image.startsWith('http') ? props.product.image : `/api${props.product.image}`
})

function addToCart() {
  if (props.product) {
    cart.add(props.product.id)
    message.success("Успешно добавлен " + props.product.title)
  }
}

function removeToCart() {
  if (props.product) {
    cart.remove(props.product.id)
    message.info("Убран " + props.product.title)
  }
}

const router = useRouter()
</script>

<template>
  <n-card class="product-card" hoverable>

    <template #cover>
      <div style="aspect-ratio: 1/1; width: 100%;" @click="() => router.push(`/product/${product?.id}`)">
        <n-skeleton v-if="!product" width="100%" height="100%" />
        <img v-else :src="imageUrl" :alt="product.title" class="max-w-full max-h-full object-contain" />
      </div>
    </template>

    <template #header>
      <n-skeleton v-if="!product" text width="90%" height="25px" />
      <div v-else class="product-title line-clamp-2 min-h-[4rem]">
        {{ product.title }}
      </div>
    </template>

    <template #footer>
      <div class="flex flex-row justify-between">
        <n-skeleton v-if="!product" text width="25%" />
        <span class="text-lg" v-else>{{ product.price.toLocaleString('ru-RU') }} ₽</span>

        <n-skeleton v-if="!product" text width="30%" />
        <div v-else class="flex flex-row items-center">
          <n-rate readonly allow-half :default-value="product.rating" size="small" color="#FBCD01FF" />
          <span class="rating-count">{{ product.rating }}</span>
        </div>
      </div>
    </template>

    <template #action>
      <n-button v-if="!product" size="large" block strong disabled>
        Загрузка...
      </n-button>
      <n-button v-else-if="!cart.hasItem(product.id)" @click.stop="addToCart" size="large" block strong>
        Добавить в корзину
      </n-button>
      <div v-else class="flex gap-2">
        <n-button @click.stop="() => router.push('/cart')" size="large" strong class="flex-1">
          К корзине
        </n-button>
        <n-button @click.stop="removeToCart" size="large" strong class="flex-1">
          Убрать
        </n-button>
      </div>
    </template>
  </n-card>
</template>
