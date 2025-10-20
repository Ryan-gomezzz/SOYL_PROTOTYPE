import { SQSHandler, SQSMessageAttributes } from "aws-lambda";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "ap-south-1";
const S3_BUCKET = process.env.S3_BUCKET || "soyl-assets-ap-south-1";
const DDB_TABLE = process.env.DDB_TABLE || "SOYL-Designs";
const IMAGE_API_ENDPOINT = process.env.IMAGE_API_ENDPOINT || "";
const IMAGE_API_KEY = process.env.IMAGE_API_KEY || "";

const s3 = new S3Client({ region: REGION });
const ddb = new DynamoDBClient({ region: REGION });
const ddbDoc = DynamoDBDocumentClient.from(ddb);

function keyFor(designId: string, idx = 1) {
  const suffix = crypto.createHash("sha1").update(designId + ":" + idx).digest("hex").slice(0, 12);
  return `designs/${designId}/sketch-${idx}-${suffix}.png`;
}

async function generateImageBuffer(prompt: string): Promise<Buffer> {
  // If no real image API, fall back to placeholder
  if (!IMAGE_API_ENDPOINT || !IMAGE_API_KEY) {
    const res = await fetch("https://via.placeholder.com/1200x1400.png?text=SOYL+Preview");
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }

  // Example: generic POST; adapt to your provider (Gemini Image / SDXL)
  const response = await fetch(IMAGE_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${IMAGE_API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      width: 1200,
      height: 1400,
      // provider-specific params (seed, steps, etc.)
    })
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Image API failed ${response.status}: ${txt}`);
  }
  const arrayBuf = await response.arrayBuffer();
  return Buffer.from(arrayBuf);
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
      const buf = await generateImageBuffer(prompt);

      // Upload to S3
      const Key = keyFor(designId, idx);
      await s3.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key,
        Body: buf,
        ContentType: "image/png"
      }));

      // Create signed GET URL (short-lived)
      const getCmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key });
      const signedUrl = await getSignedUrl(s3, getCmd, { expiresIn: 300 });

      // Update DynamoDB: append previews and set previewSignedUrl if missing
      await ddbDoc.send(new UpdateCommand({
        TableName: DDB_TABLE,
        Key: { designId },
        UpdateExpression: "SET previews = list_append(if_not_exists(previews, :empty), :p), previewSignedUrl = if_not_exists(previewSignedUrl, :u)",
        ExpressionAttributeValues: {
          ":empty": [],
          ":p": [{ key: Key, url: `s3://${S3_BUCKET}/${Key}`, signedUrl }],
          ":u": signedUrl
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
