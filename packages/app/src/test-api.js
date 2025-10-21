// Simple API test script
const API_BASE = 'https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod';

async function testAPI() {
  console.log('Testing API connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.text();
    console.log('Health check:', healthData);
    
    // Test design generation
    const designResponse = await fetch(`${API_BASE}/designs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brief: "Test API connection",
        options: {
          product: "shirt",
          style: "casual"
        }
      })
    });
    
    const designData = await designResponse.json();
    console.log('Design response:', designData);
    
    // Test concept status
    if (designData.designId) {
      setTimeout(async () => {
        const statusResponse = await fetch(`${API_BASE}/concepts/${designData.designId}`);
        const statusData = await statusResponse.json();
        console.log('Status response:', statusData);
      }, 5000);
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
