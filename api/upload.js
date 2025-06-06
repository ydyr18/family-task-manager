import { put } from '@vercel/blob';
import formidable from 'formidable';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    const file = files.image[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert file to stream
    const stream = Readable.from(Buffer.from(await file.arrayBuffer()));

    // Upload to Vercel Blob Storage
    const blob = await put(file.originalFilename, stream, {
      access: 'public',
      contentType: file.type
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
} 