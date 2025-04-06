const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

module.exports = async (req, res) => {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: 'Missing fileUrl parameter' });
  }

  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const fileName = fileUrl.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      const data = await pdf(buffer);
      return res.status(200).json({ text: data.text });
    }

    if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return res.status(200).json({ text: result.value });
    }

    return res.status(400).json({ error: 'Unsupported file type' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
