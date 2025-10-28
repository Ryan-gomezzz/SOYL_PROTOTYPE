import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface ChatbotResponse {
  sessionId: string;
  startedAt: string;
  answers: Array<{
    questionId: string;
    answerKey: string;
    answerLabel: string;
  }>;
  summary: string;
  email?: string;
  source: string;
  utm?: string;
  visitorId: string;
}

export async function chatbotResponsesHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Chatbot responses handler called');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Validate required fields
    const requiredFields = ['sessionId', 'startedAt', 'answers', 'summary', 'source', 'visitorId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: `Missing required field: ${field}` }),
        };
      }
    }

    // Store the chatbot response
    const responseData: ChatbotResponse = {
      sessionId: body.sessionId,
      startedAt: body.startedAt,
      answers: body.answers,
      summary: body.summary,
      email: body.email,
      source: body.source,
      utm: body.utm,
      visitorId: body.visitorId,
    };

    // In a real implementation, you would store this in DynamoDB or another database
    // For now, we'll just log it and return success
    console.log('Chatbot response received:', JSON.stringify(responseData, null, 2));

    // TODO: Store in DynamoDB
    // await storeChatbotResponse(responseData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Chatbot response saved successfully',
        sessionId: responseData.sessionId 
      }),
    };

  } catch (error) {
    console.error('Error processing chatbot response:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

// Optional: Function to store in DynamoDB (commented out for now)
/*
async function storeChatbotResponse(data: ChatbotResponse): Promise<void> {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const tableName = process.env.CHATBOT_TABLE || 'SOYL-ChatbotResponses';
  
  const params = {
    TableName: tableName,
    Item: {
      sessionId: data.sessionId,
      timestamp: new Date().toISOString(),
      ...data,
    },
  };
  
  await dynamodb.put(params).promise();
}
*/
