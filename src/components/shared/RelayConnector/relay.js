export const internal = {
  $forceUpdate () {},
  ready: false,
  saved: false,
  state: require('./Hot_Relay_Current/state.json')
}
let root = internal
export const provideArray = () => {
  root.state.data = root.state.data || []
  return root.state.data
}

export const getByPath = (path) => {
  var arr = provideArray()
  return arr.find(a => a.path === path)
}
var vava = false
if (vava && process.env.NODE_ENV === 'development') {
  console.log('dev mode')
  let SOC = require('./socket.js')
  let hydrate = () => {
    SOC.$emit('hydrate/state')
    SOC.$emit('hydrate/ready')
    SOC.$emit('hydrate/state-saved')
  }
  SOC.$on('connection', hydrate)

  window.addEventListener('focus', () => {
    hydrate()
  }, false)

  SOC.$on('res/state', (state) => {
    if (root.ready) {
      root.state = state
      root.$forceUpdate()
    }
  })

  SOC.$on('root-ready', (ready) => {
    root.ready = ready
  })
  SOC.$on('state-saved', (saved) => {
    root.saved = saved
  })

  SOC.$on('delta-add', (instruction) => {
    console.log('delta-add', instruction)
    var arr = provideArray()
    arr.push(instruction.data)
    root.$forceUpdate()
  })

  SOC.$on('delta-remove', (instruction) => {
    var arr = provideArray()
    let idx = arr.findIndex(ari => ari._id === instruction.data._id)
    if (idx !== -1) {
      arr.splice(idx, 1)
    }
    root.$forceUpdate()
  })

  SOC.$on('delta-update', (instruction) => {
    var arr = provideArray()
    let idx = arr.findIndex(ari => ari._id === instruction.data._id)
    if (idx !== -1) {
      arr.splice(idx, 1, instruction.data)
    }
    root.$forceUpdate()
  })

  SOC.p2p.on('drawboard-draw', (instruction) => {
    let arr = provideArray()
    let itemObj = arr.find(a => a._id === instruction.objID)
    if (!itemObj) {
      return
    }
    let nowLine = itemObj.lines.find(l => l.lineID === instruction.lineID)
    if (nowLine) {
      let x = instruction.x
      let y = instruction.y
      nowLine.points.push({
        x, y
      })
      root.$forceUpdate()
    }
  })
}
