import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const REGION = process.env.AWS_REGION || 'us-east-1';
const SECRETS_NAME_GEMINI = 'SOYL/GEMINI_API_KEY';
const SECRETS_NAME_OPENAI = 'SOYL/OPENAI_API_KEY';
const PERPLEXITY_KEY_ENV = 'PERPLEXITY_API_KEY';
const DDB_TABLE = process.env.DDB_TABLE || 'SOYL-Designs';
const S3_BUCKET = process.env.S3_BUCKET || 'soyl-assets';
const PREVIEW_TTL_SECONDS = 300; // signed URL expiry

// AWS clients
const secretsClient = new SecretsManagerClient({ region: REGION });
const s3 = new S3Client({ region: REGION });
const ddb = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddb);

// Types
type BriefReq = {
  brief: string;
  userId?: string;
  options?: {
    product?: string;
    canvas?: { w: number; h: number };
    style?: string;
    retrieval?: boolean;
  };
};

type Placement = {
  area: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content: Record<string, any>;
};

type Design = {
  title: string;
  placements: Placement[];
  palette: string[];
  fonts?: { name: string; size_pt?: number; weight?: string }[];
  production_notes?: string;
};

// helpers
async function getSecret(secretName: string): Promise<string | null> {
  try {
    const cmd = new GetSecretValueCommand({ SecretId: secretName });
    const res = await secretsClient.send(cmd);
    if (res.SecretString) return res.SecretString;
    return null;
  } catch (err) {
    console.warn(`Secret ${secretName} not available: ${(err as any).message}`);
    return null;
  }
}

function sanitizeBrief(s: string) {
  if (!s) return '';
  // limit length and strip control chars
  let safe = s.replace(/[\x00-\x1F\x7F]/g, ' ');
  if (safe.length > 2000) safe = safe.slice(0, 2000);
  return safe.trim();
}

function promptHash(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Mock preview generator -> returns a small PNG buffer (placeholder)
async function mockGeneratePreviewBuffer(design: Design): Promise<Buffer> {
  // For MVP, return a remote placeholder image buffer via fetch
  // Node 18+ has global fetch. We'll fetch a small placeholder and return its buffer.
  try {
    const res = await fetch('https://via.placeholder.com/1200x1400.png?text=SOYL+Preview');
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err) {
    // fallback: return an empty PNG (1x1)
    return Buffer.from(
      Uint8Array.from([
        0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
        0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x06,0x00,0x00,0x00,0x1f,0x15,0xc4,
        0x89,0x00,0x00,0x00,0x0a,0x49,0x44,0x41,0x54,0x78,0x9c,0x63,0x00,0x01,0x00,0x00,
        0x05,0x00,0x01,0x0d,0x0a,0x2d,0xb4,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,0x44,0xae,
        0x42,0x60,0x82
      ])
    );
  }
}

async function uploadPreview(designId: string, buffer: Buffer) {
  const key = `designs/${designId}/preview.png`;
  const cmd = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    ACL: 'private'
  });
  await s3.send(cmd);
  // generate presigned URL (simple approach using getSignedUrl from @aws-sdk/s3-request-presigner if available)
  // to avoid adding additional dependency in this code block, we'll return a non-signed S3 URL
  // NOTE: In production use GetObjectCommand + getSignedUrl from '@aws-sdk/s3-request-presigner'
  return { key, url: `s3://${S3_BUCKET}/${key}` };
}

// Call to Gemini or OpenAI endpoint
async function callLLM(apiKey: string, prompt: string, model = 'gemini') {
  if (model === 'gemini') {
    // Use Gemini API endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [{
        parts: [{
          text: `You are a JSON-only design generator. Output only JSON.\n\n${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200
      }
    };
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Gemini error ${res.status}: ${txt}`);
    }
    
    const data = await res.json();
    return {
      choices: [{
        message: {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        }
      }]
    };
  } else {
    // Use OpenAI API endpoint
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const body = {
      model: 'gpt-4o',
      messages: [{ role: 'system', content: 'You are a JSON-only design generator. Output only JSON.' }, { role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.7
    };
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${txt}`);
    }
    
    return res.json();
  }
}

// Perplexity quick retrieval call (mocked minimal)
async function callPerplexity(apiKey: string, query: string) {
  // Perplexity API shapes vary. For MVP we do a simple fetch to a mock endpoint if key present.
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.perplexity.ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, limit: 3 })
    });
    if (!res.ok) return [];
    const j = await res.json();
    // Normalize: expect j.results -> array of { text, source }
    if (Array.isArray(j.results)) {
      return j.results.slice(0, 3).map((r: any) => ({ text: r.text || r.snippet || '', source: r.source || '' }));
    }
    return [];
  } catch (err) {
    console.warn('Perplexity call failed', (err as any).message);
    return [];
  }
}

// Validate LLM returned JSON - defensive
function safeParseDesign(text: string): Design | null {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.placements)) return null;
    // Minimal structural validation
    return {
      title: String(parsed.title || 'Untitled'),
      placements: parsed.placements.map((p: any) => ({
        area: String(p.area || 'front'),
        type: p.type || 'text',
        x: Number(p.x || 0),
        y: Number(p.y || 0),
        width: Number(p.width || 400),
        height: Number(p.height || 400),
        content: p.content || {}
      })),
      palette: Array.isArray(parsed.palette) ? parsed.palette.map(String) : ['#D4AF37', '#0b0b0b', '#ffffff'],
      fonts: parsed.fonts || [],
      production_notes: parsed.production_notes || ''
    };
  } catch (err) {
    return null;
  }
}

// Handler
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Incoming event', { path: event.path, httpMethod: event.httpMethod });

  // Handle GET /concepts/:id for status polling
  if (event.httpMethod === 'GET' && event.pathParameters?.id) {
    const designId = event.pathParameters.id;
    try {
      const result = await ddbDoc.send(new GetCommand({
        TableName: DDB_TABLE,
        Key: { designId }
      }));
      
      if (!result.Item) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Design not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          ready: true,
          design: result.Item.design,
          previewUrl: result.Item.previewUrl || ''
        })
      };
    } catch (err) {
      console.error('Error fetching design:', err);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    return { 
      statusCode: 200, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ msg: 'designs lambda healthy' }) 
    };
  }

  if (!event.body) {
    return { 
      statusCode: 400, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'missing body' }) 
    };
  }

  let req: BriefReq;
  try {
    req = JSON.parse(event.body) as BriefReq;
  } catch (err) {
    return { 
      statusCode: 400, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'invalid json body' }) 
    };
  }

  const brief = sanitizeBrief(req.brief || '');
  if (!brief) return { 
    statusCode: 400, 
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'brief required' }) 
  };

  // Fetch LLM key (Gemini preferred, fallback to OpenAI)
  const geminiSecret = await getSecret(SECRETS_NAME_GEMINI);
  const openaiSecret = await getSecret(SECRETS_NAME_OPENAI);
  const llmKey = geminiSecret || openaiSecret;
  if (!llmKey) {
    console.warn('No LLM key present');
    // Allow development/mock flow
  }

  // Optional retrieval context
  let retrievalContext = '';
  if (req.options?.retrieval) {
    const pKey = process.env[PERPLEXITY_KEY_ENV] || null;
    const facts = await callPerplexity(pKey || '', brief);
    if (facts.length) retrievalContext = facts.map((f: any) => `Fact: ${f.text} (source: ${f.source})`).join('\n');
  }

  // Build prompt
  const systemPrompt = `
You are SOYL's AI Designer. OUTPUT MUST BE A JSON OBJECT with keys:
"title", "placements" (array), "palette" (array of #HEX), "fonts" (optional), "production_notes" (string).
Each placement object: { area:"front|back|sleeve", type:"text|image|shape", x, y, width, height, content:{...} }.
Do NOT include explanatory text outside JSON. If you cannot produce a design, return {"error":"explain reason"}.
  `.trim();

  let userPrompt = `Brief: ${brief}\nProduct: ${req.options?.product || 't-shirt'}\nCanvas: ${JSON.stringify(req.options?.canvas || { w: 4500, h: 5400 })}\nStyle: ${req.options?.style || 'classic vintage'}\n`;
  if (retrievalContext) userPrompt += `\nContext:\n${retrievalContext}\n`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const promptSig = promptHash(fullPrompt);

  // Try LLM (up to 2 retries)
  let llmResponseText: string | null = null;
  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      // Use mock response for testing
      llmResponseText = JSON.stringify({
        title: `${req.options?.product || 'Luxury'} Design - ${req.options?.style || 'Modern Royal'}`,
        placements: [
          { area: 'front', type: 'text', x: 120, y: 200, width: 360, height: 120, content: { text: 'SOYL — Story Of Your Life' } },
          { area: 'front', type: 'text', x: 120, y: 350, width: 360, height: 80, content: { text: brief.substring(0, 50) + '...' } }
        ],
        palette: ['#D4AF37', '#000000', '#FFFFFF', '#C0C0C0'],
        production_notes: `Generated for ${req.options?.product || 'luxury item'} in ${req.options?.style || 'modern royal'} style`
      });
    } catch (err) {
      console.warn('LLM call failed attempt', attempt, (err as any).message);
      if (attempt >= 2) {
        return { 
          statusCode: 502, 
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'LLM provider error' }) 
        };
      } else {
        // adjust prompt slightly (make stricter)
        userPrompt += '\nReturn only JSON with no leading/trailing text. Strict JSON.';
      }
    }

    if (llmResponseText) {
      const parsed = safeParseDesign(llmResponseText);
      if (parsed) {
        // Good result
        const designId = crypto.randomUUID();
        // store to DynamoDB
        try {
          await ddbDoc.send(
            new PutCommand({
              TableName: DDB_TABLE,
              Item: {
                designId,
                userId: req.userId || 'anon',
                createdAt: new Date().toISOString(),
                promptHash: promptSig,
                llmModel: geminiSecret ? 'gemini' : openaiSecret ? 'openai' : 'mock',
                design: parsed
              }
            })
          );
        } catch (err) {
          console.error('DynamoDB put failed', (err as any).message);
        }

        // upload mock preview
        let previewUrl = '';
        try {
          const buf = await mockGeneratePreviewBuffer(parsed);
          const up = await uploadPreview(designId, buf);
          // use S3 key URL placeholder
          previewUrl = up.url;
        } catch (err) {
          console.warn('Preview upload failed', (err as any).message);
        }

        const responseBody = { designId, design: parsed, previewUrl };
        return { 
          statusCode: 200, 
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(responseBody) 
        };
      } else {
        // parse fail - retry
        console.warn('LLM returned invalid JSON, retrying...');
        if (attempt >= 2) {
          return { 
            statusCode: 502, 
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'LLM returned invalid JSON' }) 
          };
        }
      }
    }
  }

  return { 
    statusCode: 500, 
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: 'unexpected' }) 
  };
};

export default handler;

/*
ENV & Secrets:
- AWS_REGION (optional)
- DDB_TABLE (default: SOYL-Designs)
- S3_BUCKET (default: soyl-assets)
- LLM_ENDPOINT (optional - default uses OpenAI chat completions style endpoint)
Secrets in AWS Secrets Manager:
- SOYL/GEMINI_API_KEY  (preferred)
- SOYL/OPENAI_API_KEY  (fallback)
Environment variable:
- PERPLEXITY_API_KEY

Local testing:
- You can run this handler locally by wrapping it in an Express endpoint that forwards a POST body as event.body (see local-run helper).
*/
