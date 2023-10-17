<template>
  <div class="dplayer-container">
    <!-- <div ref="dplayer" class="dplayer"></div> -->
    <!-- <el-button @click="click">点击</el-button> -->
    <video controls width="250">
      <source
        src = "http://192.168.1.5:8084/sys/file/downloads?path=2023/10/9/1-1.mp4"
        type="video/mp4"
      />
    </video>
  </div>
</template>

<script>
import DPlayer from "dplayer";
import {onMounted} from "vue";

export default {
  props: {
    url: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      player: null,
      onMounted
    };
  },

  onMounted() {
    this.initDplayer()
  },

  deactivated() {
    if (this.player) {
      this.player.destroy()
    }
  },
  methods: {
    // 初始化Dplayer
    initDplayer() {
        this.player = new DPlayer({
          container: this.$refs.dplayer, // 容器
          preload: 'auto',
          autoplay: true,
          hotkey: true,
          loop: true, // 循环播放
          lang: 'zh-cn', // 语言，可选'en', 'zh-cn', 'zh-tw',
          playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2, 3],
          mutex: false, // 互斥，阻止多个播放器同时播放
          video: {
            // 视频信息
            type: 'auto', // 视频类型 可选"auto", "hls", "flv", "dash"..
            // url: this.url // 视频链接
            url: 'http://192.168.1.5:8084/sys/file/downloads?path=2023/10/6/111.mp4'
          }
        })
        // 禁用右键点击菜单
        this.$refs.dplayer.addEventListener('contextmenu', e => {
          e.preventDefault()
          document.querySelector('.dplayer-menu').style.display = 'none'
          document.querySelector('.dplayer-mask').style.display = 'none'
          return false
        })
      },
      click(){
        // this.player.seek(10)
      }
    }
  
};
</script>

<style scoped>
.dplayer-container {
  width: 300px;
}
</style>
