const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';

export interface DesignRequest {
  brief: string;
  userId?: string;
  options?: {
    product?: string;
    canvas?: { w: number; h: number };
    style?: string;
    retrieval?: boolean;
  };
}

export interface ConceptResponse {
  designId: string;
  design?: any;
  previewUrl?: string;
  ready?: boolean;
}

export async function generateDesign(request: DesignRequest): Promise<ConceptResponse> {
  console.log('API_BASE:', API_BASE);
  console.log('Making request to:', `${API_BASE}/designs`);
  
  const response = await fetch(`${API_BASE}/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Failed to generate design: ${response.statusText}`);
  }

  return response.json();
}

export async function getConceptStatus(designId: string): Promise<ConceptResponse> {
  console.log('Getting concept status for:', designId);
  console.log('Making request to:', `${API_BASE}/concepts/${designId}`);
  
  const response = await fetch(`${API_BASE}/concepts/${designId}`);

  console.log('Status response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Status error response:', errorText);
    throw new Error(`Failed to get concept status: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Status response data:', data);
  return data;
}

export async function getUserConcepts(userId: string): Promise<ConceptResponse[]> {
  const response = await fetch(`${API_BASE}/concepts?userId=${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to get user concepts: ${response.statusText}`);
  }

  return response.json();
}
