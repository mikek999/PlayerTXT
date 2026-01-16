# PlayerTXT Reference Web Client

This is a standalone "Thin Client" for the PlayerTXT Game Engine. It is designed to run on a separate machine from the game server, communicating via the PlayerTXT Protocol (HTTP/JSON).

## Architecture
- **Backend**: Lightweight Node.js (Express) server. Serves static files and provides configuration.
- **Frontend**: Vanilla HTML/JS terminal interface.
- **Protocol**: Connects to `GAME_SERVER_URL` to fetch state and send commands.

## Prerequisites
- Docker or Node.js (v18+)

## Running with Docker (Recommended)

1. Build the image:
```bash
docker build -t playertxt-web-client .
```

2. Run the container (Pointing to your Game Server IP):
```bash
# Replace http://192.168.1.50 with your actual Game Server URL
docker run -p 8080:8080 -e GAME_SERVER_URL=http://192.168.1.50 playertxt-web-client
```

3. Access the client:
```
http://localhost:8080
```

## Running Locally (Dev)

1. Install dependencies:
```bash
npm install
```

2. Start the client:
```bash
export GAME_SERVER_URL=http://localhost:80
npm start
```
