## Flask Server – Setup and Run Guide (with 5Paisa + Kotak Neo)

This service exposes a WebSocket + HTTP API for a financial chatbot. It integrates two brokerage SDKs that often require different Python environments:
- 5Paisa (`py5paisa`)
- Kotak Neo (`neo_api_client`)

The code loads both SDKs by dynamically adding each SDK’s virtualenv `site-packages` to `sys.path` at runtime. This lets you run the Flask app in a clean “app” environment while keeping each broker SDK isolated in its own environment.

### Quick Start
1) Create three virtual environments (one app env + two broker envs)
2) Install dependencies in the right envs
3) Create a `.env` with credentials
4) Run the server

---

## 1) Prerequisites
- Linux with Python 3.10+ available
- Ability to install multiple Python minor versions (e.g., via `pyenv` or system packages)
- Node client (optional) pointing at `ws://127.0.0.1:5001/socket.io/`

Check available Python versions:
```bash
python3 --version
python3.10 --version || true
python3.11 --version || true
python3.12 --version || true
```

If you lack a needed version, install it via your distro or `pyenv`.

---

## 2) Create Virtual Environments

We will use these paths (as referenced in `process_chat.py` and `process_chat_async.py`):
- 5Paisa env: `/home/satya/env_5paisa`
- Kotak Neo env: `/home/satya/env_kotakneo`
- App env (for Flask server): `/home/satya/env_app`

Choose versions that work for your system. If unsure, start with:
- 5Paisa on Python 3.10
- Kotak Neo on Python 3.11 or 3.12

Create envs:
```bash
# App env (Flask + eventlet + socketio)
python3 -m venv /home/satya/env_app

# 5Paisa SDK env
python3.10 -m venv /home/satya/env_5paisa

# Kotak Neo SDK env
python3.12 -m venv /home/satya/env_kotakneo
```

If a specific minor version is unavailable, use another available 3.x version. The loader finds `lib/python*/site-packages` dynamically.

---

## 3) Install Dependencies

Activate each env and install its packages.

App env (Flask server):
```bash
source /home/satya/env_app/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
# Optionally pin eventlet/socketio versions if needed:
# pip install "eventlet<0.35" "python-socketio<6" "flask-socketio<6"
deactivate
```

5Paisa env:
```bash
source /home/satya/env_5paisa/bin/activate
pip install --upgrade pip
pip install py5paisa
deactivate
```

Kotak Neo env:
```bash
source /home/satya/env_kotakneo/bin/activate
pip install --upgrade pip
pip install neo-api-client
deactivate
```

Notes:
- The Flask app itself runs in `env_app`. At runtime, it injects `env_5paisa` and `env_kotakneo` `site-packages` into `sys.path` (see `process_chat.py` / `process_chat_async.py`).
- If a broker SDK fails to import, re-check the correct env path and Python version used to create that env.

---

## 4) Environment Variables (.env)
Create a `.env` file in this directory with the following keys. The async server has an endpoint to validate them.

```env
# OpenRouter (LLM)
OPENROUTER_API_KEY=your_openrouter_key

# 5Paisa
FIVE_PAISA_APP_NAME=
FIVE_PAISA_APP_SOURCE=
FIVE_PAISA_USER_ID=
FIVE_PAISA_PASSWORD=
FIVE_PAISA_USER_KEY=
FIVE_PAISA_ENCRYPTION_KEY=

# Kotak Neo (app keys)
NEO_CONSUMER_KEY=
NEO_CONSUMER_SECRET=
# Optional
NEO_ACCESS_TOKEN=
NEO_ENVIRONMENT=prod
NEO_FIN_KEY=

# Kotak Neo (login for session)
NEO_MOBILE_NUMBER=
NEO_PASSWORD=
# Optional default OTP used by async init (only for dev/testing)
NEO_DEFAULT_OTP=123456

# Optional AWS deployment fields (if you use deploy util in code)
EC2_HOST=
EC2_USERNAME=ubuntu
EC2_KEY_PATH=
EC2_REMOTE_SCRIPT_PATH=
```

Add email/DOB for 5Paisa if your `py5paisa` version requires it at login:
```env
FIVE_PAISA_EMAIL=
FIVE_PAISA_DOB=
```

---

## 5) Stock Data
The server expects JSON files under `stock_data/`. Ensure there are one or more `*.json` files.

---

## 6) Run the Server

Always activate the app env to run the Flask server:
```bash
cd /home/satya/Documents/Blue/projects/development/algorthim_trading/app/flask_server
source /home/satya/env_app/bin/activate

# Synchronous server (uses process_chat.py)
python main.py

# OR Async server (uses process_chat_async.py)
python main_async.py
```

Default bind: `127.0.0.1:5001`

Health checks (HTTP):
- GET `http://127.0.0.1:5001/health`
- GET `http://127.0.0.1:5001/system/status`
- GET `http://127.0.0.1:5001/test`

Async-only credential validation:
- GET `http://127.0.0.1:5001/api/credentials/validate`

Reinitialize clients (sync server):
- POST `http://127.0.0.1:5001/api/reinitialize-clients`

WebSocket endpoint:
- `ws://127.0.0.1:5001/socket.io/` (event name: `process_message`)

Example message payload (Socket.IO):
```json
{
  "correlation_id": "demo-1",
  "content": "Analyze ITC Limited"
}
```

---

## 7) Troubleshooting Version Conflicts

- 5Paisa vs Kotak Neo: Keep them in separate envs (`env_5paisa`, `env_kotakneo`). The app will import both by adding each env’s `site-packages` to `sys.path`.
- ImportError for `py5paisa` or `neo_api_client`:
  - Confirm the env paths exist and have packages installed
  - Ensure the Python version used to create the env matches a supported version
  - Reinstall the package inside its env (`pip show py5paisa` / `pip show neo-api-client`)
- Socket/greenlet errors:
  - Eventlet/SockeIO versions occasionally conflict. Pin if needed:
    ```bash
    pip install "eventlet<0.35" "python-socketio<6" "flask-socketio<6"
    ```
- CORS/connection issues: verify client origin is in `cors_allowed_origins` in `main.py`/`main_async.py`.
- Stock data not loaded: ensure `stock_data/*.json` exists and is valid JSON.

---

## 8) Useful Dev Commands
```bash
# Check credentials quickly (async server must be running)
curl -s http://127.0.0.1:5001/api/credentials/validate | jq .

# Reinitialize broker clients (sync server)
curl -X POST http://127.0.0.1:5001/api/reinitialize-clients

# Health check
curl -s http://127.0.0.1:5001/health | jq .
```

---

## 9) Further Implementation Notes

- OTP/session flows (Kotak Neo): For production, remove any default OTP logic and implement user-driven OTP retrieval with secure storage. Rotate sessions/token refresh appropriately.
- Secrets: Never hardcode credentials. Keep using `.env` with `python-dotenv` and/or a vault in production.
- Structured responses: The server already normalizes responses with `correlation_id`, `status`, and `content`. Keep this contract for new features.
- Limits and timeouts: Adjust `AI_RESPONSE_TIMEOUT` in `main.py`/`main_async.py` if using larger LLMs.
- Validation: Prefer the async variant with `/api/credentials/validate` during setup to quickly see which credentials are missing.
- Deployment: If you use the EC2 deploy helper in `process_chat.py`, wire the `EC2_*` vars and ensure SSH keys/permissions are correct.

---

## 10) Minimal End-to-End Test
1) Ensure three envs are created and dependencies installed (sections 2–3)
2) Create `.env` with OpenRouter + broker credentials (section 4)
3) Activate app env and run server:
```bash
source /home/satya/env_app/bin/activate
python main.py
```
4) From another terminal, test HTTP:
```bash
curl -s http://127.0.0.1:5001/health | jq .
```
5) From a Socket.IO client, emit `process_message` with a `content` query and a `correlation_id`. You should receive a `message_response` event with the AI/broker result.


