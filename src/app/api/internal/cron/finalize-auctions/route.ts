import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/internal/cron/finalize-auctions
 * 
 * Cron job to finalize expired auctions
 * 
 * Protected by CRON_SECRET in x-cron-secret header
 * 
 * Process:
 * 1. Find all expired auctions (auctionEndDate < now, status = active)
 * 2. For each auction:
 *    - If no bids: mark as expired
 *    - If has winning bid: create transaction and mark as sold
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')

    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await getPayload({ config: configPromise })
    const now = new Date()

    // Find expired auctions
    const expiredAuctions = await payload.find({
      collection: 'objects',
      where: {
        and: [
          {
            auctionEndDate: {
              less_than: now.toISOString(),
            },
          },
          {
            status: {
              equals: 'active',
            },
          },
          {
            saleMode: {
              equals: 'auction',
            },
          },
        ],
      },
      limit: 100, // Process max 100 per run
    })

    let processedCount = 0
    let expiredNoBidsCount = 0
    let transactionsCreatedCount = 0
    let transactionsExistingCount = 0

    // Process each expired auction
    for (const object of expiredAuctions.docs) {
      try {
        // Find winning bid (highest amount)
        const bidsResult = await payload.find({
          collection: 'bids',
          where: {
            object: {
              equals: object.id,
            },
          },
          sort: '-amount',
          limit: 1,
        })

        const winningBid = bidsResult.docs[0]

        if (!winningBid) {
          // No bids - mark as expired
          await payload.update({
            collection: 'objects',
            id: object.id,
            data: {
              status: 'expired',
            },
          })

          expiredNoBidsCount++
          console.log(`⏰ Enchère expirée sans enchères: ${object.name} (${object.id})`)
        } else {
          // Has winning bid - check if transaction already exists
          const existingTransactions = await payload.find({
            collection: 'transactions',
            where: {
              object: {
                equals: object.id,
              },
            },
            limit: 1,
          })

          const existingTransaction = existingTransactions.docs[0]

          if (existingTransaction) {
            // Transaction already exists
            transactionsExistingCount++
            console.log(`ℹ️ Transaction déjà existante pour ${object.name} (${object.id})`)
          } else {
            // Create new transaction
            const buyerId = typeof winningBid.bidder === 'string'
              ? winningBid.bidder
              : winningBid.bidder?.id

            const sellerId = typeof object.seller === 'string'
              ? object.seller
              : object.seller?.id

            // Get commission rates from settings
            const settings = await payload.findGlobal({ slug: 'settings' })
            const buyerCommissionRate = settings.globalBuyerCommission || 3
            const sellerCommissionRate = settings.globalSellerCommission || 2

            // Calculate amounts
            const finalPrice = winningBid.amount
            const buyerCommission = Math.round(finalPrice * (buyerCommissionRate / 100))
            const sellerCommission = Math.round(finalPrice * (sellerCommissionRate / 100))
            const shippingCost = 0 // To be determined later
            const totalAmount = finalPrice + buyerCommission + shippingCost
            const sellerAmount = finalPrice - sellerCommission

            const transaction = await payload.create({
              collection: 'transactions',
              data: {
                object: object.id,
                buyer: buyerId,
                seller: sellerId,
                finalPrice,
                buyerCommission,
                sellerCommission,
                shippingCost,
                totalAmount,
                sellerAmount,
                paymentStatus: 'pending',
                status: 'payment_pending',
              },
            })

            transactionsCreatedCount++
            console.log(`✅ Transaction créée pour ${object.name} (${object.id}) - Gagnant: ${buyerId}`)

            // Update object status
            await payload.update({
              collection: 'objects',
              id: object.id,
              data: {
                status: 'sold',
                soldAt: now.toISOString(),
              },
            })

            // TODO: Send email notifications
            // - Email to winner (auctionWonTemplate)
            // - Email to other bidders (auctionLostTemplate)
          }
        }

        processedCount++
      } catch (error) {
        console.error(`Erreur lors du traitement de l'objet ${object.id}:`, error)
        // Continue processing other auctions even if one fails
      }
    }

    const summary = {
      success: true,
      timestamp: now.toISOString(),
      processed: processedCount,
      expiredNoBids: expiredNoBidsCount,
      transactionsCreated: transactionsCreatedCount,
      transactionsExisting: transactionsExistingCount,
      totalFound: expiredAuctions.totalDocs,
    }

    console.log('📊 Cron finalize-auctions terminé:', summary)

    return NextResponse.json(summary, { status: 200 })
  } catch (error) {
    console.error('Erreur cron finalize-auctions:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
