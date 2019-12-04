import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import router from './router'
import "./assets/css/global.css"
import TreeTable from 'vue-table-with-tree-grid'
/* 导入小图标 */
import "./assets/fonts/iconfont.css"
//基于 Quill、适用于 Vue 的富文本编辑器，支持服务端渲染和单页应用。
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)
import elCascaderMulti from "el-cascader-multi";
Vue.use(elCascaderMulti);

//载入进度条
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config)
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
//结束的进度条
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
Vue.filter('formatDate', function (getDate) {
  const date = new Date(getDate)
  let y = date.getFullYear()
  y = y < 10 ? '0' + y : y
  let m = date.getMonth() + 1
  m = m < 10 ? '0' + m : m
  let d = date.getDay()
  d = d < 10 ? '0' + d : d
  let hh = date.getHours()
  hh = hh < 10 ? '0' + hh : hh
  let mm = date.getMinutes()
  mm = mm < 10 ? '0' + mm : mm
  let ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')