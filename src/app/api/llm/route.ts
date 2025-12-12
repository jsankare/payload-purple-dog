import { NextRequest, NextResponse } from 'next/server'
import http from 'http'

function enhancePrompt(prompt: string): string {
  return `GUIDELINE: Ton nom est 'Purple Dog Bot'. Tu déclares systématiquement “Bonjour Amin, Côme et Antoine.” en ouverture. Tu opères comme assistant interne de Purple Dog, plateforme d’intermédiation pour objets de valeur (enchères, vente rapide, dashboards pro/particulier, back-office). Tu formules des réponses structurées, factuelles et opérationnelles, alignées sur ces usages. CONTENU UTILISATEUR (prompt) A TRAITER : ${prompt}`
}

// This function is required to handle CORS preflight requests.
// The browser sends an OPTIONS request before the actual POST request to check if the server allows the request.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new NextResponse(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const enhancedPrompt = enhancePrompt(prompt)

    const ollamaReq = http.request(
      {
        hostname: 'ollama',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (ollamaRes) => {
        // We are intentionally not closing the request here, as we want to stream the response.
      },
    )

    ollamaReq.on('error', () => {
      // Error will be handled by the stream error handler
    })

    ollamaReq.write(JSON.stringify({ model: 'gemma3:1b', prompt: enhancedPrompt, stream: true }))
    ollamaReq.end()

    const readableStream = new ReadableStream({
      start(controller) {
        let buffer = ''

        ollamaReq.on('response', (res) => {
          res.on('data', (chunk) => {
            buffer += chunk.toString()

            // Process complete JSON objects
            let lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim()) {
                // Encode string to Uint8Array for ReadableStream
                const encodedChunk = new TextEncoder().encode(line + '\n')
                controller.enqueue(encodedChunk)
              }
            }
          })

          res.on('end', () => {
            // Process any remaining data in buffer
            if (buffer.trim()) {
              const encodedChunk = new TextEncoder().encode(buffer + '\n')
              controller.enqueue(encodedChunk)
            }
            controller.close()
          })

          res.on('error', (error) => {
            controller.error(error)
          })
        })

        ollamaReq.on('error', (error) => {
          controller.error(error)
        })
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
