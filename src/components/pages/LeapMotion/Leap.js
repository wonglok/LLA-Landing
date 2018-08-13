import * as Leap from 'leapjs'

export const setup = ({ $forceUpdate, calibrate }) => {
  calibrate = calibrate || { x: 0, y: 120, z: 180 }
  let internals = {
    needsUpdate: false,
    $forceUpdate: $forceUpdate || (() => {}),
    hands: [],
    pointables: [],
    pick: {
      type: 'pick',
      ing: false,
      //
      _latestAccumulationX: 0,
      _latestAccumulationY: 0,
      _latestAccumulationZ: 0,

      //
      _momentumCurrentValueX: 0,
      _momentumCurrentValueY: 0,
      _momentumCurrentValueZ: 0,

      _inertia: 0.0,
      _inertiaX: 0.0,
      _inertiaY: 0.0,
      _inertiaZ: 0.0,

      _deltaProgressX: 0.0,
      _deltaProgressY: 0.0,
      _deltaProgressZ: 0.0,

      get in () {
        return internals.pick._inertia
      },
      set in (v) {
        internals.pick._inertia = v
      },
      get x () {
        return internals.pick._momentumCurrentValueX
      },
      get y () {
        return internals.pick._momentumCurrentValueY
      },
      get z () {
        return internals.pick._momentumCurrentValueZ
      },
      get dpx () {
        return internals.pick._deltaProgressX
      },
      get dpy () {
        return internals.pick._deltaProgressY
      },
      get dpz () {
        return internals.pick._deltaProgressZ
      }
    },
    circle: {
      type: 'cricle',

      _deltaProgress: 0.0,
      _inertia: 1.0,
      _latestAccumulation: 0,
      _momentumCurrentValue: 0,
      get value () {
        return internals.circle._momentumCurrentValue
      }
    }
  }

  var rAF = () => {
    requestAnimationFrame(rAF)
    // circle
    var circleDiff = internals.circle._latestAccumulation - internals.circle._momentumCurrentValue
    if (Math.abs((circleDiff)) > 0.0) {
      internals.circle._momentumCurrentValue += circleDiff * 0.065
      internals.needsUpdate = true
    }

    // pick X
    var pickDiffX = internals.pick._latestAccumulationX - internals.pick._momentumCurrentValueX
    if (Math.abs((pickDiffX)) > 0.0) {
      internals.pick._momentumCurrentValueX += pickDiffX * 0.065
      internals.needsUpdate = true
    }
    // pick Y
    var pickDiffY = internals.pick._latestAccumulationY - internals.pick._momentumCurrentValueY
    if (Math.abs((pickDiffY)) > 0.0) {
      internals.pick._momentumCurrentValueY += pickDiffY * 0.065
      internals.needsUpdate = true
    }
    // pick Z
    var pickDiffZ = internals.pick._latestAccumulationZ - internals.pick._momentumCurrentValueZ
    if (Math.abs((pickDiffZ)) > 0.0) {
      internals.pick._momentumCurrentValueZ += pickDiffZ * 0.065
      internals.needsUpdate = true
    }

    // inertia
    if (internals.circle.inertia > 0.001) {
      internals.circle._deltaProgress *= internals.circle.inertia
    }

    // inertia
    if (internals.pick._deltaProgressX > 0.001) {
      internals.pick._deltaProgressX *= internals.pick.inertiaX || 1.0
    }
    if (internals.pick._deltaProgressY > 0.001) {
      internals.pick._deltaProgressY *= internals.pick.inertiaY || 1.0
    }
    if (internals.pick._deltaProgressZ > 0.001) {
      internals.pick._deltaProgressZ *= internals.pick.inertiaZ || 1.0
    }

    // internals.circle._inertia *= 0.98
    // internals.pick._inertiaX *= 0.98
    // internals.pick._inertiaY *= 0.98
    // internals.pick._inertiaZ *= 0.98

    internals.circle._inertia = Number((internals.circle._inertia * 0.98).toFixed(3))

    internals.pick._inertiaX = Number((internals.pick._inertiaX * 0.98).toFixed(3))
    internals.pick._inertiaY = Number((internals.pick._inertiaY * 0.98).toFixed(3))
    internals.pick._inertiaZ = Number((internals.pick._inertiaZ * 0.98).toFixed(3))
  }
  rAF(window.performance.now())

  // update request animation frame
  let requestIdleCallback = window.requestAnimationFrame // window.requestIdleCallback ||
  var uAF = () => {
    requestIdleCallback(uAF)
    if (internals.needsUpdate) {
      internals.needsUpdate = false
      internals.$forceUpdate()
    }
  }
  uAF(window.performance.now())

  let api = {
    ___internals: internals,
    get pick () {
      return internals.pick
    },
    get circle () {
      return internals.circle
    },
    get handCount () {
      return internals.handCount
    },
    get hands () {
      return internals.hands
    },
    get pointables () {
      return internals.pointables
    },
    get pinchStrength () {
      let h = internals.hands[0]
      return h ? h.pinchStrength : 0
    },
    get hand0Pos () {
      let h = internals.hands[0]
      return h ? h.palm : [0, 0, 0]
    },
    clean () {
      controller.disconnect()
    }
  }
  // let vectorToString = (v) => {
  //   if (v instanceof Array) {
  //     return v.join(' / ')
  //   } else {
  //     return v
  //   }
  // }

  let controller = new Leap.Controller({
    host: '127.0.0.1',
    port: 6437,
    useAllPlugins: true,
    enableGestures: true
  })
  api.controller = controller

  var deactivate = (obj) => { obj.activate = false }
  // leap
  controller.on('frame', (frame) => {
    internals.handCount = frame.hands.length

    internals.hands.forEach(deactivate)

    if (frame.hands.length > 0) {
      for (let i = 0; i < frame.hands.length; i++) {
        let handString = ''
        let hand = frame.hands[i]

        // handString += 'Hand ID: ' + hand.id + '\n'
        // handString += 'Direction: ' + vectorToString(hand.direction, 2) + '\n'
        // handString += 'Palm normal: ' + vectorToString(hand.palmNormal, 2) + '\n'
        // handString += 'Palm position: ' + vectorToString(hand.palmPosition) + ' mm\n'
        // handString += 'Palm velocity: ' + vectorToString(hand.palmVelocity) + ' mm/s\n'
        // handString += 'Sphere center: ' + vectorToString(hand.sphereCenter) + ' mm\n'
        // handString += 'Sphere radius: ' + hand.sphereRadius.toFixed(1) + ' mm\n'
        // handString += 'Pinch Strength: ' + hand.pinchStrength + '\n'

        internals.hands[i] = internals.hands[i] || {}
        let iHand = internals.hands[i]
        iHand.roll = hand.roll()
        iHand.pitch = hand.pitch()
        iHand.yaw = hand.yaw()
        iHand.activate = true
        iHand.pinchStrength = hand.pinchStrength
        iHand.palm = hand.palmPosition
        iHand.palmPosCalibrated = [
          hand.palmPosition[0] - calibrate.x,
          hand.palmPosition[1] - calibrate.y,
          hand.palmPosition[2] - calibrate.z
        ]
        iHand.dir = hand.direction
        iHand.string = handString
        internals.needsUpdate = true
      }
    }
  })

  controller.on('frame', (frame) => {
    internals.pointables.forEach(deactivate)

    if (frame.pointables.length > 0.0) {
      for (let i = 0; i < frame.pointables.length; i++) {
        let pointable = frame.pointables[i]
        var interactionBox = frame.interactionBox
        var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true)

        let description = ''
        // description += 'Pointable ID: ' + pointable.id + '\n'
        // description += 'Belongs to hand with ID: ' + pointable.handId + '\n'
        // description += 'Length: ' + pointable.length.toFixed(1) + ' mm\n'
        // description += 'Width: ' + pointable.width.toFixed(1) + ' mm\n'
        // description += 'Direction: ' + vectorToString(pointable.direction, 2) + '\n'
        // description += 'Tip position: ' + vectorToString(pointable.tipPosition) + ' mm\n'
        // description += 'Tip velocity: ' + vectorToString(pointable.tipVelocity) + ' mm/s\n'
        // description += 'normalizedPosition: ' + vectorToString(normalizedPosition) + '\n'

        internals.pointables[i] = internals.pointables[i] || {}
        let iPointable = internals.pointables[i]

        iPointable.interactionBox = interactionBox
        iPointable.normalizedPosition = normalizedPosition
        iPointable.activate = true
        iPointable.string = description
        iPointable.tipPos = pointable.tipPosition
        iPointable.tipVel = pointable.tipVelocity
        iPointable.dir = pointable.direction
        internals.needsUpdate = true
      }
    }
  })

  controller.on('frame', (frame) => {
    // internals.needsUpdate = true
  })

  controller.on('ready', () => {
    console.log('ready')
  })
  controller.on('connect', () => {
    console.log('connect')
  })
  controller.on('disconnect', () => {
    console.log('disconnect')
  })
  controller.on('focus', () => {
    console.log('focus')
  })
  controller.on('blur', () => {
    console.log('blur')
  })
  controller.on('deviceConnected', () => {
    console.log('deviceConnected')
  })
  controller.on('deviceDisconnected', () => {
    console.log('deviceDisconnected')
  })

  controller.on('gesture', (gesture, frame) => {
    // console.log(gesture.type + ' with ID ' + gesture.id + ' in frame ' + frame.id)

    if (gesture.type === 'circle') {
      // console.log('progress', gesture.progress, 'radius', gesture.radius, 'state', gesture.state)
      var pointableID = gesture.pointableIds[0]
      var direction = frame.pointable(pointableID).direction
      var dotProduct = 0
      var isClockwise = false
      if (direction) {
        dotProduct = Leap.vec3.dot(direction, gesture.normal)
        isClockwise = dotProduct > 0
      }
      let circle = internals.circle

      circle.isClockwise = isClockwise
      circle.progress = gesture.progress
      circle.radius = gesture.radius
      circle.state = gesture.state

      // if (gesture.state === 'start' || gesture.state === 'update') {
      //   circle._inertia = 1.0
      // }
      //
      if (gesture.state === 'start') {
        circle._startProgress = circle.progress
      }

      //
      if (gesture.state === 'update') {
        circle._deltaProgress = (circle.progress) - circle._startProgress
        if (isClockwise) {
          circle._latestAccumulation += circle._deltaProgress
        } else {
          circle._latestAccumulation -= circle._deltaProgress
        }
        circle._startProgress = circle.progress
        circle._inertia = 1.0
      }

      // internals.circle._sp = internals.circle.progress
      // console.log('clockwise', isClockwise, 'progress', gesture.progress, 'radius', gesture.radius, 'state', gesture.state)
      // console.log(internals.circle)
      internals.needsUpdate = true
    }

    // console.log(gesture)
  })

  controller.on('frame', (frame) => {
    let hand = frame.hands[0]
    internals.pick.ing = false
    if (hand) {
      if (hand.pinchStrength > 0.85) {
        let pick = internals.pick
        pick.ing = true
        pick._deltaProgressX = hand.palmVelocity[0]
        pick._deltaProgressY = hand.palmVelocity[1]
        pick._deltaProgressZ = hand.palmVelocity[2]

        pick._latestAccumulationX += hand.palmVelocity[0]
        pick._latestAccumulationY += hand.palmVelocity[1]
        pick._latestAccumulationZ += hand.palmVelocity[2]

        pick._inertiaX = 1.0
        pick._inertiaY = 1.0
        pick._inertiaZ = 1.0
        pick._inertia = 1.0
        internals.needsUpdate = true
      }
    }
  })

  controller.connect()

  return api
}
