import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/pages/Hello/Hello'
import HelloLayout from '@/components/pages/Hello/HelloLayout'

import WinRenderer from '@/components/pages/WindowsSystem/WinRenderer'
import WinLayout from '@/components/pages/WindowsSystem/WinLayout'
import InfinityBox from '@/components/pages/InfinityBox/InfinityBox'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: WinRenderer,
      children: [
        {
          path: '',
          component: WinLayout
        },
        {
          path: '/box',
          component: InfinityBox
        }
      ]
    },
    {
      path: '/hello',
      name: 'Hello',
      component: HelloLayout,
      children: [
        {
          path: '',
          component: Hello
        }
      ]
    }
  ]
})
