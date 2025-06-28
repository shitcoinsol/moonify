// generation.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

console.log('generation.js loaded');

const supabase = createClient(
  'https://bkvgmmxrcldjoofqmprk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdmdtbXhyY2xkam9vZnFtcHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTQyODQsImV4cCI6MjA2NjU5MDI4NH0.GyqJtfyEUu3FXDP41u3hMH59zbr9UEhuXZUKhaeTU-w'
);

const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const moonifyBtn = document.getElementById('moonifyBtn');
console.log('Moonify button element:', moonifyBtn);

let uploadedFilePath = null;

imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = 'block';

  const filename = `user_${Date.now()}_${file.name}`;
  console.log('Uploading file to Supabase:', filename);
  const { error } = await supabase.storage.from('uploads').upload(filename, file);
  if (error) {
    console.error('Upload failed', error);
    alert('Upload failed: ' + error.message);
    return;
  }

  uploadedFilePath = filename;
  console.log('Uploaded file path:', uploadedFilePath);
});

async function getPublicURL(path) {
  const { data } = supabase.storage.from('uploads').getPublicUrl(path);
  return data.publicUrl;
}

moonifyBtn.addEventListener('click', async () => {
  console.log('Moonify button clicked');
  if (!uploadedFilePath) {
    alert('Please upload an image.');
    return;
  }

  moonifyBtn.disabled = true;
  startLoadingAnimation();
  try {
    const characterUrl = await getPublicURL(uploadedFilePath);
    console.log('characterUrl:', characterUrl);

  const inputImages = [
    characterUrl,
    'https://bkvgmmxrcldjoofqmprk.supabase.co/storage/v1/object/public/uploads/moon-hood.png',
    'https://bkvgmmxrcldjoofqmprk.supabase.co/storage/v1/object/public/uploads/moon-cap.png',
    'https://bkvgmmxrcldjoofqmprk.supabase.co/storage/v1/object/public/uploads/moon-bg.png'
  ];
    console.log('inputImages:', inputImages);

  const prompt = `Compose a single, unified image using the following four input images:\n\n1. **Base character image**\nThis is the original character to be modified. Do not change the character’s pose, facial expression, body proportions, or visual style. Preserve all original aesthetic details exactly as they appear.\n\n2. **moon-cap.png**\nOverlay this image as a hat on the character’s head. The Moonshot cap must fit naturally, respecting the character’s head position, angle, and lighting. Replace any existing headgear if present. The style of the cap must match the art style of the original character.\n\n3. **moon-hood.png**\nOverlay this image as clothing on the character’s torso. The Moonshot hoodie should align with the character’s shoulders and body shape. Ensure that it blends seamlessly into the character while keeping the Moonshot logo on the chest clearly visible. Do not distort or crop the hoodie unnaturally.\n\n4. **moon-bg.png**\nReplace the background entirely with this image. The Moonshot-themed background must fully cover the original background. Ensure that the foreground character and the new background appear cohesive in style and lighting.\n\nAll composited elements (cap, hoodie, background) must match the lighting, perspective, and illustration style of the base character image. Do not introduce any new elements or alter the character’s original identity. The final result should look like the original character naturally dressed in Moonshot gear and placed within the Moonshot background, as if it were originally drawn that way.`;
    console.log('prompt:', prompt);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input_images: inputImages, prompt })
    });
    console.log('fetch status:', response.status);
    const result = await response.json();
    console.log('generation result:', result);

    const imageUrl = result.image_url;
    if (!imageUrl) throw new Error('Generation failed');

    resultImage.src = imageUrl;
    resultImage.style.display = 'block';
    downloadBtn.style.display = 'inline-block';
  } catch (err) {
    console.error('Error during generation:', err);
    alert('Generation failed.');
  } finally {
    stopLoadingAnimation();
    moonifyBtn.disabled = false;
    if (uploadedFilePath) {
      await supabase.storage.from('uploads').remove([uploadedFilePath]);
      uploadedFilePath = null;
    }
  }
});
console.log('Moonify event listener attached');

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = resultImage.src;
  link.download = 'moonified.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});