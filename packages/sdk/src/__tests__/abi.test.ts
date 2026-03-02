import { describe, it, expect } from 'vitest'
import { MultiVaultAbi } from '../abi'

describe('MultiVaultAbi', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(MultiVaultAbi)).toBe(true)
    expect(MultiVaultAbi.length).toBeGreaterThan(0)
  })

  const requiredFunctions = [
    'createAtoms',
    'createTriples',
    'deposit',
    'redeem',
    'getAtomCost',
    'getTripleCost',
    'getCounterIdFromTriple',
  ]

  for (const fnName of requiredFunctions) {
    it(`should include '${fnName}' function`, () => {
      const entry = MultiVaultAbi.find(
        (e) => e.type === 'function' && e.name === fnName,
      )
      expect(entry).toBeDefined()
    })
  }

  const requiredEvents = ['AtomCreated', 'TripleCreated', 'Deposited']

  for (const eventName of requiredEvents) {
    it(`should include '${eventName}' event`, () => {
      const entry = MultiVaultAbi.find(
        (e) => e.type === 'event' && e.name === eventName,
      )
      expect(entry).toBeDefined()
    })
  }

  it('createAtoms should accept bytes[] and uint256[]', () => {
    const fn = MultiVaultAbi.find(
      (e) => e.type === 'function' && e.name === 'createAtoms',
    )
    expect(fn).toBeDefined()
    if (fn && 'inputs' in fn) {
      expect(fn.inputs).toHaveLength(2)
      expect(fn.inputs[0].type).toBe('bytes[]')
      expect(fn.inputs[1].type).toBe('uint256[]')
    }
  })

  it('deposit should accept receiver, termId, curveId, minShares', () => {
    const fn = MultiVaultAbi.find(
      (e) => e.type === 'function' && e.name === 'deposit',
    )
    expect(fn).toBeDefined()
    if (fn && 'inputs' in fn) {
      expect(fn.inputs).toHaveLength(4)
      expect(fn.inputs[0].name).toBe('receiver')
      expect(fn.inputs[1].name).toBe('termId')
      expect(fn.inputs[2].name).toBe('curveId')
      expect(fn.inputs[3].name).toBe('minShares')
    }
  })

  it('createTriples should accept subjectIds, predicateIds, objectIds, assets', () => {
    const fn = MultiVaultAbi.find(
      (e) => e.type === 'function' && e.name === 'createTriples',
    )
    expect(fn).toBeDefined()
    if (fn && 'inputs' in fn) {
      expect(fn.inputs).toHaveLength(4)
      expect(fn.inputs[0].name).toBe('subjectIds')
      expect(fn.inputs[1].name).toBe('predicateIds')
      expect(fn.inputs[2].name).toBe('objectIds')
      expect(fn.inputs[3].name).toBe('assets')
    }
  })
})
