<template>
    <v-card class="logo-ui">
        <small>Powered by</small><br />
        <a href="https://www.mosidi.org" target="_blank"><v-img class="logo-img" src="icons/mosidi-logo.svg" width="80px"></v-img></a>
    </v-card>
</template>
<script setup>


</script>

<style scoped>

.logo-ui {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index:10;
    background: white;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
}
.logo-img{
    margin:0 10px 10px 10px;
}

</style>