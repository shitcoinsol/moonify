export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input_images, prompt } = req.body;

  if (!process.env.REPLICATE_API_TOKEN || !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing API keys' });
  }

  try {
    const replicateRes = await fetch("https://api.replicate.com/v1/models/openai/gpt-image-1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        input: {
          input_images,
          prompt,
          openai_api_key: process.env.OPENAI_API_KEY
        }
      })
    });

    const data = await replicateRes.json();

    if (!data.output || !Array.isArray(data.output)) {
      return res.status(500).json({ error: 'Invalid response from Replicate', raw: data });
    }

    return res.status(200).json({ image_url: data.output[0] });

  } catch (err) {
    console.error('Replicate API Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
}
