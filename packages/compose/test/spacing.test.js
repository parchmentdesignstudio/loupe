import { describe, expect, it } from 'vitest'
import { gapClasses, gapSteps, gapValue } from '../src/spacing.js'

describe('gapValue', () => {
  it('takes a bare number as steps of Tailwind’s scale', () => {
    expect(gapValue('4', true)).toBe('calc(var(--spacing) * 4)')
    expect(gapValue('4', false)).toBe('1rem')
    expect(gapValue('1.5', false)).toBe('0.375rem')
    expect(gapValue('0', true)).toBe('0px')
  })

  it('takes rows then columns, and leaves a length as it is', () => {
    expect(gapValue('4 8', false)).toBe('1rem 2rem')
    expect(gapValue('24px', true)).toBe('24px')
    expect(gapValue('2 1vw', false)).toBe('0.5rem 1vw')
  })
})

describe('gapSteps and gapClasses', () => {
  it('reads a gap back as it was typed', () => {
    expect(gapSteps('calc(var(--spacing) * 4)')).toBe('4')
    expect(gapSteps('1rem 2rem')).toBe('4 8')
    expect(gapSteps('0.375rem')).toBe('1.5')
    expect(gapSteps('24px')).toBeNull()
    expect(gapSteps('0.3rem')).toBeNull()
  })

  it('names the classes', () => {
    expect(gapClasses('calc(var(--spacing) * 4)')).toBe('gap-4')
    expect(gapClasses('1rem 2rem')).toBe('gap-y-4 gap-x-8')
    expect(gapClasses('1rem 1rem')).toBe('gap-4')
    expect(gapClasses('24px')).toBeNull()
    expect(gapClasses('0px 1.5rem')).toBe('gap-x-6')
  })
})

describe('padding', () => {
  it('names a side’s class, and an axis’s', async () => {
    const { spacingClasses } = await import('../src/spacing.js')
    expect(spacingClasses('padding-left', '1rem')).toBe('pl-4')
    expect(spacingClasses('padding-inline', 'calc(var(--spacing) * 6)')).toBe('px-6')
    expect(spacingClasses('padding', '13px')).toBeNull()
    expect(spacingClasses('gap', '1rem 2rem')).toBe('gap-y-4 gap-x-8')
  })

  it('gathers sides that match', async () => {
    const { gatherPadding } = await import('../src/spacing.js')
    const sides = (top, right, bottom, left) => new Map([['padding-top', top], ['padding-right', right], ['padding-bottom', bottom], ['padding-left', left]])
    expect([...gatherPadding(sides('1rem', '1rem', '1rem', '1rem'))]).toEqual([['padding', '1rem']])
    expect([...gatherPadding(sides('1rem', '2rem', '1rem', '2rem'))]).toEqual([['padding-inline', '2rem'], ['padding-block', '1rem']])
    expect([...gatherPadding(new Map([['display', 'grid'], ['padding-left', '1rem']]))]).toEqual([['display', 'grid'], ['padding-left', '1rem']])
  })
})
