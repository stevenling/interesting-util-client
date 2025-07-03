<template>
  <router-view/>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  height: 100vh;
  overflow: hidden;
}
</style>
