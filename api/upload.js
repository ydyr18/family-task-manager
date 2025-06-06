import { writeFile } from 'fs/promises';
import { join } from 'path';
import formidable from 'formidable';

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

    const filename = file.originalFilename;
    const imagePath = join(process.cwd(), 'public', 'images', filename);

    await writeFile(imagePath, await readFile(file.filepath));

    return res.status(200).json({ path: `/images/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Error uploading file' });
  }
} 