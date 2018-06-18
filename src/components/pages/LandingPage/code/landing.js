export const makePage = () => {
  let elements = {}
  let layout = {}
  let array = {
    get elements () {
      return Object.keys(elements).reduce((accu, key) => {
        accu.push(elements[key])
        return accu
      }, [])
    },
    get layouts () {
      return Object.keys(layout).reduce((accu, key) => {
        accu.push(layout[key])
        return accu
      }, [])
    }
  }
  let state = {
    elements,
    layout,
    array
  }
  let api = {
    state
  }

  api.register = (ele) => {
    let id = ele.data.name
    elements[id] = ele
    layout[id] = {
      position: ele.position,
      size: ele.size
    }
  }
  api.remove = (ele) => {
    let id = ele.data.name
    delete elements[id]
    delete layout[id]
  }

  return api
}

export const makeMobile414 = () => {
  return [
    {
      id: Math.random() + '',
      name: 'welcome',
      src: require('../img/mobile414/welcome-to-vela.svg'),
      formulas: {
        width: 'fsw * 0.85',
        height: 'fsw * 0.85 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'viewer',
      src: require('../img/mobile414/viewer.svg'),
      formulas: {
        width: 'fsw * 0.85',
        height: 'fsw * 0.85 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'animation',
      src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      component: 'GlowingWindow',
      base: {
        width: 10,
        height: 10,
        aspect: 1,
        scale: {
          x: 1.0,
          y: 1.0,
          z: 1.0
        },
        position: {
          x: 0,
          y: 0,
          z: -0.01
        }
      },
      formulas: {
        width: 'fsw * 0.85',
        height: 'fsw * 0.85 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'velaBox',
      src: require('../img/mobile414/vela-box.svg'),
      formulas: {
        width: 'fsw * 0.85',
        height: 'fsw * 0.85 / ia',

        x: 'fsw * 0.5 - szw * 0.5',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5 - viewer.size.height',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'youCanLearn',
      src: require('../img/mobile414/you-can-learn.svg'),
      formulas: {
        width: 'fsw * 0.85',
        height: 'fsw * 0.85 / ia',

        x: '-fsw * 0.5 + szw * 0.5',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5 - viewer.size.height - velaBox.size.height - 1.0',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'sellingPoint',
      src: require('../img/mobile414/usp.svg'),
      formulas: {
        width: 'fsw * 0.85',
        height: 'fsw * 0.85 / ia',

        x: 'fsw * 0.5 - szw * 0.5',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5 - viewer.size.height - velaBox.size.height - 1.0 - youCanLearn.size.height - 1.0',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'enter',
      src: require('../img/mobile414/enter.svg'),
      formulas: {
        width: 'fsw * 0.5',
        height: 'fsw * 0.5 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5 - viewer.size.height - velaBox.size.height - 1.0 - youCanLearn.size.height - 1.0 - sellingPoint.size.height - 1.5',
        z: '0'
      }
    }
  ]
}

export const makeTablet768 = () => {
  return [
    {
      id: Math.random() + '',
      name: 'welcomeBox',
      src: require('../img/tablet768/welcomeBox.svg'),
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 292 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 292 / 768 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'velaBox',
      src: require('../img/tablet768/velaBox.svg'),
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 289 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 289 / 768 / ia',

        x: '((fsw > 20.53) ? 20.53 : fsw) * (-225.5 + 10) / 768',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35 - welcomeBox.size.height - 1.25',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'frame',
      src: require('../img/tablet768/frame.svg'),
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 428 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 428 / 768 / ia',

        x: '((fsw > 20.53) ? 20.53 : fsw) * (133 + 10) / 768',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35 - welcomeBox.size.height - 1.25',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'animation',
      src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      component: 'GlowingWindow',
      base: {
        width: 10,
        height: 10,
        aspect: 1,
        scale: {
          x: 1.0,
          y: 1.0,
          z: 1.0
        },
        position: {
          x: 0,
          y: 0,
          z: -0.01
        }
      },
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 428 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 428 / 768 / ia',

        x: '((fsw > 20.53) ? 20.53 : fsw) * (133 + 10) / 768',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35 - welcomeBox.size.height - 1.25',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'youCanLearn',
      src: require('../img/tablet768/youCanLearn.svg'),
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 325 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 325 / 768 / ia',

        x: '-((fsw > 20.53) ? 20.53 : fsw) * 0.5 + szw * 0.5',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35 - welcomeBox.size.height - 1.25 - frame.size.height - 1.25',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'sellingPoint',
      src: require('../img/tablet768/sellingPoint.svg'),
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 325 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 325 / 768 / ia',

        x: '((fsw > 20.53) ? 20.53 : fsw) * 0.5 - szw * 0.5',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35 - welcomeBox.size.height - 1.25 - frame.size.height - 1.25 - youCanLearn.size.height',
        z: '0'
      }
    },
    {
      id: Math.random() + '',
      name: 'enter',
      src: require('../img/tablet768/enter.svg'),
      formulas: {
        width: '((fsw > 20.53) ? 20.53 : fsw) * 257 / 768',
        height: '((fsw > 20.53) ? 20.53 : fsw) * 257 / 768 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5 - 0.35 - welcomeBox.size.height - 1.25 - frame.size.height - 1.25 - youCanLearn.size.height - sellingPoint.size.height - 1.25',
        z: '0'
      }
    }
  ]
}
