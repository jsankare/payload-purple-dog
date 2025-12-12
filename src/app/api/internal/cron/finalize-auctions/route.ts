import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * POST /api/internal/cron/finalize-auctions
 * Cron job to finalize expired auctions (protected by CRON_SECRET)
 * 
 * Process:
 * 1. Find expired auctions (auctionEndDate < now, status = active)
 * 2. For each: if no bids mark expired, if has winning bid create transaction
 */
export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')

    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await getPayload({ config: configPromise })
    const now = new Date()

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
      limit: 100,
    })

    let processedCount = 0
    let expiredNoBidsCount = 0
    let transactionsCreatedCount = 0
    let transactionsExistingCount = 0

    for (const object of expiredAuctions.docs) {
      try {
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
          await payload.update({
            collection: 'objects',
            id: object.id,
            data: {
              status: 'expired',
            },
          })

          expiredNoBidsCount++
          console.log(`Auction expired with no bids: ${object.name} (${object.id})`)
        } else {
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
            transactionsExistingCount++
            console.log(`Transaction already exists for ${object.name} (${object.id})`)
          } else {
            const buyerId = typeof winningBid.bidder === 'string'
              ? winningBid.bidder
              : typeof winningBid.bidder === 'number'
                ? winningBid.bidder
                : typeof winningBid.bidder === 'object'
                  ? winningBid.bidder?.id
                  : null

            const sellerId = typeof object.seller === 'string'
              ? object.seller
              : typeof object.seller === 'number'
                ? object.seller
                : typeof object.seller === 'object'
                  ? object.seller?.id
                  : null

            const settings = await payload.findGlobal({ slug: 'settings' })
            const buyerCommissionRate = settings.globalBuyerCommission || 3
            const sellerCommissionRate = settings.globalSellerCommission || 2

            const finalPrice = winningBid.amount
            const buyerCommission = Math.round(finalPrice * (buyerCommissionRate / 100))
            const sellerCommission = Math.round(finalPrice * (sellerCommissionRate / 100))
            const shippingCost = 0
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
            console.log(`Transaction created for ${object.name} (${object.id}) - Winner: ${buyerId}`)

            await payload.update({
              collection: 'objects',
              id: object.id,
              data: {
                status: 'sold',
                soldAt: now.toISOString(),
              },
            })

            /** Send email notifications to winner and losers */
            try {
              const { auctionWonTemplate, auctionLostTemplate, sendEmail } = await import('@/lib/email/templates')
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

              const winner = await payload.findByID({
                collection: 'users',
                id: buyerId,
              })

              const winnerHtml = auctionWonTemplate({
                objectName: object.name,
                objectUrl: `${appUrl}/objets/${object.id}`,
                finalPrice: winningBid.amount,
                userName: winner.firstName,
                checkoutUrl: `${appUrl}/checkout/${transaction.id}`,
              })
              await sendEmail(winner.email, 'Félicitations ! Vous avez remporté l\'enchère', winnerHtml)

              const allBids = await payload.find({
                collection: 'bids',
                where: {
                  object: { equals: object.id },
                  id: { not_equals: winningBid.id },
                },
              })

              const loserEmails = new Set<string>()
              for (const bid of allBids.docs) {
                const bidderId = typeof bid.bidder === 'string'
                  ? bid.bidder
                  : typeof bid.bidder === 'number'
                    ? bid.bidder
                    : typeof bid.bidder === 'object'
                      ? bid.bidder?.id
                      : null
                if (bidderId && bidderId !== buyerId) {
                  const bidder = await payload.findByID({
                    collection: 'users',
                    id: bidderId,
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
            }
          }
        }

        processedCount++
      } catch (error) {
        console.error(`Error processing object ${object.id}:`, error)
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

    console.log('Cron finalize-auctions completed:', summary)

    return NextResponse.json(summary, { status: 200 })
  } catch (error) {
    console.error('Error in cron finalize-auctions:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
