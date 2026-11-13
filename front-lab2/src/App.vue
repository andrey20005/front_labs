<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')

watch(
  () => route.query.q,
  (newQ) => {
    searchQuery.value = (newQ as string) || ''
  },
  { immediate: true }
)

function handleSearch() {
  if (!searchQuery.value.trim()) return

  if (route.path === '/catalog') {
    const newQuery = { ...route.query, q: searchQuery.value.trim() }
    router.push({ query: newQuery })
  } else {
    router.push({ path: '/catalog', query: { q: searchQuery.value.trim() } })
  }
}
</script>

<template>
  <n-message-provider>
    <header class="sticky top-0 z-50 bg-white rounded-b-lg shadow-sm max-w-[1000px] mx-auto">
      <div class="px-6 py-3 flex flex-wrap justify-center items-center gap-4">

        <div class="flex-1 min-w-[200px]">
          <n-input v-model:value="searchQuery" @keyup.enter="handleSearch" placeholder="Поиск товаров..." />
        </div>

        <nav class="flex gap-2">
          <n-button @click="router.push('/')" strong>Главная</n-button>
          <n-button @click="router.push('/catalog')" strong>Каталог</n-button>
          <n-button @click="router.push('/cart')" strong>Корзина</n-button>
        </nav>

      </div>
    </header>

    <div class="mx-auto px-4 py-8 max-w-[1640px]">
      <RouterView />
    </div>
  </n-message-provider>
</template>
