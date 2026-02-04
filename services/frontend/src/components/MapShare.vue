<template>
        <v-row justify="center">
        <v-dialog
            v-model="shareDialog"
            max-width="500"
            max-height="500"

        >
        
            <v-card class="dialog-ui">
                <v-card-title>
                    <span class="text-h6">{{ $t('share-map.title') }}</span>
                </v-card-title>
                <v-divider></v-divider>

                <div class="ml-2 mr-2">
                    <v-text-field
                        v-model="shareUrl"
                        label="Link zur Karte"
                        readonly
                        variant="outlined"
                        density="compact"
                        >
                        <template #append-inner>
                            <v-icon
                            :color="copied ? 'green' : 'blue'"
                            @click="copyToClipboard"
                            class="cursor-pointer"
                            >
                            {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
                            </v-icon>
                        </template>
                    </v-text-field>
                </div>
            
                <v-card-actions>
                    <v-spacer></v-spacer>
                    
                    <v-btn
                        color="blue-darken-1"
                        variant="outlined"
                        @click="shareDialog = false, copied=false"
                    >
                        {{ $t('share-map.close') }}
                    </v-btn>
                    
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
    
  </template>

<script setup>

import { computed, ref } from 'vue'
import { useMapShareStore } from '../stores/mapShare'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from "vue-router"
const router = useRouter()
const route = useRoute()



let { shareDialog } = storeToRefs(useMapShareStore())
let copied = ref(false)
const shareUrl = computed(() => {
   return `${window.location.origin}${router.options.history.base}${route.fullPath}`
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true

  } catch (err) {
    console.error('Copy failed', err)
  }
}
</script>

<style scoped>
.v-dialog > .v-overlay__content > .v-card {
    display: flex;
    flex-direction: column;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border-radius: 8px;
}
</style>