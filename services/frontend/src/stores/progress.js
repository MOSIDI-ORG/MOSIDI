import { defineStore } from 'pinia'

export const useProgressStore = defineStore ({
    id: 'progress',
    state: () => ({
        progress: false,
        text: "progress text",
    }),
    actions: {
       setProgressBar(data) {
        this.progress=data.progress
        this.text = data.text
       }
       
    }
})