import { defineStore } from 'pinia'

export const useMetadataDialogStore = defineStore ({
    id: 'metadataDialog',
    state: () => ({
       metadata: null,
       dialog: false,
       tablename: null
    }),
    actions: {
        assignMetadata(metadata, tablename) {
            this.metadata = metadata
            this.dialog = true,
            this.tablename = tablename
        },
       
    }
})