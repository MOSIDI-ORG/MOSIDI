import { defineStore } from 'pinia'

export const useAlertStore = defineStore ({
    id: 'alert',
    state: () => ({
        snackbar: false,
        text: "alert text",
        timeout: 2000
    }),
    actions: {
       setAlert(data) {
        this.snackbar=true
        this.text = data.text
        this.timeout = data.timeout
       }
       
    }
})