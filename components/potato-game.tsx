"use client"

import { useRef, useEffect, useCallback, useState } from "react"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 300
const GROUND_Y = 240
const GRAVITY = 0.6
const JUMP_FORCE = -12
const INITIAL_SPEED = 5
const SPEED_INCREMENT = 0.001
const POTATO_SIZE = 44
const KNIFE_WIDTH = 20
const KNIFE_HEIGHT = 50
const MIN_KNIFE_GAP = 80
const MAX_KNIFE_GAP = 200

interface Knife {
  x: number
  height: number
}

function drawPotato(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x + size / 2, y + size / 2)

  // body
  ctx.fillStyle = "#c4913a"
  ctx.beginPath()
  ctx.ellipse(0, 2, size / 2 - 2, size / 2 + 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "#8b6914"
  ctx.lineWidth = 2
  ctx.stroke()

  // spots
  ctx.fillStyle = "#a87828"
  ctx.beginPath()
  ctx.ellipse(-8, -6, 3, 2, 0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(6, 4, 2.5, 1.5, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-4, 8, 2, 1.5, 0.7, 0, Math.PI * 2)
  ctx.fill()

  // eyes
  ctx.fillStyle = "#2c1810"
  ctx.beginPath()
  ctx.ellipse(-7, -2, 3, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(7, -2, 3, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // eye shine
  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.ellipse(-8, -4, 1.2, 1.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(6, -4, 1.2, 1.2, 0, 0, Math.PI * 2)
  ctx.fill()

  // mouth
  ctx.strokeStyle = "#2c1810"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, 4, 5, 0.15, Math.PI - 0.15)
  ctx.stroke()

  // blush
  ctx.fillStyle = "rgba(220, 120, 120, 0.35)"
  ctx.beginPath()
  ctx.ellipse(-12, 3, 3.5, 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(12, 3, 3.5, 2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawFrenchFries(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.translate(x + size / 2, y + size / 2)

  // red container
  ctx.fillStyle = "#d63031"
  ctx.beginPath()
  ctx.moveTo(-16, 4)
  ctx.lineTo(-12, size / 2 + 4)
  ctx.lineTo(12, size / 2 + 4)
  ctx.lineTo(16, 4)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = "#b71c1c"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // container stripe
  ctx.fillStyle = "#c0392b"
  ctx.beginPath()
  ctx.moveTo(-15, 10)
  ctx.lineTo(-13, size / 2 + 2)
  ctx.lineTo(13, size / 2 + 2)
  ctx.lineTo(15, 10)
  ctx.closePath()
  ctx.fill()

  // fries sticking out
  const fries = [
    { xOff: -9, angle: -0.2, h: 22 },
    { xOff: -4, angle: -0.08, h: 26 },
    { xOff: 1, angle: 0.05, h: 24 },
    { xOff: 6, angle: 0.15, h: 20 },
    { xOff: 10, angle: 0.25, h: 18 },
    { xOff: -7, angle: 0.1, h: 17 },
    { xOff: 3, angle: -0.12, h: 21 },
  ]

  for (const fry of fries) {
    ctx.save()
    ctx.translate(fry.xOff, 4)
    ctx.rotate(fry.angle)
    ctx.fillStyle = "#f9ca24"
    ctx.fillRect(-2.5, -fry.h, 5, fry.h)
    ctx.strokeStyle = "#d4a812"
    ctx.lineWidth = 0.7
    ctx.strokeRect(-2.5, -fry.h, 5, fry.h)
    // fry tip
    ctx.fillStyle = "#e8b810"
    ctx.fillRect(-2.5, -fry.h, 5, 3)
    ctx.restore()
  }

  ctx.restore()
}

function drawKnife(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  const knifeH = KNIFE_HEIGHT
  const bladeY = groundY - knifeH

  ctx.save()

  // blade
  ctx.fillStyle = "#c0c0c0"
  ctx.beginPath()
  ctx.moveTo(x, bladeY)
  ctx.lineTo(x + KNIFE_WIDTH, bladeY)
  ctx.lineTo(x + KNIFE_WIDTH, groundY - 14)
  ctx.lineTo(x + KNIFE_WIDTH / 2, groundY - 8)
  ctx.lineTo(x, groundY - 14)
  ctx.closePath()
  ctx.fill()

  // blade shine
  ctx.fillStyle = "rgba(255,255,255,0.45)"
  ctx.beginPath()
  ctx.moveTo(x + 3, bladeY + 2)
  ctx.lineTo(x + 7, bladeY + 2)
  ctx.lineTo(x + 7, groundY - 18)
  ctx.lineTo(x + 3, groundY - 16)
  ctx.closePath()
  ctx.fill()

  // blade edge
  ctx.strokeStyle = "#888"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, bladeY)
  ctx.lineTo(x + KNIFE_WIDTH, bladeY)
  ctx.lineTo(x + KNIFE_WIDTH, groundY - 14)
  ctx.lineTo(x + KNIFE_WIDTH / 2, groundY - 8)
  ctx.lineTo(x, groundY - 14)
  ctx.closePath()
  ctx.stroke()

  // handle
  ctx.fillStyle = "#5c3a1e"
  ctx.fillRect(x + 2, groundY - 10, KNIFE_WIDTH - 4, 12)
  ctx.strokeStyle = "#3e2510"
  ctx.lineWidth = 1
  ctx.strokeRect(x + 2, groundY - 10, KNIFE_WIDTH - 4, 12)

  // handle rivets
  ctx.fillStyle = "#c0a060"
  ctx.beginPath()
  ctx.arc(x + KNIFE_WIDTH / 2, groundY - 5, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawGround(ctx: CanvasRenderingContext2D, width: number, groundY: number, offset: number) {
  // counter surface
  ctx.fillStyle = "#d4b896"
  ctx.fillRect(0, groundY, width, 60)

  // counter edge
  ctx.strokeStyle = "#b89c7a"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(width, groundY)
  ctx.stroke()

  // texture lines (move with game)
  ctx.strokeStyle = "rgba(160, 130, 100, 0.25)"
  ctx.lineWidth = 1
  for (let i = -1; i < width / 40 + 2; i++) {
    const lineX = (i * 40 - (offset % 40))
    ctx.beginPath()
    ctx.moveTo(lineX, groundY + 8)
    ctx.lineTo(lineX + 15, groundY + 55)
    ctx.stroke()
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, width: number, offset: number) {
  ctx.fillStyle = "rgba(210, 190, 170, 0.3)"
  const clouds = [
    { baseX: 120, y: 40, r: 20 },
    { baseX: 350, y: 60, r: 15 },
    { baseX: 600, y: 35, r: 22 },
    { baseX: 850, y: 55, r: 18 },
  ]
  for (const cloud of clouds) {
    const cx = ((cloud.baseX - offset * 0.15) % (width + 100) + width + 100) % (width + 100) - 50
    ctx.beginPath()
    ctx.arc(cx, cloud.y, cloud.r, 0, Math.PI * 2)
    ctx.arc(cx + cloud.r * 0.8, cloud.y - 5, cloud.r * 0.7, 0, Math.PI * 2)
    ctx.arc(cx - cloud.r * 0.7, cloud.y - 3, cloud.r * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function PotatoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const gameRef = useRef({
    potatoY: GROUND_Y - POTATO_SIZE,
    velocityY: 0,
    isJumping: false,
    knives: [] as Knife[],
    speed: INITIAL_SPEED,
    score: 0,
    frameCount: 0,
    groundOffset: 0,
    animationId: 0,
    gameState: "idle" as "idle" | "playing" | "dead",
    deathTimer: 0,
  })

  const startGame = useCallback(() => {
    const g = gameRef.current
    g.potatoY = GROUND_Y - POTATO_SIZE
    g.velocityY = 0
    g.isJumping = false
    g.knives = []
    g.speed = INITIAL_SPEED
    g.score = 0
    g.frameCount = 0
    g.groundOffset = 0
    g.gameState = "playing"
    g.deathTimer = 0
    setGameState("playing")
    setScore(0)
  }, [])

  const jump = useCallback(() => {
    const g = gameRef.current
    if (g.gameState === "idle") {
      startGame()
      return
    }
    if (g.gameState === "dead") {
      if (g.deathTimer > 30) {
        startGame()
      }
      return
    }
    if (!g.isJumping) {
      g.velocityY = JUMP_FORCE
      g.isJumping = true
    }
  }, [startGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleClick = () => jump()
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        jump()
      }
    }

    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("touchstart", handleClick, { passive: true })
    window.addEventListener("keydown", handleKey)

    function spawnKnife(g: { knives: Knife[], speed: number }) {
      const lastKnife = g.knives[g.knives.length - 1]
      const gap = MIN_KNIFE_GAP + Math.random() * MAX_KNIFE_GAP
      const newX = lastKnife ? Math.max(lastKnife.x + gap, CANVAS_WIDTH + 20) : CANVAS_WIDTH + 50
      g.knives.push({ x: newX, height: KNIFE_HEIGHT })
    }

    function checkCollision(g: { knives: Knife[], potatoY: number }) {
      const potatoLeft = 60 + 6
      const potatoRight = 60 + POTATO_SIZE - 6
      const potatoTop = g.potatoY + 6
      const potatoBottom = g.potatoY + POTATO_SIZE - 4

      for (const knife of g.knives) {
        const knifeLeft = knife.x + 2
        const knifeRight = knife.x + KNIFE_WIDTH - 2
        const knifeTop = GROUND_Y - knife.height

        if (
          potatoRight > knifeLeft &&
          potatoLeft < knifeRight &&
          potatoBottom > knifeTop
        ) {
          return true
        }
      }
      return false
    }

    function gameLoop() {
      if (!ctx || !canvas) return
      const g = gameRef.current

      // Clear
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // sky
      ctx.fillStyle = "#f5ebe0"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // clouds
      drawClouds(ctx, CANVAS_WIDTH, g.groundOffset)

      // ground
      drawGround(ctx, CANVAS_WIDTH, GROUND_Y, g.groundOffset)

      if (g.gameState === "playing") {
        // Update physics
        g.velocityY += GRAVITY
        g.potatoY += g.velocityY

        if (g.potatoY >= GROUND_Y - POTATO_SIZE) {
          g.potatoY = GROUND_Y - POTATO_SIZE
          g.velocityY = 0
          g.isJumping = false
        }

        // Update speed
        g.speed += SPEED_INCREMENT
        g.groundOffset += g.speed

        // Move knives
        for (const knife of g.knives) {
          knife.x -= g.speed
        }

        // Remove off-screen knives & score
        const prevLength = g.knives.length
        g.knives = g.knives.filter((k) => k.x > -KNIFE_WIDTH)
        if (g.knives.length < prevLength) {
          g.score += 1
        }

        // Spawn knives
        if (g.knives.length === 0 || g.knives[g.knives.length - 1].x < CANVAS_WIDTH - 100) {
          spawnKnife(g)
        }

        // Score by frames
        g.frameCount++
        if (g.frameCount % 6 === 0) {
          g.score = Math.floor(g.frameCount / 6)
          setScore(g.score)
        }

        // Collision
        if (checkCollision(g)) {
          g.gameState = "dead"
          g.deathTimer = 0
          setGameState("dead")
          setHighScore((prev) => Math.max(prev, g.score))
        }

        // Draw knives
        for (const knife of g.knives) {
          drawKnife(ctx, knife.x, GROUND_Y)
        }

        // Draw potato
        drawPotato(ctx, 60, g.potatoY, POTATO_SIZE)
      } else if (g.gameState === "dead") {
        g.deathTimer++

        // Draw knives frozen
        for (const knife of g.knives) {
          drawKnife(ctx, knife.x, GROUND_Y)
        }

        // Draw french fries instead of potato
        drawFrenchFries(ctx, 60, g.potatoY, POTATO_SIZE)

        // Game over text
        ctx.fillStyle = "#2c1810"
        ctx.font = "bold 20px var(--font-pixel), monospace"
        ctx.textAlign = "center"
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 100)

        ctx.font = "10px var(--font-pixel), monospace"
        ctx.fillStyle = "#8b6914"
        ctx.fillText("You became french fries!", CANVAS_WIDTH / 2, 125)

        if (g.deathTimer > 30) {
          ctx.fillStyle = "#5c3a1e"
          ctx.fillText("Click to try again", CANVAS_WIDTH / 2, 155)
        }

        ctx.textAlign = "start"
      } else {
        // Idle state
        drawPotato(ctx, 60, GROUND_Y - POTATO_SIZE, POTATO_SIZE)

        ctx.fillStyle = "#2c1810"
        ctx.font = "16px var(--font-pixel), monospace"
        ctx.textAlign = "center"
        ctx.fillText("POTATO RUNNER", CANVAS_WIDTH / 2, 80)

        ctx.font = "9px var(--font-pixel), monospace"
        ctx.fillStyle = "#8b6914"
        ctx.fillText("Click or press Space to start", CANVAS_WIDTH / 2, 110)

        ctx.textAlign = "start"
      }

      // Score display
      ctx.fillStyle = "#2c1810"
      ctx.font = "10px var(--font-pixel), monospace"
      ctx.textAlign = "right"
      ctx.fillText(`${String(g.score).padStart(5, "0")}`, CANVAS_WIDTH - 16, 24)
      ctx.textAlign = "start"

      g.animationId = requestAnimationFrame(gameLoop)
    }

    const g = gameRef.current
    g.animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(g.animationId)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("touchstart", handleClick)
      window.removeEventListener("keydown", handleKey)
    }
  }, [jump])

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen bg-background select-none"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full max-w-[800px] px-2">
          <h1
            className="text-foreground text-sm tracking-wide"
            style={{ fontFamily: "var(--font-pixel), monospace" }}
          >
            Potato Runner
          </h1>
          <div className="flex items-center gap-6">
            {highScore > 0 && (
              <span
                className="text-muted-foreground text-xs"
                style={{ fontFamily: "var(--font-pixel), monospace" }}
              >
                HI {String(highScore).padStart(5, "0")}
              </span>
            )}
            <span
              className="text-foreground text-xs"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              {String(score).padStart(5, "0")}
            </span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-border rounded-lg cursor-pointer max-w-full"
          style={{ imageRendering: "pixelated" }}
          aria-label="Potato Runner game canvas. Click or press Space to jump."
          role="img"
          tabIndex={0}
        />

        <div className="flex items-center gap-2">
          {gameState === "idle" && (
            <p
              className="text-muted-foreground text-xs animate-pulse"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              Click the game to start!
            </p>
          )}
          {gameState === "playing" && (
            <p
              className="text-muted-foreground text-xs"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              Click or Space to jump over the knives!
            </p>
          )}
          {gameState === "dead" && (
            <p
              className="text-accent text-xs"
              style={{ fontFamily: "var(--font-pixel), monospace" }}
            >
              The potato became french fries!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
