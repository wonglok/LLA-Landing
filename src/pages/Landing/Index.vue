<template>
  <div>
    <!-- Happy -->
    <vue-draggable-resizable :w="p.width" :h="p.height" :x="p.x" :y="p.y" :z="p.z" @dragging="onDrag" @resizing="onResize" :handles="[]">
      <div class="gradient-box"></div>
    </vue-draggable-resizable>
  </div>
</template>

<script>
export default {
  data () {
    return {
      p: {
        width: 300,
        height: 300,
        x: 0,
        y: 0,
        z: 0
      }
    }
  },
  methods: {
    onResize (x, y, width, height) {
      this.p.x = x
      this.p.y = y

      this.p.width = width
      this.p.height = height
    },
    onDrag (x, y) {
      this.p.x = x
      this.p.y = y
    }
  }
}
</script>

<style scoped>
.gradient-box{
  border-radius: 50%;
  background-image: linear-gradient(45deg, hotpink, cyan);
  background-attachment: fixed;
  background-size: cover;
  width: 100%;
  height: 100%;
}
</style>
