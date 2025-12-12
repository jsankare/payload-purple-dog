'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#4B2377] mb-4">
            Documentation API - Payload Purple Dog
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            API d'authentification pour une plateforme de vente et enchères de produits de valeur.
            <br />
            Supporte deux types d'utilisateurs : <strong>Particuliers</strong> et <strong>Professionnels</strong>.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SwaggerUI url="/api/swagger" />
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            🔗 <a href="/" className="text-[#4B2377] hover:underline">Retour à l'accueil</a>
            {' | '}
            <a href="https://github.com/jsankare/payload-purple-dog" className="text-[#4B2377] hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
