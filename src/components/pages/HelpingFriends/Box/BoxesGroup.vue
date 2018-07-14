<template>
  <div>
    <Object3D
      @attach="(v) => { $emit('add', v); boxes = v; }"
      @detach="(v) => { $emit('remove', v); boxes = false; }"
    >

      <LayoutSet
        v-if="camera"
        :camera="camera"
        :zPos="0"
      >
        <PlaceMe
          :key="box.id"
          v-for="box in boxesData"
          :name="box.id"
          :formulas="box.formulas"
        >
          <Object3D>
            <Box
              :scl="scl"
            />
          </Object3D>
        </PlaceMe>

      </LayoutSet>

    </Object3D>
  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'

import PlaceMe from './../LayoutEngine/PlaceMe.vue'
import LayoutSet from './../LayoutEngine/LayoutSet.vue'

import Box from './Box'
export default {
  props: {
    boxesData: {},
    scl: {},
    camera: {}
  },
  components: {
    Box,
    PlaceMe,
    LayoutSet,
    ...Bundle
  },
  data () {
    return {
      winWidth: window.innerWidth,
      boxes: false,
      THREE
    }
  },
  created () {
    this.$on('add', (v) => {
      this.$parent.$emit('add', v)
    })
    this.$on('remove', (v) => {
      this.$parent.$emit('remove', v)
    })
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style>

</style>
