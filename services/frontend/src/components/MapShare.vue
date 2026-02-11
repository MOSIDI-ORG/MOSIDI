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

                <v-card-text class="pb-0">
                    <!-- Access Level Toggle -->
                    <div class="mb-4">
                        <label class="text-subtitle-2 mb-2 d-block">
                            {{ $t('share-map.access-level') }}
                        </label>
                        <v-chip-group
                            v-model="accessMode"
                            selected-class="text-primary"
                            mandatory
                            color="primary"
                        >
                            <v-chip
                                value="view"
                                variant="outlined"
                                filter
                            >
                                <v-icon start size="small">mdi-eye-outline</v-icon>
                                {{ $t('share-map.view-only') }}
                            </v-chip>
                            <v-chip
                                value="edit"
                                variant="outlined"
                                filter
                            >
                                <v-icon start size="small">mdi-pencil-outline</v-icon>
                                {{ $t('share-map.can-edit') }}
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <!-- Share URL Field -->
                    <v-text-field
                        v-model="shareUrl"
                        :label="$t('share-map.label')"
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

                   <!-- Helper Text -->
                    <div class="text-caption text-medium-emphasis mt-1">
                        <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
                        {{ accessMode === 'view' 
                            ? $t('share-map.view-only-hint') 
                            : $t('share-map.can-edit-hint') 
                        }}
                    </div>
                </v-card-text>
            
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="blue-darken-1"
                        variant="outlined"
                        @click="closeDialog"
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
let accessMode = ref('edit') // 'view' or 'edit'

const shareUrl = computed(() => {
    const baseUrl = `${window.location.origin}${router.options.history.base}${route.path}`
    
    const params = new URLSearchParams(route.query)
    
    params.set('mode', accessMode.value)
    
    // Build the final URL
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
})

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(shareUrl.value)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Copy failed', err)
    }
}

const closeDialog = () => {
    shareDialog.value = false
    copied.value = false
    // Optional: reset to view mode when closing
    // accessMode.value = 'view'
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

.cursor-pointer {
    cursor: pointer;
}
</style>