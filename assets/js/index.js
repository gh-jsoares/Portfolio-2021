console.clear()

const FORCE = 30
const GRAVITY = 0.9

const imageAsset = "/assets/images/logos/"

const imageUrls = [
	"kotlin.png",
	"java.webp",
	"c.webp",
	"cpp.png",
	"csharp.png",
	"ruby.png",
	"html.png",
	"css.png",
	"js.png",
	"ts.png",
	"python.png",
	"android.png",
	"sql.png",
	"docker.png",
	"lua.png",
	"sass.png",
]

let images = []

// Load images
for (const img of imageUrls) {
	const image = new Image()
	image.src = imageAsset + img
	images.push(image)
}

document.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('canvas')
  
	let w = canvas.width
	let h = canvas.height
    scaleCanvas()
	const ctx = canvas.getContext('2d')

    function getPos(pos) {
        return [pos[0] * w, pos[1] * h]
    }

    function scaleCanvas() {
        canvas.width = window.innerWidth - 10
        canvas.height = window.innerHeight - 10
        w = canvas.width
        h = canvas.height
    }
  
	class Ball{
		constructor(pos, vel, r, pinPos, ropeLen, dumping, image) {
			this.pos = pos.slice(0)
			this.vel = vel
			this.r = r
			this.pinPos = pinPos.slice(0)
			this.ropeLen = ropeLen
			this.dumping = dumping
			this.grabbed = false
			this.image = image
		}

		fixRope() {
			let x = getPos(this.pos)[0] - getPos(this.pinPos)[0]
			let y = getPos(this.pos)[1] - getPos(this.pinPos)[1]
			let r = Math.sqrt(x * x + y * y)
			if (r > this.ropeLen) {
				x /= r
				y /= r
				this.pos[0] = ((getPos(this.pos)[0] + getPos(this.pinPos)[0] + x * this.ropeLen) / 2) / w
				this.pos[1] = ((getPos(this.pos)[1] + getPos(this.pinPos)[1] + y * this.ropeLen) / 2) / h
				this.vel[0] -= x * (r - this.ropeLen) * this.dumping
				this.vel[1] -= y * (r - this.ropeLen) * this.dumping
			}
		}

		move() {
			if (this.grabbed) {
				return
            }
			this.fixRope()
			this.vel[1] += GRAVITY
			let x = getPos(this.pos)[0] + this.vel[0]
			let y = getPos(this.pos)[1] + this.vel[1]
			if ( x < 0 || x > w ) {
				this.vel[0] *= -1
            }
			if ( y < 0 || y > h ) {
				this.vel[1] *= -1
            }
			this.pos[0] += this.vel[0] / w
			this.pos[1] += this.vel[1] / h
		}

		render() {
			ctx.strokeStyle = '#ffffffaa'
			ctx.lineWidth = 3
			ctx.beginPath()
			ctx.moveTo(getPos(this.pos)[0], getPos(this.pos)[1])
			ctx.quadraticCurveTo(getPos(this.pinPos)[0], (getPos(this.pinPos)[1] + getPos(this.pos)[1]) / 2, getPos(this.pinPos)[0], getPos(this.pinPos)[1])
			ctx.stroke()
			ctx.beginPath()
			const imageSize = this.r + 5
			ctx.drawImage(this.image, getPos(this.pos)[0] - imageSize / 2, getPos(this.pos)[1] - imageSize / 2, imageSize, imageSize)
			ctx.fill()
		}

	}

	function pushBalls() {
		let f = FORCE
		for (let ball of balls) {
			let x = getPos(ball.pos)[0] - mouse[0]
			let y = getPos(ball.pos)[1] - mouse[1]
			let r = Math.sqrt(x * x + y * y)
			if (r < 5) {
				r = 5
            }
			ball.vel[0] += x * f / r / r
			ball.vel[1] += y * f / r / r
		}
	}
	
	let balls = []
	let ballsXOffsets = []
	let grabbedBall = null
	let mouse = [w/2, h/2]
	let push = false
	
	for (const img of images) {
		const xMargin = 5
		const yMargin = 15

        let xOffset = (Math.random() * (100 - xMargin) + xMargin) / 100
		while (ballsXOffsets.includes(xOffset)) {
        	xOffset = (Math.random() * (100 - xMargin) + xMargin) / 100
		}
		ballsXOffsets.push(xOffset)

        let yOffset = (Math.random() * (70 - yMargin) + yMargin) / 100
		// position higher when in card
		if (xOffset < 0.75 && xOffset > 0.25) {
			yOffset /= 2
		}

        let xVel = Math.random() * 5 + 0.5
        let yVel = Math.random() * 5 + 0.5
        balls.push(new Ball(
            [xOffset, yOffset],
            [xVel, yVel],
            30,
            [xOffset, 0],
            yOffset * h,
            0.7,
			img
        ))
    }
	
	function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

		if (push) {
			pushBalls()
        }

		for (let ball of balls) {
			ball.move()
        }

		for (let ball of balls) {
			ball.render()
        }

		requestAnimationFrame(loop)
	}

	loop()

	canvas.onmousemove = (e) => {
		mouse[0] = e.layerX
		mouse[1] = e.layerY
		if (grabbedBall) {
			grabbedBall.pos[0] = mouse[0] / w
			grabbedBall.pos[1] = mouse[1] / h
			grabbedBall.vel[0] = 0
			grabbedBall.vel[1] = 0
		}
	}

	function getBallUnderMouse() {
		for (let ball of balls) {
			let x = getPos(ball.pos)[0] - mouse[0]
			let y = getPos(ball.pos)[1] - mouse[1]
			let r = Math.sqrt(x * x + y * y)
			if (r < ball.r) {
				return ball
            }
		}
	}
  
	canvas.oncontextmenu = () => false
  
	canvas.onmousedown = (e) => {
		switch (e.button) {
			case 0:
				grabbedBall = getBallUnderMouse()
				if (grabbedBall) {
					grabbedBall.grabbed = true
				}
				break
			case 2:
                push = true
		}
	}

	canvas.onmouseup = (e) => {
		if (grabbedBall) {
			grabbedBall.grabbed = false
        }

		grabbedBall = null
		push = false
	}

    window.onresize = () => {
        scaleCanvas()
    }

}, false)