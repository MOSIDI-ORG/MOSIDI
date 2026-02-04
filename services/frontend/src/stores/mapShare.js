import { defineStore } from 'pinia'

export const useMapShareStore = defineStore ({
    id: 'mapShare',
    state: () => ({
        shareDialog: false,
        shareLink: ''
    })
})