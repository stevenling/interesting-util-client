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
/* 全局样式重置 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

#app {
  /*//font-family: Avenir, Helvetica, Arial, sans-serif;*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*//text-align: center;*/
  /*color: #2c3e50;*/
  /*//margin-top: 60px;*/
  position: relative;
  height: 100vh;
  overflow: hidden;
}
</style>
