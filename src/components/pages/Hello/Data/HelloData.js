import { fullScreener } from '@/components/Shared/Utils.js'

export const makeRandomID = () => {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

/* root */
export const makeRoot = () => {
  return {
    version: 0.1,
    state: {
    },
    backups: []
  }
}

export const makeWords = () => {
  return [
  ]
}

/* words */
export const makeOneWord = () => {
  return {
    id: makeRandomID(),
    arr: 'words',
    data: {
      transparent: true,
      text: '',
      width: 300,
      fontSize: '24.0',
      fontFamily: '\'InterUI\', \'Avenir\', Helvetica, Arial, sans-serif'
    },
    effect: {
      fs: ``,
      vs: ``,
      uniforms: []
    },
    pos: { x: 0, y: 0, z: 0 }
  }
}

export const makeDemoRoot = ({ camera }) => {
  let root = makeRoot()

  root.state.words = makeWords()

  function importAll (r) {
    r.keys().forEach(key => {
      var item = r(key).default({ camera, fullScreener })
      root.state.words.push(item)
    })
  }
  importAll(require.context('./Words/', true, /\.js$/))

  return root
}
