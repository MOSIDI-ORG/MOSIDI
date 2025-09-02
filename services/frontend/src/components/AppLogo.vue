<template>
    <v-card class="logo-ui">
        <v-img class="logo-img" src="innowest-logo.png" width="80px"> 
        </v-img>
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
    margin:10px
}

</style>