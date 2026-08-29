# 🎓 CampusBrain AI — Intelligent RAG-Based College Chatbot & Knowledge Hub

<div align="center">

![CampusBrain Banner](https://img.shields.io/badge/CampusBrain_AI-RAG_College_Chatbot-6366f1?style=for-the-badge&logo=openai&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-Vite-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47a248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)

**An intelligent, grounded Retrieval-Augmented Generation (RAG) assistant designed for college campuses, unifying academic policies, fee structures, hostel guidelines, and placement intelligence.**

[Key Features](#-key-features) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Documentation](#-api-endpoints) • [Demo Credentials](#-demo-accounts)

</div>

---

## 📌 Executive Summary

Higher education institutions generate extensive volumes of circulars, syllabus handbooks, exam regulations, hostel rules, and placement reports. Students often struggle to find immediate, accurate answers across fragmented portals, while administrative offices face repetitive query loads.

**CampusBrain AI** solves this with an end-to-end **Retrieval-Augmented Generation (RAG)** platform:
1. **100% Grounded Answers:** Prevents LLM hallucinations by retrieving exact chunked paragraphs from verified campus documents.
2. **Interactive Citations:** Displays relevant source citations with semantic similarity percentage confidence matches.
3. **Role-Based Access Control (RBAC):** Separates Student access (Catalog discovery & Q&A) from Administrator access (Document upload, text ingestion, deletion, and vector re-indexing).
4. **Real-time Telemetry:** Tracks grounding accuracy, user satisfaction ratings (👍/👎), response latencies, top student query rankings, and unresolved questions.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Student / Administrator] -->|Queries / Voice Input| B[Vite + React 19 Client]
    B -->|REST API Request| C[Express.js API Gateway]
    C -->|Auth / Token Verification| D[JWT & BCrypt Middleware]
    
    subgraph RAG Pipeline
        C -->|Query Tokenization| E[TF-IDF & Cosine Similarity Engine]
        E -->|Semantic Search| F[(Vector Index & Chunks Store)]
        F -->|Top-K Context Chunks| G[Context Grounding Engine]
        G -->|Prompt Synthesis| H[Google Gemini / Grounded AI Engine]
    end

    subgraph Persistent Storage
        C -->|CRUD Operations| I[(MongoDB Atlas Cloud DB)]
        I --> J[Users Collection]
        I --> K[Documents & Chunks]
        I --> L[Sessions & Messages]
        I --> M[Analytics Telemetry]
    end

    H -->|Grounded Answer + Sources + Metrics| B
```

---

## ✨ Key Features

### 1. 🧠 Retrieval-Augmented Generation (RAG) Engine
- **Recursive Chunking with Overlap:** Automatically segments campus documents into semantically coherent blocks (default $400$ chars with $80$ chars overlap) to preserve cross-sentence context.
- **TF-IDF & BM25 Vector Matching:** High-speed cosine similarity retrieval matrix with keyword weighting and configurable similarity threshold ($0.10$ to $0.60$).
- **Multi-Model Support:** Google Gemini 1.5 Flash, Gemini 2.0 Flash, OpenRouter, or built-in local grounded semantic engine.

### 2. 💬 Interactive Campus Chat Assistant
- Real-time answers with source document badge citations and confidence percentages.
- Dynamic **Suggested Next Questions** rendered after each response for seamless exploration.
- Integrated **Web Speech API** for hands-free voice search.
- Text-to-Speech (TTS) voice playback of bot responses.
- One-click **Markdown Consultation Export**.

### 3. 📑 Knowledge Hub & Document Intelligence
- Drag-and-drop file upload supporting PDF, TXT, and Markdown files.
- Direct policy markdown/text ingestion.
- One-click **AI Executive Summaries** and automated **FAQ generation**.
- **Role-Based Protection:** Document upload and deletion are strictly gated behind verified Administrator privileges.

### 4. 📊 Real-Time Telemetry & Analytics Dashboard
- Live consultation counter, grounding accuracy percentage, and average latency metrics.
- User satisfaction scoring with instant 👍 / 👎 sentiment tracking.
- **Scrollable Most Frequent Student Topics** ranking leaderboard.
- **Unresolved Query Queue** to highlight gaps in institutional documentation.

### 5. ☁️ Enterprise Cloud Database Integration
- **MongoDB Atlas:** Connected via Mongoose for persistent cloud synchronization.
- **Local JSON Fallback:** Zero-config fallback ensuring 100% offline availability.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Frontend UI** | React 19, Vite, Tailwind CSS | High-performance reactive interface with sleek glassmorphism aesthetic |
| **State Management**| Zustand | Lightweight, persistent client-side state management |
| **Icons & Media** | Lucide React | Clean, modern iconography |
| **Backend API** | Node.js, Express.js | Scalable asynchronous RESTful API server |
| **Database** | MongoDB Atlas (Mongoose) | Managed cloud database for users, documents, messages, and analytics |
| **AI / LLM** | Google Gemini 1.5/2.0 REST API | Advanced generative responses with strict context grounding |
| **Speech Engine** | Web Speech API | Client-side speech-to-text and voice synthesis |
| **Security** | JWT, BCrypt.js | Cryptographic user authentication and RBAC enforcement |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB Atlas** connection string (or local MongoDB)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/tsubramanyam133/Rag-College-Chatbot.git
cd Rag-College-Chatbot
```

---

### Step 2: Backend Configuration & Startup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://tsubramanyam133_db_user:bZuMp0gq85iFiUkR@cluster1.zpgbzoe.mongodb.net/campusbrain?retryWrites=true&w=majority&appName=Cluster1

# JWT Secret
JWT_SECRET=campusbrain_rag_super_secret_jwt_key_2026

# Google Gemini API Key (Optional: leave blank for built-in grounded engine)
GEMINI_API_KEY=

# RAG Configuration
SIMILARITY_THRESHOLD=0.20
TOP_K_RESULTS=4
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm start
```
*The server will start on `http://localhost:5000` and automatically connect to MongoDB Atlas.*

---

### Step 3: Frontend Client Startup
```bash
# In a new terminal window, navigate to client directory
cd ../client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🔑 Demo Accounts

The system comes pre-seeded with ready-to-use accounts:

| Role | Email | Password | Access Level |
|:---|:---|:---|:---|
| **👨‍🎓 Student** | `student@campus.edu` | `Student@1234` | Chat Assistant, Catalog Search, Chunk Inspection |
| **🛡️ Administrator** | `admin@campus.edu` | `Admin@1234` | Full Management, Uploads, Deletion, Settings, Analytics |

*You can also click the quick **"👨‍🎓 Fill Demo Student"** or **"🛡️ Fill Demo Admin"** buttons on the Sign-In modal.*

---

## 📡 API Endpoints

### 💬 Chat & Consultation
- `POST /api/chat/query` — Process query, perform vector search, and return grounded answer.
- `GET /api/chat/sessions` — Retrieve chat history threads for the active user.
- `POST /api/chat/sessions` — Create a new conversation session.
- `GET /api/chat/sessions/:id/messages` — Retrieve messages for a session.
- `DELETE /api/chat/sessions/:id` — Delete a conversation thread.
- `POST /api/chat/feedback` — Submit thumbs up/down rating on an answer.
- `GET /api/chat/suggested-prompts` — Fetch recommended campus questions.

### 📑 Knowledge Base Management
- `GET /api/documents` — List all registered campus documents and chunk counts.
- `GET /api/documents/:id` — Inspect chunked vector segments for a document.
- `POST /api/documents/upload` — Upload PDF/TXT/MD file and generate vector embeddings *(Admin only)*.
- `POST /api/documents/direct` — Ingest raw text/policy content *(Admin only)*.
- `DELETE /api/documents/:id` — Remove document and purge vector chunks *(Admin only)*.
- `GET /api/documents/:id/summary` — Generate AI executive summary.
- `GET /api/documents/:id/faqs` — Extract automatic student FAQs.

### 📊 Telemetry & Analytics
- `GET /api/analytics/stats` — Real-time telemetry metrics, query rankings, and unresolved questions.
- `POST /api/analytics/unresolved/:id/resolve` — Mark unresolved query as handled.

### ⚙️ System Settings
- `GET /api/settings` — Fetch active RAG thresholds and model configurations.
- `POST /api/settings/update` — Update Gemini API keys and similarity parameters *(Admin only)*.
- `POST /api/settings/reindex` — Recompute vector index matrices *(Admin only)*.

---

## 👨‍💻 Project Submission Details
- **Project Title:** RAG-Based College Chatbot (CampusBrain AI)
- **Author:** T. Subramanyam
- **Repository:** [https://github.com/tsubramanyam133/Rag-College-Chatbot](https://github.com/tsubramanyam133/Rag-College-Chatbot)

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
