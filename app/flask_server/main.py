import eventlet
eventlet.monkey_patch()

import os
import logging
import traceback
import re
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

# Import process_chat.py functions
from process_chat import process_query, load_stock_data

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STOCK_DATA_DIRECTORY = os.path.join(BASE_DIR, "stock_data")
AI_RESPONSE_TIMEOUT = 15  # seconds

# Initialize application
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Socket.IO
socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:5173", "http://localhost:3001", "http://localhost:5000"],
    ping_timeout=60,
    ping_interval=10,
    async_mode='eventlet',
    logger=True,
    engineio_logger=True,
    transport='websocket'
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

def sanitize_content(content):
    """Remove ANSI escape codes and handle other special formatting"""
    if isinstance(content, str):
        # Remove ANSI color codes
        content = re.sub(r'\033\[\d+m', '', content)
        
        # Other sanitization can be added here if needed
        # For example, converting markdown to a format the frontend can handle
        
    return content

def format_response(correlation_id, content, status="success"):
    """Standard response format for all messages"""
    
    # Sanitize content if it's a string
    if isinstance(content, str):
        content = sanitize_content(content)
        
    return {
        "correlation_id": correlation_id,  # Use snake_case consistently for Flask
        "status": status,
        "content": content if status == "success" else None,
        "error": content if status == "error" else None,
        "timestamp": eventlet.hubs.get_hub().clock()
    }

# WebSocket Event Handlers
@socketio.on("connect")
def handle_connect():
    """Handle new WebSocket connections"""
    client_id = request.sid
    logger.info(f"Client connected: {client_id}")
    emit("connection_status", format_response(
        correlation_id="system",
        content={
            "service_ready": data_loaded,
            "message": "Financial Chatbot Service"
        }
    ))

@socketio.on("disconnect")
def handle_disconnect():
    """Handle client disconnections"""
    client_id = request.sid
    logger.info(f"Client disconnected: {client_id}")

@socketio.on("process_message")
def handle_process_message(data):
    """Main message processing handler"""
    try:
        logger.info(f"Flask received data: {data}")
        # Validate input format
        if not isinstance(data, dict):
            raise ValueError("Invalid message format")
            
        # Support both correlation_id and correlationId formats
        correlation_id = data.get("correlation_id") or data.get("correlationId")
        if not correlation_id:
            raise ValueError("Missing correlation ID")
            
        query = data.get("content", "").strip()
        
        logger.info(f"Processing message [{correlation_id}]: {query[:50]}...")
        
        if not data_loaded:
            raise RuntimeError("Stock data not loaded")
            
        if not query:
            raise ValueError("Empty query received")
        
        # Process query with timeout
        with eventlet.Timeout(AI_RESPONSE_TIMEOUT, False):
            ai_response = process_query(query, stock_data)
            # Check response format
            if isinstance(ai_response, str):
                # It's a simple string, keep as is
                response_content = ai_response
            elif isinstance(ai_response, dict):
                # It's already a dict, use it as content
                response_content = ai_response
            else:
                # Convert to string for safety
                response_content = str(ai_response)
                
            response = format_response(
                correlation_id=correlation_id,
                content=response_content
            )
            logger.info(f"Sending response for [{correlation_id}]")
            emit("message_response", response)
            
    except eventlet.Timeout:
        error_msg = f"Processing timeout for [{correlation_id}]"
        logger.warning(error_msg)
        emit("message_response", format_response(
            correlation_id=correlation_id,
            content=error_msg,
            status="error"
        ))
        
    except Exception as e:
        error_msg = f"Error processing [{correlation_id}]: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        emit("message_response", format_response(
            correlation_id=correlation_id,
            content=error_msg,
            status="error"
        ))

# Add a ping handler to test connectivity
@socketio.on("ping_server")
def handle_ping(data):
    """Simple ping/pong mechanism to verify connectivity"""
    correlation_id = data.get("correlation_id") or "ping"
    logger.info(f"Received ping from client: {correlation_id}")
    emit("pong", {
        "correlation_id": correlation_id,
        "timestamp": eventlet.hubs.get_hub().clock(),
        "status": "connected"
    })

# HTTP Endpoints
@app.route('/health')
def health_check():
    """Service health endpoint"""
    return jsonify({
        "status": "up",
        "data_loaded": data_loaded,
        "connected_clients": len(socketio.server.manager.rooms)
    })

@app.route('/system/status')
def system_status():
    """Detailed system status"""
    return jsonify({
        "service": "financial-chatbot",
        "version": "1.0.0",
        "data_loaded": data_loaded,
        "websocket_clients": len(socketio.server.manager.rooms),
        "stock_data_stats": {
            "entries": len(stock_data),
            "last_updated": "2024-02-20"  # Add actual timestamp
        }
    })

@app.route('/test')
def test_endpoint():
    """Test endpoint to verify HTTP is working"""
    return jsonify({
        "message": "Flask server is running",
        "time": eventlet.hubs.get_hub().clock()
    })

if __name__ == "__main__":
    logger.info("Starting Financial Chatbot WebSocket Server...")
    try:
        socketio.run(
            app, 
            host="127.0.0.1", 
            port=5001, 
            debug=False,
            allow_unsafe_werkzeug=True,
            log_output=True
        )
    except Exception as e:
        logger.error(f"Critical server error: {str(e)}")
        logger.error(traceback.format_exc())