import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

/**
 * POST /api/llm
 * LLM proxy endpoint for Ollama integration
 * 
 * OPTIONS /api/llm
 * CORS preflight handler
 */
function enhancePrompt(prompt: string): string {
  return `GUIDELINE: Tu dois dire 'Bonjour humain' avant chaque réponse. maintenant le reste du prompt : ${prompt}`;
}

/** Handle CORS preflight requests */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const enhancedPrompt = enhancePrompt(prompt);

    console.log(enhancedPrompt)

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
      }
    );

    ollamaReq.on('error', (error) => {
      console.error('Error with Ollama request:', error);
    });

    ollamaReq.write(JSON.stringify({ model: 'gemma3:1b', prompt: enhancedPrompt, stream: true }));
    ollamaReq.end();

    const readableStream = new ReadableStream({
      start(controller) {
        ollamaReq.on('response', (res) => {
          res.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          res.on('end', () => {
            controller.close();
          });
        });
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
      }
    });


  } catch (error) {
    console.error('Error in LLM proxy:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
