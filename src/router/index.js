import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/pages/Hello/Hello'
import HelloLayout from '@/components/pages/Hello/HelloLayout'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
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
