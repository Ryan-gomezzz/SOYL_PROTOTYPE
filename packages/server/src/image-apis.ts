// Image Generation API configurations and implementations

export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  style?: string;
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  imageBuffer?: Buffer;
  error?: string;
}

// Option 1: Gemini Image Generation (Imagen 4) - Using deployed Python Lambda
export async function generateWithGemini(
  prompt: string, 
  apiKey: string,
  options: { width?: number; height?: number } = {}
): Promise<ImageGenerationResponse> {
  try {
    // Import AWS SDK for Lambda invocation
    const { LambdaClient, InvokeCommand } = await import('@aws-sdk/client-lambda');
    
    const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'ap-south-1' });
    
    // Prepare the payload for the Python Lambda
    const payload = {
      httpMethod: 'POST',
      path: '/api/generate-cloth-design',
      body: JSON.stringify({
        prompt: prompt,
        style: 'modern',
        colors: 'vibrant',
        pattern_type: 'seamless',
        fabric_type: 'cotton'
      })
    };

    const command = new InvokeCommand({
      FunctionName: 'cloth-design-api',
      Payload: JSON.stringify(payload)
    });

    const response = await lambdaClient.send(command);
    
    if (!response.Payload) {
      return { success: false, error: 'No response from Python Lambda' };
    }

    const result = JSON.parse(Buffer.from(response.Payload).toString());
    
    if (result.statusCode !== 200) {
      return { success: false, error: `Python Lambda error: ${result.statusCode}` };
    }

    const data = JSON.parse(result.body);
    
    if (!data.success || !data.image_base64) {
      return { success: false, error: 'No image data received from Python Lambda' };
    }

    const imageBuffer = Buffer.from(data.image_base64, 'base64');
    return { success: true, imageBuffer };
  } catch (error) {
    console.error('Python Lambda error:', error);
    return { success: false, error: `Python Lambda error: ${error}` };
  }
}

// Option 2: OpenAI DALL-E 3
export async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  options: { width?: number; height?: number; quality?: 'standard' | 'hd' } = {}
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: options.width && options.height ? 
          `${options.width}x${options.height}` : '1024x1024',
        quality: options.quality || 'standard',
        style: 'vivid'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `OpenAI API error: ${response.status} - ${error}` };
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      return { success: false, error: 'No image URL received from OpenAI' };
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return { success: false, error: 'Failed to download generated image' };
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    return { success: true, imageBuffer };
  } catch (error) {
    return { success: false, error: `OpenAI API error: ${error}` };
  }
}

// Option 3: Stability AI (SDXL)
export async function generateWithStability(
  prompt: string,
  apiKey: string,
  options: { width?: number; height?: number } = {}
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: options.height || 1024,
        width: options.width || 1024,
        samples: 1,
        steps: 30,
        style_preset: 'photographic'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Stability AI error: ${response.status} - ${error}` };
    }

    const data = await response.json();
    const imageData = data.artifacts?.[0]?.base64;
    
    if (!imageData) {
      return { success: false, error: 'No image data received from Stability AI' };
    }

    const imageBuffer = Buffer.from(imageData, 'base64');
    return { success: true, imageBuffer };
  } catch (error) {
    return { success: false, error: `Stability AI error: ${error}` };
  }
}

// Option 4: Replicate (Various Models)
export async function generateWithReplicate(
  prompt: string,
  apiKey: string,
  model: string = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  options: { width?: number; height?: number } = {}
): Promise<ImageGenerationResponse> {
  try {
    // Start prediction
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model.split(':')[1],
        input: {
          prompt: prompt,
          width: options.width || 1024,
          height: options.height || 1024,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 20,
          guidance_scale: 7.5,
          prompt_strength: 0.8
        }
      })
    });

    if (!startResponse.ok) {
      const error = await startResponse.text();
      return { success: false, error: `Replicate API error: ${startResponse.status} - ${error}` };
    }

    const prediction = await startResponse.json();
    const predictionId = prediction.id;

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        }
      });

      if (!statusResponse.ok) {
        return { success: false, error: 'Failed to check prediction status' };
      }

      const status = await statusResponse.json();

      if (status.status === 'succeeded') {
        const imageUrl = status.output?.[0];
        if (!imageUrl) {
          return { success: false, error: 'No image URL in prediction output' };
        }

        // Download the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          return { success: false, error: 'Failed to download generated image' };
        }

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        return { success: true, imageBuffer };
      } else if (status.status === 'failed') {
        return { success: false, error: `Prediction failed: ${status.error}` };
      }

      attempts++;
    }

    return { success: false, error: 'Prediction timed out' };
  } catch (error) {
    return { success: false, error: `Replicate API error: ${error}` };
  }
}

// Fallback: Generate placeholder with design info
export async function generatePlaceholder(
  prompt: string,
  designId: string
): Promise<ImageGenerationResponse> {
  try {
    // Create a simple PNG placeholder without external dependencies
    const width = 1200;
    const height = 1400;
    
    // Create a simple PNG buffer (black background with white text area)
    const pngData = createSimplePNG(width, height, `SOYL Design ${designId.slice(0,8)}`);
    return { success: true, imageBuffer: pngData };
  } catch (error) {
    return { success: false, error: `Placeholder generation error: ${error}` };
  }
}

// Simple PNG creation function
function createSimplePNG(width: number, height: number, text: string): Buffer {
  // Create a minimal PNG with black background and white text area
  const data = Buffer.alloc(width * height * 3); // RGB data
  
  // Fill with black background
  for (let i = 0; i < data.length; i += 3) {
    data[i] = 0;     // R
    data[i + 1] = 0; // G  
    data[i + 2] = 0; // B
  }
  
  // Add white text area (simplified - just a white rectangle)
  const textStartX = Math.floor(width * 0.2);
  const textEndX = Math.floor(width * 0.8);
  const textStartY = Math.floor(height * 0.4);
  const textEndY = Math.floor(height * 0.6);
  
  for (let y = textStartY; y < textEndY; y++) {
    for (let x = textStartX; x < textEndX; x++) {
      const index = (y * width + x) * 3;
      data[index] = 255;     // R
      data[index + 1] = 255; // G
      data[index + 2] = 255; // B
    }
  }
  
  // For now, return the raw RGB data
  // In a real implementation, you'd use a proper PNG encoder
  return data;
}
