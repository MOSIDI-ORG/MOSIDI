<template>
  <div id="app">
    <router-view/>
    <DeviceDetect />
  </div>
</template>
<script setup>
import  DeviceDetect from './components/DeviceDetect'

</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

</style>
