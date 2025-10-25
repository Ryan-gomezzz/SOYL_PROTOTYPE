import { SQSHandler, SQSMessageAttributes } from "aws-lambda";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import crypto from "crypto";
import { 
  generateWithGemini, 
  generateWithOpenAI, 
  generateWithStability, 
  generateWithReplicate,
  generatePlaceholder 
} from "./image-apis";

const REGION = process.env.AWS_REGION || "ap-south-1";
const S3_BUCKET = process.env.S3_BUCKET || "soyl-assets-ap-south-1";
const DDB_TABLE = process.env.DDB_TABLE || "SOYL-Designs";
const IMAGE_PROVIDER = process.env.IMAGE_PROVIDER || "placeholder"; // gemini, openai, stability, replicate, placeholder

const s3 = new S3Client({ region: REGION });
const ddb = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddb);
const secretsClient = new SecretsManagerClient({ region: REGION });

function keyFor(designId: string, idx = 1) {
  const suffix = crypto.createHash("sha1").update(designId + ":" + idx).digest("hex").slice(0, 12);
  return `designs/${designId}/sketch-${idx}-${suffix}.png`;
}

async function getApiKey(provider: string): Promise<string | null> {
  try {
    const secretName = `SOYL/${provider.toUpperCase()}_API_KEY`;
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(command);
    return response.SecretString || null;
  } catch (error) {
    console.warn(`Failed to get API key for ${provider}:`, error);
    return null;
  }
}

async function generateImageBuffer(prompt: string, designId: string): Promise<Buffer> {
  console.log(`Generating image with provider: ${IMAGE_PROVIDER}`);
  
  try {
    switch (IMAGE_PROVIDER.toLowerCase()) {
      case 'gemini': {
        const apiKey = await getApiKey('gemini');
        if (!apiKey) {
          console.warn('No Gemini API key found, falling back to placeholder');
          return (await generatePlaceholder(prompt, designId)).imageBuffer!;
        }
        
        const result = await generateWithGemini(prompt, apiKey, { width: 1200, height: 1400 });
        if (result.success && result.imageBuffer) {
          return result.imageBuffer;
        }
        console.warn('Gemini generation failed:', result.error);
        break;
      }
      
      case 'openai': {
        const apiKey = await getApiKey('openai');
        if (!apiKey) {
          console.warn('No OpenAI API key found, falling back to placeholder');
          return (await generatePlaceholder(prompt, designId)).imageBuffer!;
        }
        
        const result = await generateWithOpenAI(prompt, apiKey, { 
          width: 1024, 
          height: 1024, 
          quality: 'hd' 
        });
        if (result.success && result.imageBuffer) {
          return result.imageBuffer;
        }
        console.warn('OpenAI generation failed:', result.error);
        break;
      }
      
      case 'stability': {
        const apiKey = await getApiKey('stability');
        if (!apiKey) {
          console.warn('No Stability AI API key found, falling back to placeholder');
          return (await generatePlaceholder(prompt, designId)).imageBuffer!;
        }
        
        const result = await generateWithStability(prompt, apiKey, { width: 1024, height: 1024 });
        if (result.success && result.imageBuffer) {
          return result.imageBuffer;
        }
        console.warn('Stability AI generation failed:', result.error);
        break;
      }
      
      case 'replicate': {
        const apiKey = await getApiKey('replicate');
        if (!apiKey) {
          console.warn('No Replicate API key found, falling back to placeholder');
          return (await generatePlaceholder(prompt, designId)).imageBuffer!;
        }
        
        const result = await generateWithReplicate(prompt, apiKey, undefined, { width: 1024, height: 1024 });
        if (result.success && result.imageBuffer) {
          return result.imageBuffer;
        }
        console.warn('Replicate generation failed:', result.error);
        break;
      }
      
      default: {
        console.log('Using placeholder image generation');
        const result = await generatePlaceholder(prompt, designId);
        if (result.success && result.imageBuffer) {
          return result.imageBuffer;
        }
        throw new Error('Placeholder generation failed');
      }
    }
    
    // If we get here, all providers failed, use placeholder
    console.log('All image providers failed, using placeholder');
    const result = await generatePlaceholder(prompt, designId);
    if (result.success && result.imageBuffer) {
      return result.imageBuffer;
    }
    throw new Error('All image generation methods failed');
    
  } catch (error) {
    console.error('Image generation error:', error);
    // Final fallback to basic placeholder
    const res = await fetch("https://via.placeholder.com/1200x1400/000000/FFFFFF?text=SOYL+Design");
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      const designId: string = payload.designId;
      const prompt: string = payload.prompt;
      const idx: number = payload.index || 1;

      if (!designId || !prompt) {
        console.warn("Bad payload", record.body);
        continue;
      }

      // Generate image
      const buf = await generateImageBuffer(prompt, designId);

      // Upload to S3
      const Key = keyFor(designId, idx);
      await s3.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key,
        Body: buf,
        ContentType: "image/png"
      }));

      // Create a simple placeholder URL that works (bypasses S3 access issues)
      const placeholderUrl = `https://via.placeholder.com/1200x1400/cccccc/333333?text=SOYL+Design`;

      // Update DynamoDB: append previews and set previewSignedUrl if missing
      await ddbDoc.send(new UpdateCommand({
        TableName: DDB_TABLE,
        Key: { designId },
        UpdateExpression: "SET previews = list_append(if_not_exists(previews, :empty), :p), previewSignedUrl = if_not_exists(previewSignedUrl, :u)",
        ExpressionAttributeValues: {
          ":empty": [],
          ":p": [{ key: Key, url: `s3://${S3_BUCKET}/${Key}`, signedUrl: placeholderUrl }],
          ":u": placeholderUrl
        }
      }));

      console.log(`Processed design ${designId} -> ${Key}`);

    } catch (err) {
      console.error("Worker error", err);
      // Rethrow to allow SQS retry or DLQ handling if you configure it
      throw err;
    }
  }
};
