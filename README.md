# Sage Multi-Agent Frontend + Backend Setup Guide

This guide explains how to set up and run the full Sage multi-agent system, including the backend agents and the frontend interface.


## Backend Setup (`sage-multi-agent`)

### 1. Clone the repository and move to the root directory

```bash
git clone https://github.com/SAGE-X-project/sage-multi-agent.git
cd sage-multi-agent
````

### 2. Install Go dependencies

```bash
go mod tidy
```

### 3. Build the agents, CLI, and client server

```bash
# Build the root agent
go build -o root/root ./root

# Build the sub-agents
go build -o ordering/ordering ./ordering
go build -o planning/planning ./planning

# Build the CLI client
go build -o cli/cli ./cli

# Build the client server (API)
go build -o client/client ./client
```

### 4. Set your Google API Key for the Gemini model

Get your API key from [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key), then export it:

```bash
export GOOGLE_API_KEY=your_api_key
```

### 5. Run the agents (in separate terminal windows)

```bash
# Terminal 1 - Root Agent
export GOOGLE_API_KEY=your_api_key
go run ./root/main.go
```

```bash
# Terminal 2 - Planning Agent
export GOOGLE_API_KEY=your_api_key
go run ./planning/main.go -activate-sage=false
```

```bash
# Terminal 3 - Ordering Agent
export GOOGLE_API_KEY=your_api_key
go run ./ordering/main.go -activate-sage=false
```

### 6. Run the client server

```bash
cd sage-multi-agent
./client/client
```

---

## Frontend Setup (`sage-fe`)

### 1. Clone the frontend project and move to the directory

```bash
git clone https://github.com/SAGE-X-project/sage-fe.git
cd sage-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the frontend development server

```bash
npm run dev
```

---

## ✅ Notes

* Make sure all agents are running before you test the frontend.
* The frontend connects to the backend through the client server (default: `http://localhost:8086`).
* WebSocket-based agent log monitoring is available in the frontend "Agent Monitoring" section.
* Real-time prompt interactions are handled in the "User Chat" section.

---

Enjoy using the Sage Multi-Agent demo!
