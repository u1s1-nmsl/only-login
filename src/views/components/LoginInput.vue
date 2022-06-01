<template>
  <div class="login-dev">
    <input class="login-input" @keydown='onKeydown' @input='onInput' @keyup='onKeyup' @select='onSelect'/>
    <div class="mask-wrapper"></div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";

let dialog = null
let value = ''
let start = 0
let end = 0
let that = null
// 用户名和密码校验规则
const reg = /[^0-9a-zA-Z\s._!@#%$]/g
const nameLen = 10 // 用户名长度
const psdLen = 18 // 密码长度
const psdNum = 3 // 密码个数
// 密码替换
const rep = /\S/g
const encryption = (value) => {
  if(value.length === 0){ // 啥都没有
    return value
  }
  let index = findNext(-1, value, word => word !== ' ')
  if(index === -1){ // 没有用户名
    return value
  }
  index = findNext(index, value, word => word === ' ')
  if(index === -1){ // 有用户名 没有密码
    return value
  }
  index = findNext(index, value, word => word !== ' ')
  if(index === -1){ // 有用户名 没有密码
    return value
  }
  rep.lastIndex = 0
  return value.slice(0, index) + value.slice(index, -1).replace(rep, '*') + value[value.length - 1]
}
const findNext = (index, value, action) => {
  for(let i = ++index; i < value.length; i++){
    if(action(value[i])){ return i }
  }
  return -1
}
const opera = (os, oe, ns, ne, ov, nv) => {
  // 有任意值为空 则都以现值的为准
  if(!nv || !ov)
    return nv
  // 不选中且只操作退格键
  if(os === oe && os > ne){
    // 原值选中的左右值
    let nl = nv.slice(0, ne)
    let nr = nv.slice(ne, nv.length)
    let ol = ov.slice(0, nl.length)
    let or = ov.slice(ov.length - nr.length, ov.length)
    return ol + or
  }

  // 原值选中的左右值
  let ol = ov.slice(0, os)
  let or = ov.slice(oe, ov.length)
  let nu = nv.slice(ol.length, ne)
  return ol + nu + or
}
const setPoint = (ns, ne) => {
  start = ns
  end = ne
}
// 监听键盘按下去时光标位置 防止长按
const onKeyup = () => {
  setPoint(that.selectionStart, that.selectionEnd)
  if (event.keyCode === 13){
    dialog.show(value)
  }
}
// 监听鼠标选中或者键盘选中时光标位置
const onSelect = () => {
  setPoint(that.selectionStart, that.selectionEnd)
}
// 监听键盘长按时光标位置
const onKeydown = () => {
  let ns = that.selectionStart
  let ne = that.selectionEnd
  setPoint(ns, ne)
  if (event.keyCode === 9){ // 不会触发oninput
    event.preventDefault()
    let val = that.value.slice(0, ns) + ' ' + that.value.slice(ne)
    ne = ++ns
    input(ns, ne, val)
  }
}
// 值修改后反馈操作
const onInput = () => {
  input(that.selectionStart, that.selectionEnd, that.value)
}

const input = (ns, ne, val) => {
  // 补全输入值
  let whole = opera(start, end, ns, ne, value, val)
  let error = validate(whole)
  if(error){ // 有错误信息
    // 回退
    whole = value
    ns = start
    ne = end
    dialog.show(error)
  } else {
    value = whole
  }
  that.value = encryption(whole)
  that.selectionStart = ns
  that.selectionEnd = ne
}

const validate = (value) => {
  // 全局正则每次必须从头开始匹配
  reg.lastIndex = 0
  if (reg.test(value)){
    return '不能包含除了数字、字母、._!@#%$以外的字符'
  }
  let arr = value.split(/\s+/)
  if (arr.length === 0){ // 无用户名以及密码
    return
  }
  if (arr.length > psdNum + 1){
    return `密码不能多于${psdNum}个`
  }

  if(arr[0].length > nameLen){
    return `用户名长度不能超过${nameLen}个字符`
  }
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].length > psdLen){
      return `密码长度不能超过${psdLen}个字符`
    }
  }
}

class MaskDialog{
  constructor(dom){
    this.setProps(dom)
    this.handle()
  }

  setProps(dom){
    this.mask = dom
    this.mask.setAttribute('style', 'z-index: 100001;' +
        'display: none;' +
        'position: relative;' +
        'max-width: 400px;' +
        'top: -85px;' +
        'margin:auto;')
    this.box = document.createElement('div')
    this.diaglogContent = document.createElement('div')
    this.diaglogContent.setAttribute('style', 'background-color:transparent;' +
        'background-clip: padding-box;' +
        'border: 1px solid red;' +
        'border-radius: 6px;' +
        'box-shadow: 0 3px 9px rgba(0, 0, 0, .5);' +
        'outline: 0;' +
        'overflow: hidden;' +
        'transform: rotateX(90deg);' +
        'transition: transform .3s ease-out;')

    this.maskBody = document.createElement('div')
    this.tableWrapper = document.createElement('div')

    this.maskBody.setAttribute('style', 'padding: 5px;' +
        'max-height: 350px;' +
        'font-size: 18px;' +
        'overflow-y: auto;' +
        'overflow-x: auto;' +
        'color: red;')

    this.maskBody.appendChild(this.tableWrapper)
    this.diaglogContent.appendChild(this.maskBody)
    this.box.appendChild(this.diaglogContent)

    // 渲染真实dom
    this.mask.appendChild(this.box)
  }

  show(val){
    val !== undefined && this.render(val)
    this.mask.style.display = "block"
    setTimeout(()=>{
      this.diaglogContent.style.transform = "rotateX(0)"
    }, 100)
  }

  hidden(){
    this.mask.style.display = "none"
    setTimeout(()=>{
      this.diaglogContent.style.transform = "rotateX(90deg)"
    }, 100)
    this.tableWrapper.innerHTML = ""
  }

  handle(){
    this.mask.addEventListener('click', event =>{
      event.stopPropagation()
      this.hidden()
    }, false)
  }

  render(string){
    this.maskBody.innerHTML = string
  }
}

onMounted(()=> {
  that = document.querySelector('.login-input')
  dialog = new MaskDialog(document.querySelector('.mask-wrapper'))
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .login-dev {
    position: absolute;
    top:40vh;
    width: 100vw;
  }
  .login-input {
    width: 500px;
    height: 40px;
    font-size:24px;
    text-align: center;
    background-color:transparent;
    color: #FFFFFF;
    border:1px solid #FFFFFF;
    border-radius: 5px;
  }
</style>
