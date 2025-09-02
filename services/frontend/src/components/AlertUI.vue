<template>
    <div class="text-center ma-2">
     
      <v-snackbar
        v-model="snackbar"
        :timeout="timeout"
      >
        {{ text }}
  
        <template v-slot:actions>
          <v-btn
            color="pink"
            variant="text"
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </template>
<script setup>
import { storeToRefs } from 'pinia'
import { useAlertStore } from '../stores/alert'
let { snackbar, text, timeout } = storeToRefs(useAlertStore())


</script>