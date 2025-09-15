const axios = require("axios");
const FormData = require("form-data");

// Base URL for the FastAPI AI service (default to local 8000)
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

// Proxy: POST /api/process-document -> FastAPI /api/process-document
const processDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    // Optional language form field
    if (req.body && req.body.language) {
      form.append("language", req.body.language);
    }

    const response = await axios.post(`${AI_BASE_URL}/api/process-document`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const detail = error.response?.data || { message: error.message };
    return res.status(status).json({ error: detail });
  }
};

// Helper to call AI chat endpoint
const callAiChat = async ({ query, language }) => {
  const payload = new URLSearchParams();
  payload.append("query", query || "");
  payload.append("language", language || "en");
  const response = await axios.post(`${AI_BASE_URL}/api/chat`, payload.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

module.exports = { processDocument, callAiChat };


