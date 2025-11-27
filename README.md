

# The Legal Compass – Your Own Personal Legal Assistant

Legal Compass is a **cross-platform Web + Android application** built using **React, React Native (Expo)**, and **Google Cloud's Generative AI services**. It simplifies complex legal documents into clear, multilingual summaries with **voice output, clause-level risk detection, and a context-aware Q&A chatbot**.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Setup & Installation](#setup--installation)
- [Google Cloud Setup](#google-cloud-setup)
- [How It Works](#how-it-works)
- [Future Scope](#future-scope)
- [Contributors](#contributors)

---

## Features
- **Cross-Platform:** Web + Android app using React + Expo.
- **Multilingual Support:** Summaries in Hindi, Marathi, Tamil, Telugu, and more.
- **Multimodal Outputs:** Text + Voice summaries using Google Text-to-Speech.
- **Context-Aware Chatbot:** RAG + Gemini-powered Q&A for accurate legal answers.
- **Missing Clause Detection:** Alerts for absent critical clauses.

---

## Tech Stack
### Frontend
- React (Web App)
- React Native + Expo (Android App)

### Backend
- Node.js + Express.js
- MongoDB (User data, document metadata)
- Cloudinary ( file storage )

### AI/ML & Cloud
- **Google Cloud Vertex AI:** Generative AI & embeddings
- **Google Document AI / Vision AI:** OCR for text extraction
- **Google Cloud Translation API:** Multilingual support
- **Google Text-to-Speech API:** Voice output generation
- **Vector Database:** Pinecone / pgvector for RAG pipeline
- **Google Cloud Storage:** Secure document storage

---

## System Architecture
**Flow:**
1. Document Upload → 2. OCR Text Extraction → 3. Text Chunking → 4. RAG Retrieval → 5. Summarization → 6. Multilingual Translation → 7. Text-to-Speech Output → 8. Q&A Chatbot → 9. Web/Android UI


## Setup & Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/ase_genai.git
   cd ase_genai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run Web App:**
   ```bash
   npm start
   ```

4. **Run Android App (Expo):**
   ```bash
   npx expo start
   ```

5. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```

---

## Google Cloud Setup
- Enable **Vertex AI, Document AI, Translation API, Text-to-Speech API, Cloud Storage** in the Google Cloud Console.
- Download and add your **service account key** to your backend as `service-account.json`.
- Set environment variables for **Google Project ID, API keys, and Database URLs**.

---

## How It Works
1. User uploads PDF/Image → OCR extracts text.
2. RAG retrieves relevant clauses → Gemini simplifies text.
3. Missing clauses flagged.
4. Summaries translated into multiple languages.
5. Text-to-Speech generates voice narration.
6. Context-aware chatbot answers user questions.

---

## Future Scope
- Add AI-powered **contract comparison and legal clause recommendations** for better decision-making.
- Automatic checks for **compliance with local laws** & industry regulations.
- Suggest better terms or **alternatives for clauses** marked as risky or unfair.
- Integration with **legal professionals** for review.
- **Offline mode** for rural areas with poor connectivity.
- **Expanded language support** for all Indian languages.

---

## Contributors
- **Team Name:** [Your Team Name]
- **Team Members:** [List Names]
- **Hackathon:** [Hackathon Name & Date]
