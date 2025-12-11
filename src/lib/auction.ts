/**
 * Auction Helpers
 * 
 * Pure TypeScript functions for auction logic (no external dependencies).
 * Used by API routes, cron jobs, and tests.
 */

/**
 * Calculate the bid increment based on current price
 * 
 * Rules:
 * - < 100€ → 10€
 * - < 500€ → 50€
 * - < 1000€ → 100€
 * - < 5000€ → 200€
 * - >= 5000€ → 500€
 */
export function calculateBidIncrement(currentPrice: number): number {
  if (currentPrice < 100) return 10
  if (currentPrice < 500) return 50
  if (currentPrice < 1000) return 100
  if (currentPrice < 5000) return 200
  return 500
}

/**
 * Validate if a new bid is acceptable
 * 
 * @param newBid - The new bid amount
 * @param currentBid - The current highest bid
 * @param reservePrice - Optional reserve price (minimum to sell)
 * @returns Object with valid flag and optional error message
 */
export function isValidBid(
  newBid: number,
  currentBid: number,
  reservePrice?: number,
): { valid: boolean; error?: string } {
  // Calculate required increment
  const increment = calculateBidIncrement(currentBid)
  const minimumBid = currentBid + increment

  // Check if bid meets minimum increment
  if (newBid < minimumBid) {
    return {
      valid: false,
      error: `L'enchère minimum est de ${minimumBid}€ (palier de ${increment}€).`,
    }
  }

  // Check if bid meets reserve price (if set)
  if (reservePrice !== undefined && newBid < reservePrice) {
    return {
      valid: false,
      error: `L'enchère doit être au minimum de ${reservePrice}€ (prix de réserve).`,
    }
  }

  return { valid: true }
}

/**
 * Check if auction should be extended
 * 
 * An auction is extended by 10 minutes if a bid is placed in the last hour.
 * 
 * @param auctionEndDate - The current end date of the auction
 * @returns true if we're in the last hour before auction end
 */
export function shouldExtendAuction(auctionEndDate: Date): boolean {
  const now = new Date()
  const oneHourBefore = new Date(auctionEndDate.getTime() - 60 * 60 * 1000)

  // Return true if we're between 1 hour before end and the end date
  return now > oneHourBefore && now < auctionEndDate
}

/**
 * Extend auction end date by 10 minutes
 * 
 * @param auctionEndDate - The current end date
 * @returns New end date with +10 minutes
 */
export function extendAuction(auctionEndDate: Date): Date {
  return new Date(auctionEndDate.getTime() + 10 * 60 * 1000)
}
