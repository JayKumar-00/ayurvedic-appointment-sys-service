const API_URL = 'http://localhost:3030/api/v1';

async function testApi() {
  console.log("Logging in as System Admin...");
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'systemadmin@ayurvedic.com',
        password: 'SystemAdmin@123'
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log("Login successful! Access token obtained.");

    console.log("Fetching dashboard statistics...");
    const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!statsRes.ok) {
      throw new Error(`Stats fetch failed with status ${statsRes.status}: ${await statsRes.text()}`);
    }

    const statsData = await statsRes.json();
    console.log("\n--- API RESPONSE ---");
    console.log(JSON.stringify(statsData, null, 2));
  } catch (error) {
    console.error("API request failed:", error.message);
  }
}

testApi();
