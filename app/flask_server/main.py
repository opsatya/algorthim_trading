import eventlet
eventlet.monkey_patch()

import os
import logging
import traceback
import re
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from eventlet.timeout import Timeout

# Import process_chat.py functions and client classes
from process_chat import (
    process_query, 
    load_stock_data,
    FivePaisaClient,
    NeoAPI
)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STOCK_DATA_DIRECTORY = os.path.join(BASE_DIR, "stock_data")
AI_RESPONSE_TIMEOUT = 30

# Initialize application
app = Flask(__name__)

# Secret key (from env in production)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-fallback-change-me')

# Define allowed origins once (no trailing slashes)
ALLOWED_ORIGINS = [
    "https://algorthim-trading.vercel.app",
    "https://algorthim-trading.onrender.com",
    "http://localhost:5173",
    "http://localhost:3001",
    "http://localhost:5000",
    "http://localhost:4000",
    "http://127.0.0.1:5000",
]
# Remove any empty entries if env-driven
ALLOWED_ORIGINS = [o for o in ALLOWED_ORIGINS if o]

# HTTP CORS for REST endpoints
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

# Socket.IO with proper CORS param
socketio = SocketIO(
    app,
    cors_allowed_origins=ALLOWED_ORIGINS,
    async_mode='eventlet',
    transports=['websocket'],
    ping_timeout=60,
    ping_interval=10,
    logger=True,
    engineio_logger=True
)

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global data storage
try:
    stock_data = load_stock_data(STOCK_DATA_DIRECTORY)
    data_loaded = True
    logger.info("Successfully loaded stock data")
except Exception as e:
    logger.error(f"Error loading stock data: {str(e)}")
    data_loaded = False
    stock_data = {}

# Initialize API clients (optional, safe to skip when creds absent)
five_paisa_client = None
neo_client = None

def initialize_api_clients():
    global five_paisa_client, neo_client
    try:
        five_paisa_cred = {
            "APP_NAME": os.getenv("FIVE_PAISA_APP_NAME", ""),
            "APP_SOURCE": os.getenv("FIVE_PAISA_APP_SOURCE", ""),
            "USER_ID": os.getenv("FIVE_PAISA_USER_ID", ""),
            "PASSWORD": os.getenv("FIVE_PAISA_PASSWORD", ""),
            "USER_KEY": os.getenv("FIVE_PAISA_USER_KEY", ""),
            "ENCRYPTION_KEY": os.getenv("FIVE_PAISA_ENCRYPTION_KEY", "")
        }
        five_paisa_email = os.getenv("FIVE_PAISA_EMAIL", "")
        five_paisa_dob   = os.getenv("FIVE_PAISA_DOB", "")

        if all(five_paisa_cred.values()):
            five_paisa_client = FivePaisaClient(cred=five_paisa_cred)
            if hasattr(five_paisa_client, "login") and five_paisa_email:
                try:
                    if not getattr(five_paisa_client, "email", None):
                        five_paisa_client.email = five_paisa_email
                    if five_paisa_dob and not getattr(five_paisa_client, "DOB", None):
                        five_paisa_client.DOB = five_paisa_dob
                    five_paisa_client.login()
                    logger.info("Five Paisa client logged in successfully")
                except Exception as e:
                    logger.error(f"Five Paisa login failed: {e}")
                    logger.debug(traceback.format_exc())
                    five_paisa_client = None
        else:
            logger.warning("Five Paisa credentials missing, client not initialized")

        neo_consumer_key = os.getenv("NEO_CONSUMER_KEY", "")
        neo_consumer_secret = os.getenv("NEO_CONSUMER_SECRET", "")
        neo_access_token = os.getenv("NEO_ACCESS_TOKEN", "")
        neo_environment = os.getenv("NEO_ENVIRONMENT", "prod")
        neo_fin_key = os.getenv("NEO_FIN_KEY", "")

        if neo_consumer_key and neo_consumer_secret:
            try:
                neo_client = NeoAPI(
                    consumer_key=neo_consumer_key,
                    consumer_secret=neo_consumer_secret,
                    access_token=neo_access_token or None,
                    environment=neo_environment,
                    neo_fin_key=neo_fin_key or None
                )
                logger.info("Neo API client initialized successfully")
            except TypeError as e:
                logger.error(f"NeoAPI init failed: {e}")
                logger.debug(traceback.format_exc())
                neo_client = None
        else:
            logger.warning("Neo API credentials missing, client not initialized")

    except Exception as e:
        logger.error(f"Error initializing API clients: {str(e)}")
        logger.error(traceback.format_exc())

initialize_api_clients()

def sanitize_content(content):
    if isinstance(content, str):
        content = re.sub(r'\033\[\d+m', '', content)
    return content

def format_response(correlation_id, content, status="success"):
    if isinstance(content, str):
        content = sanitize_content(content)
    return {
        "correlation_id": correlation_id,
        "status": status,
        "content": content if status == "success" else None,
        "error": content if status == "error" else None,
        "timestamp": eventlet.hubs.get_hub().clock()
    }

def get_connected_clients_count():
    try:
        participants = socketio.server.manager.get_participants('/', '/')
        return len(participants)
    except (AttributeError, TypeError):
        try:
            namespace = socketio.server.manager.get_namespace('/')
            if namespace:
                return len(namespace.rooms.get('/', set()))
            return 0
        except (AttributeError, KeyError):
            try:
                return len(socketio.server.manager.rooms.get('/', {}).get('/', set()))
            except (AttributeError, KeyError):
                return 0

@socketio.on("connect")
def handle_connect():
    client_id = request.sid
    logger.info(f"Client connected: {client_id}")
    emit("connection_status", format_response(
        correlation_id="system",
        content={
            "service_ready": data_loaded,
            "api_clients_ready": {
                "five_paisa": five_paisa_client is not None,
                "neo": neo_client is not None
            },
            "message": "Financial Chatbot Service"
        }
    ))

@socketio.on("disconnect")
def handle_disconnect():
    client_id = request.sid
    logger.info(f"Client disconnected: {client_id}")

@socketio.on("process_message")
def handle_process_message(data):
    correlation_id = None
    try:
        logger.info(f"Flask received data: {data}")
        if not isinstance(data, dict):
            raise ValueError("Invalid message format")
        correlation_id = data.get("correlation_id") or data.get("correlationId")
        if not correlation_id:
            raise ValueError("Missing correlation ID")
        query = data.get("content", "").strip()
        logger.info(f"Processing message [{correlation_id}]: {query[:50]}...")
        if not data_loaded:
            raise RuntimeError("Stock data not loaded")
        if not query:
            raise ValueError("Empty query received")

        try:
            with Timeout(AI_RESPONSE_TIMEOUT):
                ai_response = process_query(query, stock_data, five_paisa_client, neo_client)
                if isinstance(ai_response, str):
                    response_content = ai_response
                elif isinstance(ai_response, dict):
                    response_content = ai_response
                else:
                    response_content = str(ai_response)
                emit("message_response", format_response(correlation_id, response_content))
        except Timeout:
            error_msg = f"Processing timeout for [{correlation_id}] (>{AI_RESPONSE_TIMEOUT}s)"
            logger.warning(error_msg)
            emit("message_response", format_response(correlation_id, error_msg, status="error"))
    except Exception as e:
        error_msg = f"Error processing [{correlation_id or 'unknown'}]: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        emit("message_response", format_response(correlation_id or "unknown", error_msg, status="error"))

@socketio.on("ping_server")
def handle_ping(data):
    correlation_id = data.get("correlation_id") or "ping"
    logger.info(f"Received ping from client: {correlation_id}")
    emit("pong", {
        "correlation_id": correlation_id,
        "timestamp": eventlet.hubs.get_hub().clock(),
        "status": "connected"
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "up",
        "data_loaded": data_loaded,
        "connected_clients": get_connected_clients_count(),
        "api_clients": {
            "five_paisa": five_paisa_client is not None,
            "neo": neo_client is not None
        }
    })

@app.route('/system/status')
def system_status():
    return jsonify({
        "service": "financial-chatbot",
        "version": "1.0.0",
        "data_loaded": data_loaded,
        "websocket_clients": get_connected_clients_count(),
        "api_clients_status": {
            "five_paisa_ready": five_paisa_client is not None,
            "neo_ready": neo_client is not None
        },
        "stock_data_stats": {
            "entries": len(stock_data),
            "last_updated": "2024-02-20"
        },
        "configuration": {
            "ai_response_timeout": AI_RESPONSE_TIMEOUT,
            "websocket_transports": ["websocket"],
            "cors_origins": ALLOWED_ORIGINS
        }
    })

@app.route('/test')
def test_endpoint():
    return jsonify({
        "message": "Flask server is running",
        "time": eventlet.hubs.get_hub().clock(),
        "websocket_url": "/socket.io/"
    })

@app.route('/api/reinitialize-clients', methods=['POST'])
def reinitialize_clients():
    try:
        initialize_api_clients()
        return jsonify({
            "status": "success",
            "message": "API clients reinitialized",
            "clients": {
                "five_paisa": five_paisa_client is not None,
                "neo": neo_client is not None
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to reinitialize clients: {str(e)}"
        }), 500

if __name__ == "__main__":
    logger.info("Starting Financial Chatbot WebSocket Server...")
    logger.info(f"Data loaded: {data_loaded}")
    logger.info(f"Five Paisa client ready: {five_paisa_client is not None}")
    logger.info(f"Neo client ready: {neo_client is not None}")
    try:
        socketio.run(app, host="127.0.0.1", port=5001, debug=False, allow_unsafe_werkzeug=True, log_output=True)
    except Exception as e:
        logger.error(f"Critical server error: {str(e)}")
        logger.error(traceback.format_exc())
