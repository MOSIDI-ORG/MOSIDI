<template>
  <div class="home">
    <MainMap />
  </div>
</template>

<script>
// @ is an alias to /src
import MainMap from '@/components/MainMap.vue'

export default {
  name: 'HomeView',
  components: {
    MainMap
  }
}
</script>
