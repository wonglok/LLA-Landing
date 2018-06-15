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

export const makeLayouts = () => {
  return [
    {
      id: Math.random() + '',
      name: 'welcome',
      src: require('../img/welcome-to-vela.svg'),
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
      src: require('../img/viewer.svg'),
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
      src: require('../img/vela-box.svg'),
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
      src: require('../img/you-can-learn.svg'),
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
      name: 'usp',
      src: require('../img/usp.svg'),
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
      src: require('../img/enter.svg'),
      formulas: {
        width: 'fsw * 0.5',
        height: 'fsw * 0.5 / ia',

        x: '0',
        y: 'fsh * 0.5 - szh * 0.5 - welcome.size.height - 0.5 - viewer.size.height - velaBox.size.height - 1.0 - youCanLearn.size.height - 1.0 - usp.size.height - 1.5',
        z: '0'
      }
    }
  ]
}
