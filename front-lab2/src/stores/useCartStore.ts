import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'cart-ids'

function loadIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const cart_ids = ref<number[]>(loadIds())

  // Автосохранение при любом изменении массива
  watch(cart_ids, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  const count = computed(() => cart_ids.value.length)

  function add(id: number) {
    if (!cart_ids.value.includes(id)) {
      cart_ids.value.push(id)
    }
  }

  function remove(id: number) {
    cart_ids.value = cart_ids.value.filter(i => i !== id)
  }

  function clear() {
    cart_ids.value = []
  }

  function hasItem(id: number): boolean {
    return cart_ids.value.includes(id)
  }

  return { ids: cart_ids, count, add, remove, clear, hasItem }
})