export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_image_url, prompt } = req.body;

  if (!user_image_url || typeof user_image_url !== 'string' || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (!process.env.REPLICATE_API_TOKEN || !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing API keys' });
  }

  // ✅ 고정된 Supabase 이미지 3개
  const input_images = [
    user_image_url,
    'https://bkvgmmxrcldjoofqmprk.supabase.co/storage/v1/object/public/uploads//moon-hood.png',
    'https://bkvgmmxrcldjoofqmprk.supabase.co/storage/v1/object/public/uploads//moon-cap.png',
    'https://bkvgmmxrcldjoofqmprk.supabase.co/storage/v1/object/public/uploads//moon-bg.png'
  ];

  try {
    const response = await fetch("https://api.replicate.com/v1/models/openai/gpt-image-1/predictions", {
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

    const data = await response.json();

    if (!data.output || !Array.isArray(data.output)) {
      return res.status(500).json({ error: 'Replicate response invalid', raw: data });
    }

    return res.status(200).json({ image_url: data.output[0] });

  } catch (err) {
    console.error('Replicate API error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
