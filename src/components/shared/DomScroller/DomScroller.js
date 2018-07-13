export const make = ({ scroller, content }) => {
  var _internal = {
    amount: 0,
    inertia: 3,
    lastValue: 0
  }

  var api = {
  }
  api.state = {
    progress: 0,
    get scrollAmount () {
      return _internal.amount
    },
    set scrollAmount (v) {
      _internal.lastValue = v
      _internal.inertia = 1.0
    }
  }

  var scrollerRect, contentRect
  var scrollResize = () => {
    scrollerRect = scroller.getBoundingClientRect()
    contentRect = content.getBoundingClientRect()
  }
  scrollResize()
  window.addEventListener('resize', scrollResize, false)

  api.onScroll = (evt) => {
    api.state.scrollAmount = evt.target.scrollTop
  }

  var updateScroller = () => {
    if (!contentRect) { return }
    if (!scrollerRect) { return }

    var contentLength = contentRect.height
    var scrollerHeight = scrollerRect.height

    var totalScroll = contentLength - scrollerHeight
    totalScroll = totalScroll || 0.00000001

    var progress = api.state.scrollAmount / totalScroll

    api.state.progress = progress
  }

  let __ = {
    rAFID: 0
  }
  let rAF = function () {
    __.rAFID = window.requestAnimationFrame(rAF)
    updateScroller()
    let diff = _internal.lastValue - _internal.amount
    if (Math.abs((diff)) > 0) {
      _internal.amount += diff * 0.035 * _internal.inertia
    }
    _internal.inertia *= 0.99
  }

  __.rAFID = window.requestAnimationFrame(rAF)

  return api
}
