<template>
<div class="editor">
  <div class="two-sides">
    <button @click="close()">Close</button>
    <button @click="removeText({ info }); $emit('pulse-remove', info); $emit('pulse-backup', info); ">
      Remove Text
    </button>
  </div>
  <textarea ref="ta" autofocus="true" @input="$emit('pulse-update', info)" class="ta" :placeholder="'Please enter some text here....'" v-model="info.data.text" id="" cols="30" rows="10"></textarea>
  <br />
  Word Box Width<input type="range" @input="$emit('pulse-update', info)" v-model="info.data.width" :min="100" :max="1000" :step="1">
  <br />
  Font size<input type="text" @input="$emit('pulse-update', info)" v-model="info.data.fontSize" :min="10" :max="500" :step="1">
  <br />
  Font family<input type="text" @input="$emit('pulse-update', info)" v-model="info.data.fontFamily" :min="10" :max="500" :step="1">
  <br />
  <label for="">
    Transparent Background
    <input type="checkbox" v-model="info.data.transparent">
  </label>

  <div class="vsfs">
    <ACE
      v-if="info.effect"
      @save="() => {}"
      :path="info.id + 'vs' + '.glsl'"
      v-model="info.effect.vs"
      @input="() => { isDirty = true; }"
      theme="chrome"
      width="50%"
      :height="'500'"
    >
    </ACE>
    <ACE
      v-if="info.effect"
      @save="() => {}"
      :path="info.id + 'fs' + '.glsl'"
      v-model="info.effect.fs"
      @input="() => { isDirty = true; }"
      theme="chrome"
      width="50%"
      :height="'500'"
    >
    </ACE>
  </div>


</div>
</template>

<script>
import ACE from '@/components/shared/ACE/ACE.vue'

export default {
  components: {
    ACE
  },
  props: {
    root: {},
    current: {},
    info: {}
  },
  data () {
    return {
      isDirty: false
    }
  },
  methods: {
    removeText ({ info }) {
      this.root.state.words.forEach((word, key) => {
        if (word.id === info.id) {
          this.root.state.words.splice(key, 1)
          this.current.data = false
          this.current.mesh = false

          this.root.state.restore = this.root.state.restore || []
          this.root.state.restore.push(word)
        }
      })
      this.$emit('pulse-remove', this.info)
    },
    close () {
      this.current.data = false
      this.current.mesh = false
    }
  }
}
</script>

<style scoped>
.ta {
  font-size: 17px;
  width: calc(100% - 12px);
}

.two-sides{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vsfs{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

.editor{
  transform: translateZ(0.1px);
  opacity: 0.9;
}
</style>
