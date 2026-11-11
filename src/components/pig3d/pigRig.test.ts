import { describe, expect, it } from 'vitest'
import { PIG_MOODS } from '../pig/pigMood'
import { createPigRig } from './pigRig'

const input = (mood: (typeof PIG_MOODS)[number], clock = true) => ({
  mood,
  clock,
  pointerX: 0.3,
  pointerY: -0.2,
})

function run(
  rig: ReturnType<typeof createPigRig>,
  mood: (typeof PIG_MOODS)[number],
  seconds: number,
) {
  let t = 0
  for (; t < seconds; t += 1 / 30) rig.update(1 / 30, t, input(mood))
}

describe('createPigRig', () => {
  it('runs through every mood without throwing and keeps the pig on the ground', () => {
    const rig = createPigRig()
    for (const mood of PIG_MOODS) run(rig, mood, 2)
    const [root] = rig.object.children
    expect(Number.isFinite(root.position.y)).toBe(true)
    rig.dispose()
  })

  it('builds the lying pig only when a mood needs it', () => {
    const rig = createPigRig()
    const body = rig.object.children[0].children[0]
    run(rig, 'happy', 0.5)
    expect(body.children).toHaveLength(1)
    run(rig, 'sleepy', 0.1)
    expect(body.children).toHaveLength(2)
    rig.dispose()
  })

  it('shows the lying pig only while sleepy, after the jump into the new mood', () => {
    const rig = createPigRig()
    const body = rig.object.children[0].children[0]
    run(rig, 'sleepy', 0.2)
    const [standing, lying] = body.children
    expect(lying.visible).toBe(true)
    expect(standing.visible).toBe(false)
    run(rig, 'happy', 1)
    expect(standing.visible).toBe(true)
    expect(lying.visible).toBe(false)
    rig.dispose()
  })

  it('drops one clock each time the pulse changes, and symbols can be switched off', () => {
    const rig = createPigRig()
    const root = rig.object.children[0]
    const clockVisible = () =>
      root.children.some((c) => c.type === 'Group' && c.visible && c.position.y > 1.2)
    let t = 0
    const step = (pulse: number, symbols = true) => {
      rig.update(1 / 30, (t += 1 / 30), {
        mood: 'happy',
        clock: false,
        pulse,
        symbols,
        pointerX: 0,
        pointerY: 0,
      })
    }
    for (let i = 0; i < 10; i++) step(0)
    expect(clockVisible()).toBe(false)
    step(1)
    for (let i = 0; i < 5; i++) step(1)
    expect(clockVisible()).toBe(true)
    for (let i = 0; i < 60; i++) step(1, false) // the drop is over after about a second
    expect(clockVisible()).toBe(false)
    expect(root.children.filter((c) => c.type === 'Sprite' && c.visible)).toHaveLength(0)
    rig.dispose()
  })
})
