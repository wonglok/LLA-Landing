export const internal = {
  $forceUpdate () {},
  state: require('./store/hydrate.current.json')
}

if (process.env.NODE_ENV === 'development') {
  console.log('dev mode')
  var SOC = require('./socket.js')
  SOC.$on('chat-message', (data) => {
    internal.state = data
    internal.$forceUpdate()
  })
}
