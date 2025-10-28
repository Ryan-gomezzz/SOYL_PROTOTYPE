// src/aws-clients.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
export const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Create DynamoDB Document client
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
