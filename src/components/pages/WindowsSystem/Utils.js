import { EventDispatcher } from 'three/src/core/EventDispatcher.js'

export const fullScreener = ({ planeZ, camera }) => {
  var cameraZ = camera.position.z
  var distance = cameraZ - planeZ
  var aspect = window.innerWidth / window.innerHeight
  var vFov = camera.fov * Math.PI / 180
  var planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance
  var planeWidthAtDistance = planeHeightAtDistance * aspect
  /*
  let dist = camera.position.z - mesh.position.z
  let height = ... // desired height to fit
  camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI)
  camera.updateProjectionMatrix()
  */
  return {
    aspect: planeWidthAtDistance / planeHeightAtDistance,
    vmin: Math.min(planeWidthAtDistance, planeHeightAtDistance),
    vmax: Math.max(planeWidthAtDistance, planeHeightAtDistance),
    width: planeWidthAtDistance,
    height: planeHeightAtDistance
  }
}

export function DomToucher ({ toucher }) {
  this.toucher = toucher
  var ui = this.state = {
    disabled: false,
    deltaX: -0.0,
    deltaY: -0.0,
    addon: 0.0016667,
    mass: 5.0,
    inertia: 1.0,
    inc: 0,
    aX: 0,
    aY: 0,
    inX: 0,
    inY: 0,
    isMD: false,

    _: {
      tsTheta: 0,
      tsX: 0,
      tsY: 0
    },
    throttleID: 0
  }
  var update = { type: 'update', state: this.state }
  var end = { type: 'end', state: this.state }
  var click = { type: 'click', state: this.state }
  var throttledSim = { type: 'throttledSim', state: this.state }
  var loop = { type: 'loop', state: this.state }
  this.onWHL = (evt) => {
    if (ui.disabled) { return }
    evt.preventDefault()

    ui.deltaX = -event.deltaX * 0.02
    ui.deltaY = -event.deltaY * 0.02

    // if (event.deltaX) {
    //   ui.deltaTheta = -event.deltaX * 0.02 / (Math.PI * 2)
    // }
    // if (event.deltaY) {
    //   ui.deltaTheta = -event.deltaY * 0.02 / (Math.PI * 2)
    // }

    // initia speed
    ui.inertia = ui.mass
  }

  this.onMD = (evt) => {
    ui.isMD = true
    onPanStart(evt)
  }
  this.onMU = (evt) => {
    ui.isMD = false
    onPanEnd(evt)
  }

  var onPointerMove = (ppp) => {
    ui.pX = ppp.clientX
    ui.pY = ppp.clientY
    ui.cX = (ui.pX / ui.conW) * 2 - 1
    ui.cY = (ui.pY / ui.conH) * 2 - 1

    if (ui.conW >= ui.conH) {
      let a = ui.conW / ui.conH
      ui.cX = ui.cX * a
      ui.cY = ui.cY
    } else {
      let a = ui.conH / ui.conW
      ui.cX = ui.cX
      ui.cY = ui.cY * a
    }
  }
  // pan around
  var onPanStart = (t1) => {
  // var t1 = touch[0]
  // var x = t1.pageX
  // var y = t1.pageY
    var x = t1.clientX
    var y = t1.clientY

    // ui.cX = (x / window.innerWidth) * 2 - 1
    // ui.cY = (y / window.innerHeight) * 2 - 1

    // var w = ui.conW
    // var h = ui.conH
    // var cX = (x - (w / 2)) / w
    // var cY = (y - (h / 2)) / h
    // var theta = Math.atan2(cY, cX)

    // pan
    ui._.tsX = x
    ui._.tsY = y

    // ui.inertia *= 0.05
    ui.isIn = true
  }

  var onPanMove = (t1) => {
    // var t1 = touch[0]
    // var x = t1.pageX
    // var y = t1.pageY
    var x = t1.clientX
    var y = t1.clientY

    // ui.cX = (x / window.innerWidth) * 2 - 1
    // ui.cY = (y / window.innerHeight) * 2 - 1

    //
    ui.deltaX = (x - ui._.tsX) * 0.05
    ui.deltaY = (y - ui._.tsY) * 0.05

    ui._.tsX = x
    ui._.tsY = y

    ui.aX += ui.deltaX
    ui.aY += ui.deltaY

    ui.inertia = ui.mass
  }

  var onPanEnd = (t1) => {
    ui.isIn = false
  }

  this.onMM = (evt) => {
    if (ui.disabled) { return }
    onPointerMove(evt)
  }
  this.onTS = (evt) => {
    if (ui.disabled) { return }
    // console.log(evt)
    // evt.target.style.outline = 'red solid 3px'
    // if (evt.target === toucher) {
    //   evt.preventDefault()
    // }
    var t = evt.touches
    if (t.length >= 1) {
      onPanStart(t[0])
      // onThetaStart(t[0])
    }
    ui.touches = t.length
  }
  this.onTM = (evt) => {
    if (ui.disabled) { return }
    evt.preventDefault()
    var t = evt.touches

    if (t.length >= 1) {
      onPanMove(t[0])
      // onThetaMove(t[0])
      onPointerMove(t[0])
    }
  }
  this.onTE = (evt) => {
    if (ui.disabled) { return }
    // evt.preventDefault()
    var t = evt.touches

    if (t.length === 1) {
      onPanEnd(t[0])
      this.dispatchEvent(click)
    }
    ui.touches = t.length
  }
  this.onResize = () => {
    ui.conW = toucher.clientWidth
    ui.conH = toucher.clientHeight
  }
  var sim = () => {
    if (ui.disabled) { return }
    ui.inc += ui.addon
    if (ui.inertia > 0.01) {
      //
      ui.inX = (ui.deltaX * ui.inertia)
      ui.inY = (ui.deltaY * ui.inertia)
      ui.aX += ui.inX
      ui.aY += ui.inY

      //
      // ui.inTheta = ((ui.deltaTheta * ui.inertia) * 0.45)
      // ui.aTheta += ui.inTheta

      // inertia
      ui.inertia *= 0.98

      ui.canFireEnd = true
      this.dispatchEvent(update)
    }
    if (ui.inertia < 0.9 && ui.canFireEnd) {
      ui.canFireEnd = false
      this.dispatchEvent(end)
    }

    this.dispatchEvent(loop)
    ui.throttleID++
    if (ui.throttleID % 16 === 0) {
      this.dispatchEvent(throttledSim)
    }
  }
  this.setup = () => {
    var rAFID = 0
    var rAF = () => {
      rAFID = window.requestAnimationFrame(rAF)
      sim()
    }
    rAFID = window.requestAnimationFrame(rAF)

    this.onResize()

    toucher.addEventListener('mousedown', this.onMD, false)
    toucher.addEventListener('mousemove', this.onMM, false)
    toucher.addEventListener('mouseup', this.onMU, false)

    toucher.addEventListener('touchstart', this.onTS, false)
    toucher.addEventListener('touchmove', this.onTM, false)
    toucher.addEventListener('touchend', this.onTE, false)

    window.addEventListener('wheel', this.onWHL, false)
    window.addEventListener('resize', this.onResize, false)

    return {
      clean: () => {
        toucher.removeEventListener('mousemove', this.onMM)
        toucher.removeEventListener('mousedown', this.onMD)
        toucher.removeEventListener('mouseup', this.onMU)

        toucher.removeEventListener('touchstart', this.onTS)
        toucher.removeEventListener('touchmove', this.onTM)
        toucher.removeEventListener('touchend', this.onTE)

        window.removeEventListener('wheel', this.onWHL)

        window.removeEventListener('resize', this.onResize)
        window.cancelAnimationFrame(rAFID)
      }
    }
  }

  var { clean } = this.setup()
  this.clean = clean
}

// Mixing the EventDispatcher.prototype with the custom object prototype
Object.assign(DomToucher.prototype, EventDispatcher.prototype)
