import { random } from "../utils"

function Move(){
    // 是否鼠标按下
    this.mouse = false
    // 坐标
    this.x = 0
    this.y = 0
    // 偏移量
    this.dx = 0
    this.dy = 0
    // 辅助位置
    this.r = 10
    this.rx = 0
    this.ry = 0
    this.angle = 0
}

Move.prototype.setOnce = function(mouse, x, y){
    this.mouse = mouse
    this.x = x
    this.y = y
}
Move.prototype.setMove = function(x, y){
    this.dx += this.calc(x, this.x)
    this.dy += this.calc(y, this.y)
    this.x = x
    this.y = y
}
Move.prototype.calc = function(a, b){
    return a > b ? -Math.sqrt(a - b) : Math.sqrt(b - a)
}
Move.prototype.automate = function(){
    this.angle += 0.005
    if (this.angle > Math.PI){
        this.angle = this.angle - Math.PI - Math.PI
    }
    let rx = Math.sin(this.angle) * this.r
    let ry = Math.cos(this.angle) * this.r
    this.dx += this.calc(rx, this.rx)
    this.dy += this.calc(ry, this.ry)
    this.x += rx
    this.y += ry
    this.rx = rx
    this.ry = ry
}

function Star(image, orbitRadius, radius, orbitX, orbitY, timePassed, speed, alpha, offset){
    this.image = image // canvas元素
    this.orbitRadius = orbitRadius
    this.radius = radius
    // 星星中心点
    this.orbitX = orbitX
    this.orbitY = orbitY
    this.timePassed = timePassed
    this.speed = speed
    //星星移动速度
    this.alpha = alpha
    // 偏移系数
    this.offset = offset
    this.beReborn(3000, 5000)
}

Star.maxOrbit = function(x, y){
    //星星移动范围，值越大范围越小，
    let max = Math.max(x, y)
    let diameter = Math.round(Math.sqrt(max * max + max * max))
    return diameter / 2
}

Star.prototype.beReborn = function(maxLife, maxReborn){
    this.life = random(0, maxLife)
    this.reborn = random(0, maxReborn)
}

Star.prototype.draw = function(ctx, move) {
    if(this.life === 0 && this.reborn === 0){
        this.beReborn(3000, 5000)
        return
    }
    if(this.life === 0 && this.reborn !== 0){
        this.reborn--
        return
    }
    this.life--
    let x = Math.sin(this.timePassed) * this.orbitRadius + (this.orbitX - move.dx) * this.offset
    let y = Math.cos(this.timePassed) * this.orbitRadius + (this.orbitY - move.dy) * this.offset
    let twinkle = random(10)
    if (twinkle === 1 && this.alpha > 0) {
        this.alpha -= 0.05
    } else if (twinkle === 2 && this.alpha < 1) {
        this.alpha += 0.05
    }
    ctx.globalAlpha = this.alpha
    ctx.drawImage(this.image, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius)
    this.timePassed += this.speed
}

function Starry(real){
    this.runtime = false
    this.realCtx = real.getContext('2d')
    // 虚拟画布
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.w = this.canvas.width = real.width
    this.h = this.canvas.height = real.height
    // 星星对象集合
    this.stars = []
    // 鼠标按下
    this.move = new Move()
    // 设置事件
    this.initEvent(real)
    // 加载星星图像
    let image = document.createElement('canvas')
    this.hue = 217
    this.initImage(image, this.hue)
    // 加载星星集合
    this.maxStars = 5000
    this.initStars(this.stars, image, this.w, this.h, this.maxStars)
    // 加载星星动画
    this.run()
}

Starry.prototype.initEvent = function(canvas){
    let that = this
    canvas.onmousedown = function(e){
        that.move.setOnce(true, e.clientX, e.clientY)
    }
    canvas.onmousemove = function(e){
        if (!that.move.mouse)
            return
        that.move.setMove(e.clientX, e.clientY)
    }
    canvas.onmouseup = function (){
        that.move.mouse = false
    }


    canvas.ontouchstart = function(e){
        let target = e.targetTouches[0]
        that.move.setOnce(true, target.clientX, target.clientY)
    }
    canvas.ontouchmove = function(e){
        if (!that.move.mouse)
            return
        let target = e.targetTouches[0]
        that.move.setMove(target.clientX, target.clientY)
        e.preventDefault()

    }
    canvas.ontouchend = function(){
        that.move.mouse = false
    }
}

Starry.prototype.initImage = function(canvas, hue){
    // 加载缓存画布
    canvas.width = 100
    canvas.height = 100
    let half = canvas.width / 2
    let ctx = canvas.getContext('2d')
    // 渐变色添加
    let gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
    gradient.addColorStop(0.025, '#CCC')
    gradient.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)')
    gradient.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(half, half, half, 0, Math.PI * 2)
    ctx.fill()
}

Starry.prototype.initStars = function(stars, image, w, h, maxStars){
    // 星星大小
    let orbitX = w / 2
    let orbitY = h / 2
    for (let i = 0; i < maxStars; i++) {
        let orbitRadius = random(Star.maxOrbit(this.w, this.h))
        let radius = random(60, orbitRadius) / 18
        let timePassed = random(0, maxStars)
        let speed = random(orbitRadius) / 500000
        //星星移动速度
        let alpha = random(2, 10) / 10
        // 偏移系数
        let offset = timePassed / maxStars + 1
        stars[i] = new Star(image, orbitRadius, radius, orbitX, orbitY, timePassed, speed, alpha, offset)
    }
}

Starry.prototype.frame = function(){
    this.ctx.globalCompositeOperation = 'source-over'
    this.ctx.globalAlpha = 0.5 //尾巴
    this.ctx.fillStyle = 'hsla(' + this.hue + ', 64%, 6%, 2)'
    this.ctx.fillRect(0, 0, this.w, this.h)
    this.ctx.globalCompositeOperation = 'lighter'
    this.stars.forEach((item) => item.draw(this.ctx, this.move))
    // 渲染真实画布
    this.realCtx.drawImage(this.canvas, 0, 0, this.w, this.h, 0, 0, this.w, this.h)

}

Starry.prototype.initAnimation = function(){
    this.frame()
    this.auxiliary()
    this.runtime && window.requestAnimationFrame(() => this.initAnimation())
}

Starry.prototype.auxiliary = function(){
    if (this.move.mouse){ // 鼠标在移动则不作操作
        return
    }
    this.move.automate()
}

Starry.prototype.stop = function(){
    this.runtime = false
}

Starry.prototype.run = function(){
    this.runtime = true
    this.initAnimation()
}

function starry(canvas){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight + 10
    return new Starry(canvas)
}

export {
    starry
}