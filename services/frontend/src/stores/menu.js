import { defineStore } from 'pinia'

export const useMenuStore = defineStore ({
    id: 'menu',
    state: () => ({
        activeMenu: null,
        isMinimized: false
    })
})