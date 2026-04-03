<template>
  <div
    class="border-b border-slate-300/90 dark:border-slate-800 bg-slate-200 dark:bg-slate-950"
  >
    <el-row :span="4">
      <el-col>
        <el-menu
          :default-active="1"
          class="el-menu-demo top-menu-el"
          mode="horizontal"
          :ellipsis="false"
        >
          <el-menu-item index="1" @click="clickHomeMenuItem">
            云胡
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "TopMenu",
  setup() {
    const router = useRouter();

    /**
     * 点击主页
     */
    const clickHomeMenuItem = () => {
      router.push({
        path: "/",
      });
    };

    return {
      clickHomeMenuItem,
      router,
    };
  },
};
</script>

<style scoped>
.top-menu-el :deep(.el-menu) {
  background-color: transparent;
  border-bottom: none;
}

.top-menu-el :deep(.el-menu-item) {
  font-size: 20px;
  font-weight: 700;
  color: rgb(51 65 85);
}

.top-menu-el :deep(.el-menu-item:hover) {
  background-color: rgb(203 213 225 / 0.45);
  color: rgb(29 78 216);
}

@media (prefers-color-scheme: dark) {
  .top-menu-el :deep(.el-menu-item) {
    color: rgb(241 245 249);
  }

  .top-menu-el :deep(.el-menu-item:hover) {
    background-color: rgb(30 41 59 / 0.7);
    color: rgb(147 197 253);
  }
}
</style>
