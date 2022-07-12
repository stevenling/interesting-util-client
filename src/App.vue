<template>
	<h1>云胡工具集合</h1>
  <JsonFormat />
  
</template>

<script>

import JsonFormat from './components/JsonFormat'

export default {
  name: 'App',
  components: {
    JsonFormat
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
