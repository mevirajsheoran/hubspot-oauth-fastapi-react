# Pipeline AI - Integration Engine Assessment

This repository contains my submission for the **Pipeline AI Integrations Technical Assessment**. 

The goal of this project is to implement a robust, scalable, and secure full-stack integration connecting **HubSpot's CRM API** to a multi-tenant platform, mimicking existing scalable integration patterns (Airtable and Notion). 

The flow features a **React** frontend for UI/UX, a **FastAPI (Python)** backend acting as the OAuth 2.0 orchestration layer, and **Redis** for state validation and credential caching.

## 🚀 Features Implemented

- **Secure 3-Legged OAuth 2.0 Flow**: Implemented full `authorize` and `callback` endpoints
- **CSRF Protection**: Utilizes cryptographically secure random `state` variables cached in Redis to validate the callback integrity against cross-site request forgery
- **Auto-Closing Popups**: Custom asynchronous UI polling via `setInterval` automatically detects when the OAuth popup completes and shuts it down, rendering a seamless UX
- **Cursor-Based API Pagination**: Built a custom recursive `while`-loop pattern handling HubSpot's `paging.next.link` cursor limits to ensure zero data drops across massive HubSpot accounts
- **CRM Object Data Harvesting**: Integrates directly into HubSpot to pull `Contacts`, `Companies`, and `Deals` inside normalized `IntegrationItem` structures
- **Multi-Platform Support**: Extensible architecture supporting Airtable, Notion, and HubSpot integrations

## 🛠 Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Material-UI** - React component library for consistent design
- **Axios** - HTTP client for API requests

### Backend
- **Python** - Programming language
- **FastAPI** - Modern, fast web framework for building APIs
- **Uvicorn** - ASGI server for running FastAPI
- **Httpx** - Async HTTP client for OAuth flows

### Infrastructure
- **Redis** - In-memory data structure store for caching and state management

## 📁 Project Structure

```
pipeline-ai-assignment/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── redis_client.py         # Redis connection utilities
│   └── integrations/
│       ├── airtable.py         # Airtable OAuth integration
│       ├── notion.py           # Notion OAuth integration
│       ├── hubspot.py          # HubSpot OAuth integration
│       └── integration_item.py  # Data model for integration items
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── integration-form.js # Integration management form
│   │   ├── data-form.js        # Data loading component
│   │   └── integrations/      # Platform-specific components
│   └── package.json            # Node.js dependencies
└── README.md                   # This file
```

## ⚙️ Running Locally

### Prerequisites
1.  **Node.js & npm** (v16+)
2.  **Python 3.9+**
3.  **Redis Server** installed and running on default port (`6379`)
4.  A [HubSpot Developer Account](https://developers.hubspot.com/) with a created App (for Client ID & Client Secret).

### 1. Start Redis
```bash
# Verify it's running in your background Terminal or WSL
redis-server
```

### 2. Start the Backend (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install dependencies 
pip install -r requirements.txt

# Start the uvicorn API server
uvicorn main:app --reload
```
*The backend will boot up at `http://localhost:8000`.*

### 3. Start the Frontend (React)
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install node modules
npm i

# Start development server
npm start
```
*The frontend will boot up at `http://localhost:3000`.*

## 🧪 Usage & Testing Guide

1. Launch the UI at `http://localhost:3000`
2. Select an integration type (Airtable, Notion, or HubSpot) from the dropdown
3. Click **Connect to [Platform]**. This triggers the OAuth popup window
4. Authorize the application in the provider's interface. The popup will automatically close and trigger the UI state to update to **[Platform] Connected**
5. Click **Load Data**. The backend retrieves the access token from Redis and runs paginated queries against the API, returning and rendering normalized `IntegrationItems`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OAuth Credentials (Replace with your actual credentials)
AIRTABLE_CLIENT_ID=your_airtable_client_id
AIRTABLE_CLIENT_SECRET=your_airtable_client_secret

NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
```

## 🤝 Contributing

This project serves as a technical assessment. For understanding the implementation details and architectural decisions, please refer to the [documentation.md](./documentation.md) file.

## 📄 License

This project is submitted as part of a technical assessment and may not be subject to standard licensing terms.

## 📂 Architecture & Documentation

For a deep dive into the code infrastructure, exact line-by-line function implementations, the OAuth communication sequence, and the reasons behind specific system designs, please read my provided [documentation.md](./documentation.md).
