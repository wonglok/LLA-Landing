import Vue from 'vue'
import Router from 'vue-router'

import HelpingFriends from '@/components/pages/HelpingFriends/HelpingFriends'

import Hello from '@/components/pages/Hello/Hello'
import HelloLayout from '@/components/pages/Hello/HelloLayout'

import WinRenderer from '@/components/pages/WindowsSystem/WinRenderer'
import WinLayout from '@/components/pages/WindowsSystem/WinLayout'
import InfinityBox from '@/components/pages/InfinityBox/InfinityBox'

import LandingPage from '@/components/pages/LandingPage/LandingPage.vue'

import LeapMotion from '@/components/pages/LeapMotion/LeapMotion.vue'

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
          component: HelpingFriends
        },
        {
          path: 'vela',
          component: LandingPage
        },
        {
          path: 'win',
          component: WinLayout
        },
        {
          path: 'box',
          component: InfinityBox
        },
        {
          path: '/leap',
          component: LeapMotion
        }
      ]
    },
    {
      path: '/hello',
      name: 'Hello',
      component: HelloLayout,
      children: [
        {
          path: '/lla',
          component: Hello
        }
      ]
    }
  ]
})
