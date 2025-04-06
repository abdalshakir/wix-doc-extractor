// /api/extract.js (Vercel Function)

import axios from 'axios';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';  // Import mammoth for DOCX handling

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

    // Handling PDF files
    if (
      contentType === 'application/pdf' ||
      contentType === 'application/octet-stream' || // add this for safety
      fileUrl.toLowerCase().endsWith('.pdf')        // safety check
    ) {
      const data = await pdfParse(response.data);
      return res.status(200).json({ text: data.text });
    }

    // Handling DOCX files
    if (
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // Check for DOCX MIME type
      fileUrl.toLowerCase().endsWith('.docx')        // Safety check for DOCX file extension
    ) {
      const data = await mammoth.extractRawText({ buffer: response.data });
      return res.status(200).json({ text: data.value });
    }

    return res.status(400).json({ error: 'Unsupported file type' });
  } catch (err) {
    console.error('Extraction error:', err.message);
    return res.status(500).json({ error: 'Failed to extract text' });
  }
}
