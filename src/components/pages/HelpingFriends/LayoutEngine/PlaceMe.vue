<template>
  <div>
    <Object3D
      v-if="view && layout"
      @attach="attachLayout"
      @detach="detachLayout"
      :px="px" :py="py" :pz="pz"
      :rx="rx" :ry="ry" :rz="rz"
    >
      <slot ref="content"></slot>
    </Object3D>
  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
var Parser = require('expr-eval').Parser

export default {
  components: {
    ...Bundle
  },
  props: {
    name: {
      default () {
        return '_' + Math.random()
      }
    },
    formulas: {
      default () {
        return {
          px: '0',
          py: '0',
          pz: '0',

          width: '1',
          height: '1'
        }
      }
    }
  },
  data () {
    return {
      view: false,
      layout: false,

      THREE,
      PI: Math.PI,

      px: 0,
      py: 0,
      pz: 0,

      rx: 0,
      ry: 0,
      rz: 0,

      width: 10,
      height: 10,
      aspect: 1,

      pi: Math.PI
    }
  },
  watch: {
    view () {
      this.$emit('refresh-layout')
    },
    layout () {
      this.$emit('refresh-layout')
    },
    fpx () {
      this.$emit('refresh-layout')
    },
    fpy () {
      this.$emit('refresh-layout')
    },
    fpz () {
      this.$emit('refresh-layout')
    },
    fwidth () {
      this.$emit('refresh-layout')
    },
    fheight () {
      this.$emit('refresh-layout')
    }
  },
  computed: {
    fsw () {
      if (!this.view) {
        return 0
      }
      return this.view.width
    },
    fsh () {
      if (!this.view) {
        return 0
      }
      return this.view.height
    },
    top () {
      return this.fsh * 0.5
    },
    left () {
      return -this.fsw * 0.5
    },
    bottom () {
      return -this.fsh * 0.5
    },
    right () {
      return this.fsw * 0.5
    },
    fpx () {
      this.$parent.$emit('refresh-all-child-layout')
      return this.formulas.px
    },
    fpy () {
      this.$parent.$emit('refresh-all-child-layout')
      return this.formulas.py
    },
    fpz () {
      this.$parent.$emit('refresh-all-child-layout')
      return this.formulas.pz
    },
    fwidth () {
      this.$parent.$emit('refresh-all-child-layout')
      return this.formulas.width
    },
    fheight () {
      this.$parent.$emit('refresh-all-child-layout')
      return this.formulas.height
    },
    i () {
      return this.layout.state.layout
    }
  },
  created () {
    this.$on('add', (v) => {
      this.$parent.$emit('add', v)
    })

    this.$on('remove', (v) => {
      this.$parent.$emit('remove', v)
    })

    this.$on('refresh-layout', () => {
      this.updateValue()
    })

    this.$parent.$on('refresh-all-child-layout', () => {
      this.$emit('refresh-layout')
    })

    this.$parent.$on('update-deps', (v) => {
      this.view = v.view
      this.layout = v.layout
    })
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.$emit('refresh-layout')
    }, false)
    this.$emit('refresh-layout')
    this.$nextTick(() => {
      this.$emit('refresh-layout')
    })
  },
  methods: {
    attachLayout (v) {
      this.$parent.$emit('add', v)
      this.$parent.$emit('register-layout', this)
    },
    detachLayout (v) {
      this.$parent.$emit('remove', v)
      this.$parent.$emit('unregister-layout', this)
    },
    updateValue () {
      try {
        this.px = Parser.evaluate(this.formulas.px, this)
        this.py = Parser.evaluate(this.formulas.py, this)
        this.pz = Parser.evaluate(this.formulas.pz, this)

        this.width = Parser.evaluate(this.formulas.width, this)
        this.height = Parser.evaluate(this.formulas.height, this)
        this.aspect = this.width / this.height

        let content = this.$refs['content']
        if (content) {
          content.$emit('apply-layout', this)
        }
      } catch (e) {
        console.log('update value dep waiting')
        setTimeout(() => {
          this.updateValue()
        }, 16.667 * 30)
      }
    }
  }
}
</script>

<style>

</style>
