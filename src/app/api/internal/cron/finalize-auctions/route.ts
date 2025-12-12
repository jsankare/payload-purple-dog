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

            // Send email notifications
            try {
              const { auctionWonTemplate, auctionLostTemplate, sendEmail } = await import('@/lib/email/templates')
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

              // Get winner details
              const winner = await payload.findByID({
                collection: 'users',
                id: buyerId as string,
              })

              // Email to winner
              const winnerHtml = auctionWonTemplate({
                objectName: object.name,
                objectUrl: `${appUrl}/objets/${object.id}`,
                finalPrice: winningBid.amount,
                userName: winner.firstName,
                checkoutUrl: `${appUrl}/checkout/${transaction.id}`,
              })
              await sendEmail(winner.email, 'Félicitations ! Vous avez remporté l\'enchère', winnerHtml)

              // Email to other bidders (losers)
              const allBids = await payload.find({
                collection: 'bids',
                where: {
                  object: { equals: object.id },
                  id: { not_equals: winningBid.id },
                },
              })

              const loserEmails = new Set<string>()
              for (const bid of allBids.docs) {
                const bidderId = typeof bid.bidder === 'string' ? bid.bidder : bid.bidder?.id
                if (bidderId && bidderId !== buyerId) {
                  const bidder = await payload.findByID({
                    collection: 'users',
                    id: bidderId as string,
                  })
                  loserEmails.add(bidder.email)
                }
              }

              for (const email of loserEmails) {
                const bidder = await payload.find({
                  collection: 'users',
                  where: { email: { equals: email } },
                  limit: 1,
                })
                if (bidder.docs[0]) {
                  const loserHtml = auctionLostTemplate({
                    objectName: object.name,
                    objectUrl: `${appUrl}/objets`,
                    userName: bidder.docs[0].firstName,
                  })
                  await sendEmail(email, 'Enchère terminée', loserHtml)
                }
              }
            } catch (emailError) {
              console.error('Error sending auction emails:', emailError)
              // Don't fail the cron if email fails
            }
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
