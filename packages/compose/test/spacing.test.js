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
  })
})
