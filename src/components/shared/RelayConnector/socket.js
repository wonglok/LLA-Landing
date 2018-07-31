import io from 'socket.io-client'
import P2P from 'socket.io-p2p'

export const socket = io('http://' + window.location.hostname + ':2328')
export const $emit = socket.emit.bind(socket)
export const $on = socket.on.bind(socket)

export const p2p = new P2P(socket, { numClients: 10 })

$on('connect', () => {
  console.log('connected')
})
$on('disconnect', () => {
  console.log('disconnected')
})
