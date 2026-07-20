import { defineStore } from 'pinia'

export const useMetadataDialogStore = defineStore ({
    id: 'metadataDialog',
    state: () => ({
       metadataa: null,
       dialog: false,
       tablename: null
    }),
    actions: {
        assignMetadata(metadata, tablename) {
            this.metadataa = metadata
            this.dialog = true,
            this.tablename = tablename
        },
       
    }
})