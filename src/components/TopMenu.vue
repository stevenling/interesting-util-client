<template>
  <!-- class="Top-Menu-class" -->
  <div>
    <el-row :span="4">
      <el-col>
        <el-menu
          :default-active="1"
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          :ellipsis="false"
        >
          <el-menu-item class="el-menu-item-class" index="1" @click="clickHomeMenuItem"
            >云胡</el-menu-item
          >
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { computed, watch } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { ref, onMounted } from "vue";
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
.el-menu-item-class {
  font-size: 20px;
  font-weight: bold;
}
</style>
