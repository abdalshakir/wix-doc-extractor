// /api/extract.js (Vercel Function)

import axios from 'axios';
import pdfParse from 'pdf-parse';

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: 'Missing fileUrl' });
  }

  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'];

    if (
      contentType === 'application/pdf' ||
      contentType === 'application/octet-stream' || // add this
      fileUrl.toLowerCase().endsWith('.pdf')        // safety check
    ) {
      const data = await pdfParse(response.data);
      return res.status(200).json({ text: data.text });
    }

    return res.status(400).json({ error: 'Unsupported file type' });
  } catch (err) {
    console.error('Extraction error:', err.message);
    return res.status(500).json({ error: 'Failed to extract text' });
  }
}
