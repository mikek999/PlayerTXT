# The Masquerade Protocol

## Project Description
The Masquerade Protocol is a hardware-agnostic, AI-driven gaming platform designed to bridge the gap between 1980s retro-computing and modern Generative AI. It functions as a "Universal Thin Client" engine, allowing any device capable of opening a raw TCP socket—from an Atari 800XL to a modern web browser—to connect to a shared, high-fidelity narrative world. The platform features high-stakes, time-limited social deduction simulations and a unique "Understudy System" where AI agents seamlessly impersonate and replace disconnected human players.

## Recommended Server Requirements
To run the full stack (Node.js Game Server, SQL Server, and Ollama with Llama 3/Gemini), the following hardware is recommended:

- **OS**: Linux (Ubuntu 22.04+ recommended) with Docker and Docker Compose.
- **CPU**: 4+ Cores (Modern Intel i5/i7 or AMD Ryzen 5/7).
- **RAM**: 16GB minimum (32GB recommended for smooth LLM performance).
- **GPU**: NVIDIA GPU with 8GB+ VRAM (Optional, for local Ollama acceleration).
- **Storage**: 50GB+ SSD (NVMe preferred for SQL Server performance).
- **Network**: Stable broadband with port 80/443 exposed if hosting for remote players.

## Prerequisites
- Docker and Docker Compose installed.
- Access to the internet for pulling images and Gemini API.

## Starting the System

To start the entire stack (SQL Server, Ollama, and Game Server), run:

```bash
docker-compose up -d
```

## Configuration

### Environment Variables
Configuration is handled via environment variables in `docker-compose.yml`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_SERVER` | Hostname of the SQL Server | `sqlserver` |
| `DB_PASSWORD` | SA password for SQL Server | `YourStrong!Passw0rd` |
| `OLLAMA_URL` | URL for the Ollama container | `http://ollama:11434` |
| `PORT` | Listening port for the game server | `443` |

### Database Initialization
The server will automatically attempt to initialize the SQL schema on startup if the database is empty.

### Adding New Scenarios
Use the Admin UI (accessible via `https://localhost/admin`) to prompt Gemini to generate new game scenarios directly into the SQL database.
