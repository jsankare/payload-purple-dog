import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

/**
 * Email Templates for Purple Dog Platform
 * 
 * All templates return complete HTML emails with inline styles.
 */

/**
 * Template: User has been outbid on an auction
 */
export function auctionOutbidTemplate(data: {
  objectName: string
  objectUrl: string
  yourBid: number
  newBid: number
  userName: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #ff6b6b;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .price {
      font-size: 20px;
      font-weight: bold;
      color: #7c3aed;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Vous avez été surenchéri !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.userName},</p>
      <p>Quelqu'un vient de placer une enchère plus élevée que la vôtre sur <strong>${data.objectName}</strong>.</p>
      <p>
        Votre enchère : <span class="price">${data.yourBid}€</span><br>
        Nouvelle enchère : <span class="price">${data.newBid}€</span>
      </p>
      <p>Ne laissez pas passer cette opportunité ! Placez une nouvelle enchère pour rester en tête.</p>
      <div style="text-align: center;">
        <a href="${data.objectUrl}" class="button">Voir l'objet et enchérir</a>
      </div>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Template: User has won an auction
 */
export function auctionWonTemplate(data: {
  objectName: string
  objectUrl: string
  finalPrice: number
  userName: string
  checkoutUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #10b981;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Félicitations ! Vous avez remporté l'enchère</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.userName},</p>
      <p>Excellente nouvelle ! Vous avez remporté l'enchère pour <strong>${data.objectName}</strong>.</p>
      <p>
        Prix final : <span class="price">${data.finalPrice}€</span>
      </p>
      <p>Pour finaliser votre achat, veuillez procéder au paiement dans les 48 heures. Les fonds seront bloqués jusqu'à la confirmation de livraison.</p>
      <div style="text-align: center;">
        <a href="${data.checkoutUrl}" class="button">Procéder au paiement</a>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Vous pouvez également consulter les détails de l'objet : <a href="${data.objectUrl}">Voir l'objet</a>
      </p>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Template: User has lost an auction
 */
export function auctionLostTemplate(data: {
  objectName: string
  objectUrl: string
  userName: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #6b7280;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Enchère terminée</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.userName},</p>
      <p>L'enchère pour <strong>${data.objectName}</strong> est maintenant terminée.</p>
      <p>Malheureusement, vous n'avez pas remporté cette enchère. Mais ne vous inquiétez pas, de nombreux autres objets de valeur sont disponibles sur Purple Dog !</p>
      <div style="text-align: center;">
        <a href="${data.objectUrl}" class="button">Découvrir d'autres objets</a>
      </div>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Template: Seller has received a new offer
 */
export function newOfferTemplate(data: {
  objectName: string
  objectUrl: string
  offerAmount: number
  buyerName: string
  sellerName: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #3b82f6;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Nouvelle offre reçue !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.sellerName},</p>
      <p>Vous avez reçu une nouvelle offre pour <strong>${data.objectName}</strong>.</p>
      <p>
        Montant proposé : <span class="price">${data.offerAmount}€</span><br>
        Acheteur : ${data.buyerName}
      </p>
      <p>Vous pouvez accepter ou refuser cette offre depuis votre tableau de bord. L'offre expire automatiquement dans 7 jours si vous ne répondez pas.</p>
      <div style="text-align: center;">
        <a href="${data.objectUrl}" class="button">Voir l'offre et répondre</a>
      </div>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Template: Purchase confirmation for buyer
 */
export function purchaseConfirmationTemplate(data: {
  objectName: string
  objectUrl: string
  totalAmount: number
  buyerName: string
  checkoutUrl: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #7c3aed;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #7c3aed;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ Achat confirmé !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.buyerName},</p>
      <p>Votre achat de <strong>${data.objectName}</strong> a été confirmé avec succès.</p>
      <p>
        Montant total : <span class="price">${data.totalAmount.toFixed(2)}€</span>
      </p>
      <p>Pour finaliser votre achat, veuillez procéder au paiement dans les 48 heures. Les fonds seront bloqués jusqu'à la confirmation de livraison de l'objet.</p>
      <div style="text-align: center;">
        <a href="${data.checkoutUrl}" class="button">Procéder au paiement</a>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Vous pouvez également consulter les détails de l'objet : <a href="${data.objectUrl}">Voir l'objet</a>
      </p>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Template: Seller notification when object is sold
 */
export function sellerNotificationTemplate(data: {
  objectName: string
  objectUrl: string
  salePrice: number
  sellerName: string
  buyerName: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #10b981;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #10b981;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Votre objet a été vendu !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.sellerName},</p>
      <p>Excellente nouvelle ! Votre objet <strong>${data.objectName}</strong> a été acheté.</p>
      <p>
        Prix de vente : <span class="price">${data.salePrice.toFixed(2)}€</span><br>
        Acheteur : ${data.buyerName}
      </p>
      <p>L'acheteur va procéder au paiement dans les prochaines heures. Une fois le paiement confirmé, vous recevrez les instructions pour l'expédition de l'objet.</p>
      <p><strong>Important :</strong> Les fonds seront bloqués par la plateforme jusqu'à la confirmation de livraison par l'acheteur. Vous recevrez le paiement entre 3 et 5 jours ouvrés après la confirmation.</p>
      <div style="text-align: center;">
        <a href="${data.objectUrl}" class="button">Voir les détails</a>
      </div>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Template: Seller receives notification of new bid
 */
export function newBidTemplate(data: {
  objectName: string
  objectUrl: string
  bidAmount: number
  bidderName: string
  sellerName: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: #3b82f6;
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nouvelle enchère sur votre objet !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${data.sellerName},</p>
      <p>Bonne nouvelle ! Une nouvelle enchère vient d'être placée sur <strong>${data.objectName}</strong>.</p>
      <p>
        Montant de l'enchère : <span class="price">${data.bidAmount.toFixed(2)}€</span><br>
        Enchérisseur : ${data.bidderName}
      </p>
      <p>Vous pouvez suivre l'évolution des enchères sur votre tableau de bord.</p>
      <div style="text-align: center;">
        <a href="${data.objectUrl}" class="button">Voir l'objet et les enchères</a>
      </div>
    </div>
    <div class="footer">
      Purple Dog - Plateforme de vente d'objets de valeur
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Send email using Resend
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await resend.emails.send({
      from: `${process.env.RESEND_DEFAULT_NAME || 'Purple Dog'} <${process.env.RESEND_DEFAULT_EMAIL || 'noreply@purpledog.com'}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw error
  }
}
