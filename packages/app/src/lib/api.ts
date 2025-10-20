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
  const response = await fetch(`${API_BASE}/designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate design: ${response.statusText}`);
  }

  return response.json();
}

export async function getConceptStatus(designId: string): Promise<ConceptResponse> {
  const response = await fetch(`${API_BASE}/concepts/${designId}`);

  if (!response.ok) {
    throw new Error(`Failed to get concept status: ${response.statusText}`);
  }

  return response.json();
}

export async function getUserConcepts(userId: string): Promise<ConceptResponse[]> {
  const response = await fetch(`${API_BASE}/concepts?userId=${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to get user concepts: ${response.statusText}`);
  }

  return response.json();
}
