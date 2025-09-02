<template>
    <div v-if="progress" class="centered">
      <v-row
        align-content="center"
        justify="center"
      >
        <v-col
          class="text-subtitle-1 text-center"
          cols="12"
        >
        {{ text }}
        </v-col>
        <v-col cols="4">
          <v-progress-linear
            color="deep-purple-accent-4"
            :value="progress"
            height="6"
            indeterminate
            rounded
          ></v-progress-linear>
        </v-col>
      </v-row>
    </div>
  </template>
  
  <script setup>
import { storeToRefs } from 'pinia'
import { useProgressStore } from '../stores/progress'
let { progress, text } = storeToRefs(useProgressStore())
  </script>
  
  <style scoped>
  .centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Center the div both horizontally and vertically */
  width: 500px; 
  height: 100px; 
  z-index: 999; 
  pointer-events: none; 
}
  </style>