import { random } from "../utils"

function Sakura(image, maxWidth, maxHeight, turn) {
    // 图像
    this.image = image
    // 界限
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    // 可轮回数
    this.turn = turn
    // 越界范围 写个死值就行
    this.over = 50
    // 坐标
    this.x = 0
    this.y = 0
    this.s = 0
    // 半径
    this.r = 0
    // 随机因子
    this.factorX = 0
    this.factorY = 0
    this.factorR = 0
    this.reset(this.maxWidth, this.maxHeight, 0 , 0)
}

Sakura.prototype.reset = function(width, height, dx, dy ){
    // 坐标
    this.x = Math.random() * width + dx
    this.y = Math.random() * height + dy
    //
    this.s = Math.random()
    // 旋转半径
    this.r = Math.random() * 6

    // 随机因子
    this.factorX = Math.random()
    this.factorY = Math.random()
    this.factorR = Math.random()
}

Sakura.prototype.transformers = function(){
    this.x = this.x - 1.95 - this.factorX * 0.5
    this.y = this.y + 1.5 + this.factorY * 0.7
    this.r = this.r + this.factorR * 0.03
}
Sakura.prototype.draw = function(cxt) {
    if (this.turn === 0){
        return
    }
    this.update()
    cxt.save()
    cxt.translate(this.x, this.y)
    cxt.rotate(this.r)
    cxt.drawImage(this.image, 0, 0, 40 * this.s, 40 * this.s)
    cxt.restore()
}
Sakura.prototype.update = function() {
    this.transformers()
    if (this.overstep()){
        this.reset(this.maxWidth, 0, 0, -this.over)
        this.turn--
    }
}
// 是否越界
Sakura.prototype.overstep = function(){
    return this.x > this.maxWidth + this.over ||
        this.x < -this.over ||
        this.y > this.maxHeight + this.over ||
        this.y < -this.over
}

function SakuraFallen(real){
    // 真实画笔
    this.realCtx = real.getContext('2d')
    // 樱花个数
    this.size = 50
    this.runtime = false
    // 虚拟画布
    this.canvas = document.createElement('canvas')
    this.width = this.canvas.width = real.width
    this.height = this.canvas.height = real.height
    // 虚拟画笔
    this.ctx = this.canvas.getContext('2d')
    // 生成樱花图片
    let image = this.initImage()
    // 樱花集合
    this.sakuras = []
    this.initSakuras(this.sakuras, image, this.size)
    this.run()
}

// 樱花图形
SakuraFallen.prototype.initImage = function(){
    let canvas = document.createElement('canvas')
    let width = 100
    let height = 100
    canvas.width = width
    canvas.height = height
    let ctx = canvas.getContext('2d')
    const entityColor = ctx.createRadialGradient(0, 40, 0, 0, 40, 80);
    entityColor.addColorStop(0, 'hsl(330, 70%, 65%)');
    entityColor.addColorStop(0.05, 'hsl(330, 40%, 71.5%)');
    entityColor.addColorStop(1, 'hsl(330, 20%, 91%)');

    ctx.save();
    ctx.fillStyle = entityColor;
    ctx.strokeStyle = 'hsl(330, 40%, 100%)';
    ctx.translate(width / 2, height / 2);
    ctx.scale(Math.sin(Math.PI/2), 1);

    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.bezierCurveTo(-60, 20, -10, -60, 0, -20);
    ctx.bezierCurveTo(10, -60, 60, 20, 0, 40);
    ctx.fill();
    for(let i = -4; i < 4; i++){
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.quadraticCurveTo(i * 12, 10, i * 4, -24 + Math.abs(i) * 2);
        ctx.stroke();
    }
    ctx.restore();
    return canvas
}
// 初始化樱花
SakuraFallen.prototype.initSakuras = function(sakuras, image, size){
    for (let i = 0; i < size; i++) {
        sakuras[i] = new Sakura(image, this.width, this.height, random(1, i + 2))
    }
}

SakuraFallen.prototype.frame = function(){
    // 清空画布
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.realCtx.clearRect(0, 0, this.width, this.height)
    // 画上樱花
    this.sakuras.forEach((item) => item.draw(this.ctx))
    // 渲染真实画布
    this.realCtx.drawImage(this.canvas, 0, 0, this.width, this.height, 0, 0, this.width, this.height)
}

SakuraFallen.prototype.initAnimation = function(){
    this.frame()
    this.runtime && window.requestAnimationFrame(() => this.initAnimation())
}

SakuraFallen.prototype.stop = function(){
    this.runtime = false
}

SakuraFallen.prototype.run = function(){
    this.runtime = true
    this.initAnimation()
}

function sakura(canvas){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    return new SakuraFallen(canvas)
}

export {
    sakura
}