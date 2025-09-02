<template>
    <v-row justify="center">
        <v-dialog
            v-model="dialog"
            max-width="500"
            max-height="500"
        >
        
            <v-card class="dialog-ui">
                <v-card-title>
                    <span class="text-h6">{{ tablename }} meta data</span>
                </v-card-title>
                <v-divider></v-divider>

                <div v-if="metadata">
                    <div v-for="(item,index) in metadata" :key="index">
                        <v-card-text v-if="item">
                            <span  v-if="isValidURL(item)">
                                {{index}}: <a :href="metadata.source" target="_blank">{{ item }}</a> 
                            </span>
                            <span v-else>
                                <b>{{index}}</b>: {{ item }}
                            </span>
                        
                        </v-card-text>
                    
                    </div>
                </div>
                <template v-else>
                    <v-card-text>
                        No metaData provided for {{ tablename }}
                    </v-card-text>
                </template>
            
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                    color="blue-darken-1"
                    variant="text"
                    @click="dialog = false"
                    >
                    Close
                    </v-btn>
                    
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
  </template>

<script setup>

import { storeToRefs } from 'pinia'
import { useMetadataDialogStore } from '../stores/metadataDialog'
import { isValidURL } from '../utils/isValidURL';


const { dialog, metadata, tablename } = storeToRefs(useMetadataDialogStore())

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