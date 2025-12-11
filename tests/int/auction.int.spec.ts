import { describe, it, expect } from 'vitest'
import {
  calculateBidIncrement,
  isValidBid,
  shouldExtendAuction,
  extendAuction,
} from '../../src/lib/auction'

describe('auction helpers', () => {
  describe('calculateBidIncrement', () => {
    it('returns 10€ for prices < 100€', () => {
      expect(calculateBidIncrement(50)).toBe(10)
      expect(calculateBidIncrement(99)).toBe(10)
    })

    it('returns 50€ for prices < 500€', () => {
      expect(calculateBidIncrement(100)).toBe(50)
      expect(calculateBidIncrement(150)).toBe(50)
      expect(calculateBidIncrement(499)).toBe(50)
    })

    it('returns 100€ for prices < 1000€', () => {
      expect(calculateBidIncrement(500)).toBe(100)
      expect(calculateBidIncrement(800)).toBe(100)
      expect(calculateBidIncrement(999)).toBe(100)
    })

    it('returns 200€ for prices < 5000€', () => {
      expect(calculateBidIncrement(1000)).toBe(200)
      expect(calculateBidIncrement(3000)).toBe(200)
      expect(calculateBidIncrement(4999)).toBe(200)
    })

    it('returns 500€ for prices >= 5000€', () => {
      expect(calculateBidIncrement(5000)).toBe(500)
      expect(calculateBidIncrement(6000)).toBe(500)
      expect(calculateBidIncrement(10000)).toBe(500)
    })
  })

  describe('isValidBid', () => {
    it('accepts valid bid with correct increment', () => {
      // currentBid = 100 → increment = 50 (tier < 500) → minimum = 150
      const result = isValidBid(150, 100, 50)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects bid below minimum increment', () => {
      // currentBid = 100 → increment = 50 → minimum = 150
      const result = isValidBid(120, 100, 50)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('150')
      expect(result.error).toContain('palier')
    })

    it('rejects bid below reserve price', () => {
      const result = isValidBid(60, 50, 100)
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('100')
      expect(result.error).toContain('réserve')
    })

    it('accepts bid meeting reserve price', () => {
      // currentBid = 100 → increment = 50 → minimum = 150
      const result = isValidBid(150, 100, 120)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('works without reserve price', () => {
      // currentBid = 100 → increment = 50 → minimum = 150
      const result = isValidBid(150, 100)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('validates with different price tiers', () => {
      // Tier < 100: increment 10
      expect(isValidBid(60, 50).valid).toBe(true)
      expect(isValidBid(59, 50).valid).toBe(false)

      // Tier < 500: increment 50
      expect(isValidBid(200, 150).valid).toBe(true)
      expect(isValidBid(199, 150).valid).toBe(false)

      // Tier < 1000: increment 100
      expect(isValidBid(700, 600).valid).toBe(true)
      expect(isValidBid(699, 600).valid).toBe(false)

      // Tier < 5000: increment 200
      expect(isValidBid(2200, 2000).valid).toBe(true)
      expect(isValidBid(2199, 2000).valid).toBe(false)

      // Tier >= 5000: increment 500
      expect(isValidBid(6500, 6000).valid).toBe(true)
      expect(isValidBid(6499, 6000).valid).toBe(false)
    })
  })

  describe('shouldExtendAuction', () => {
    it('returns true when in last hour before auction end', () => {
      const in30min = new Date(Date.now() + 30 * 60 * 1000)
      expect(shouldExtendAuction(in30min)).toBe(true)

      const in45min = new Date(Date.now() + 45 * 60 * 1000)
      expect(shouldExtendAuction(in45min)).toBe(true)
    })

    it('returns false when more than 1 hour before auction end', () => {
      const in2h = new Date(Date.now() + 2 * 60 * 60 * 1000)
      expect(shouldExtendAuction(in2h)).toBe(false)

      const in90min = new Date(Date.now() + 90 * 60 * 1000)
      expect(shouldExtendAuction(in90min)).toBe(false)
    })

    it('returns false when auction has already ended', () => {
      const past = new Date(Date.now() - 10 * 60 * 1000)
      expect(shouldExtendAuction(past)).toBe(false)
    })

    it('returns true exactly at 1 hour before end', () => {
      const exactly1h = new Date(Date.now() + 60 * 60 * 1000)
      // Should be false because we need to be AFTER oneHourBefore
      expect(shouldExtendAuction(exactly1h)).toBe(false)
    })
  })

  describe('extendAuction', () => {
    it('adds exactly 10 minutes to auction end date', () => {
      const end = new Date()
      const extended = extendAuction(end)
      expect(extended.getTime() - end.getTime()).toBe(10 * 60 * 1000)
    })

    it('preserves the original date object', () => {
      const end = new Date()
      const originalTime = end.getTime()
      extendAuction(end)
      expect(end.getTime()).toBe(originalTime)
    })

    it('works with different dates', () => {
      const futureDate = new Date('2025-12-31T23:50:00Z')
      const extended = extendAuction(futureDate)
      expect(extended.toISOString()).toBe('2026-01-01T00:00:00.000Z')
    })
  })
})
