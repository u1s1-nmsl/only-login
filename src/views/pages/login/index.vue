<template>
  <div>
    <canvas id="canvas"></canvas>
    <LoginInput></LoginInput>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
//import { sakura } from '@/common/animate/sakura'
import { starry } from '@/common/animate/starry'

onMounted(()=> {
  let canvas = document.getElementById('canvas');
  //Math.random() < 0.5 ? starry(canvas) : sakura(canvas)
  starry(canvas)
})
</script>
<script>
import LoginInput from "@/views/components/LoginInput";

export default {
  name: 'LoginPage',
  components: {
    LoginInput
  }
}
</script>
<style scoped>
</style>
