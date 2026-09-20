# How to Run CollabSync 🚀

This document provides a comprehensive, step-by-step guide to installing, configuring, running, and testing **CollabSync** across different environments (local development, multi-terminal mode, and Docker Compose).

---

## 📋 System Requirements

Before starting, ensure your system meets the following requirements:
- **Node.js**: Version `18.0.0` or higher (`node -v`)
- **npm**: Version `9.0.0` or higher (`npm -v`)
- **Git**: Installed and configured (`git --version`)
- **Docker & Docker Compose** *(Optional, for containerized run)*: Version `20.10+`

---

## ⚡ Option 1: Quickstart (Single Command)

CollabSync includes root orchestration scripts powered by `concurrently` to install dependencies and run both frontend and backend concurrently.

### 1. Clone the Repository
```bash
git clone https://github.com/gravityash/CRDT.git
cd CRDT
```

### 2. Install All Dependencies
This command installs dependencies for the root orchestrator, the Vite client, and the Express server in one go:
```bash
npm run setup
```

### 3. Launch Development Servers
```bash
npm run dev
```

Both services will boot concurrently:
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

> **💡 Zero-Config Database**: If MongoDB is not running locally, the server will output `[MongoDB Fallback] Running in In-Memory Store Mode`. All workspaces, documents, and real-time sockets function completely without requiring a running MongoDB service.

---

## 🖥️ Option 2: Running Client & Server in Separate Terminals

If you prefer dedicated terminal windows for backend logs and frontend hot module replacement (HMR):

### Terminal 1: Backend Server
```bash
cd server
npm install
npm run dev
```
*The server will start with nodemon and ts-node on port `5000`.*

### Terminal 2: Frontend Client
```bash
cd client
npm install
npm run dev
```
*Vite will start the dev server on port `3000` with WebSocket & API proxies configured to `localhost:5000`.*

---

## 🐳 Option 3: Running with Docker & Docker Compose

To run the complete production stack (MongoDB database, Express backend container, and Nginx frontend container):

### 1. Build and Start the Containers
```bash
docker-compose up --build
```

### 2. Access the Application
- **Frontend (served via Nginx)**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MongoDB**: `localhost:27017`

### 3. Stopping the Containers
```bash
docker-compose down
```
To also remove the persisted database volume:
```bash
docker-compose down -v
```

---

## ⚙️ Environment Variables

CollabSync is configured to work with default settings out of the box. To customize ports or keys, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express API and Socket.io server |
| `NODE_ENV` | `development` | Runtime mode (`development` or `production`) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/collabsync` | MongoDB connection string (falls back to memory if unreachable) |
| `JWT_SECRET` | `collabsync_super_secret_jwt_key_2026` | Secret key for signing authentication tokens |
| `CLIENT_URL` | `http://localhost:3000` | Allowed client origin for CORS requests |

---

## 🧪 Verifying Key Features & Multi-User Collaboration

### 1. Multi-User Real-Time Collaboration
1. Open [http://localhost:3000](http://localhost:3000) in your main browser.
2. Open a second **Incognito / Private** window and visit [http://localhost:3000](http://localhost:3000).
3. In both windows, navigate to the **Workspace** page.
4. Try typing in the **Document Editor**: you will see live cursor markers with peer names and zero-lag text synchronization.
5. Switch to the **Whiteboard Canvas**: draw shapes or freehand strokes and observe instantaneous bidirectional rendering.

### 2. Switching Synchronization Engines
In the top header bar, locate the **Engine Selector**:
- **Custom CRDT**: Uses Replicated Growable Array (RGA) and Observed-Remove Sets (OR-Set) with Lamport Timestamps.
- **Yjs Engine**: Uses optimized differential state vectors.
- **Last Write Wins (LWW)**: Demonstrates timestamp-based synchronization.

### 3. Testing the Network Simulator
1. In the workspace, open the **Network Simulator** panel on the right sidebar.
2. Set **Latency** to `600ms` and **Packet Loss** to `15%`.
3. Type rapidly or draw complex vector paths.
4. Notice how the CRDT engine queues, buffers, and reliably reconciles out-of-order deliveries deterministically.

### 4. Testing Offline-First Persistence
1. Disconnect your internet connection or simulate offline mode in your browser DevTools (Network tab -> *Offline*).
2. The UI badge changes to **Offline** with a counter showing queued operations in IndexedDB.
3. Make changes to the document or canvas.
4. Switch back to **Online**: the operations are automatically replayed in topological order and merged cleanly.

### 5. Time-Travel Version History
1. Click the **History** tab in the workspace.
2. Drag the **Time Scrubber Slider** backwards to see the document or canvas at previous states.
3. View the inline diff comparison and click **Restore Version** to roll back if desired.

### 6. Analytics & Benchmark PDF Export
1. Click the **Analytics** or **Research Paper** tab in the navigation bar.
2. Review real-time performance graphs (Sync Latency, Throughput, Memory Overhead).
3. Click **Export Report as PDF** to generate an evaluation summary file.

---

## 🔨 Building for Production

To test the production build locally:

```bash
# Build both client and server
npm run build

# Start the server (which automatically serves the client build from server/dist)
npm run start
```

---

## ❓ Troubleshooting & FAQs

### Port Already in Use (Port 3000 or 5000)
- **Windows**:
  ```powershell
  # Find PID using port 5000 or 3000
  netstat -ano | findstr :5000
  # Terminate process
  taskkill /PID <PID> /F
  ```
- **macOS / Linux**:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### MongoDB Connection Warning
- If you see `[MongoDB] Connection failed, using in-memory store`, this is normal and expected if MongoDB is not running. The system includes an in-memory database fallback that allows all features to work without MongoDB.

### WebSocket Connection Issues
- Ensure `http://localhost:5000` is running and accessible.
- If running in Docker, verify `nginx.conf` has proxy headers configured for `/socket.io/` (pre-configured in this repository).
