'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de vérification manquant')
      return
    }

    // Appeler l'API de vérification
    fetch(`/api/users/verify/${token}`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message || data.doc) {
          setStatus('success')
          setMessage('Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.')
        } else {
          setStatus('error')
          setMessage(data.errors?.[0]?.message || 'Erreur lors de la vérification')
        }
      })
      .catch((error) => {
        setStatus('error')
        setMessage('Erreur lors de la vérification : ' + error.message)
      })
  }, [token])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>
              Vérification en cours...
            </h1>
            <p style={{ color: '#666' }}>Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span style={{ fontSize: '48px', color: 'white' }}>✓</span>
            </div>
            <h1 style={{ fontSize: '28px', marginBottom: '15px', color: '#4CAF50' }}>
              Email vérifié !
            </h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
            <a
              href="/admin/login"
              style={{
                display: 'inline-block',
                background: '#667eea',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Se connecter
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span style={{ fontSize: '48px', color: 'white' }}>✕</span>
            </div>
            <h1 style={{ fontSize: '28px', marginBottom: '15px', color: '#f44336' }}>
              Erreur de vérification
            </h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
            <a
              href="/admin/login"
              style={{
                display: 'inline-block',
                background: '#667eea',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Retour à la connexion
            </a>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
