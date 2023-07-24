<template>
  <div class = "title">云胡工具集合</div>
  <el-row>
    <el-col :span="6"></el-col>
    <el-col :span="12">
      <div class="grid-content ep-bg-purple-dark" />
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>程序员工具</span>
          </div>
        </template>
        <div>
          <el-button>
            <router-link to="/JsonFormat">Json 代码美化</router-link>
          </el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>


</template>

<script>


export default {
  name: 'index',
  components: {
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  /*position:relative;*/

}

.title {
  text-align: center;
  margin: 2rem;
  font-size: 1.5rem;
  font-family: "Monotype Corsiva";
  font-weight: bold;
}

.box-card {
  /*display: flex;*/
  /*justify-content: center;*/
  /*align-items: center;*/
  /*height: 100vh;*/

}
</style>
