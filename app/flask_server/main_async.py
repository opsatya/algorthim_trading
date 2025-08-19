"""
Async Flask server with improved WebSocket handling
"""
import eventlet
eventlet.monkey_patch()

import os
import logging
import traceback
import asyncio
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from eventlet.timeout import Timeout

# Import async process_chat functions
from process_chat_async import process_query, initialize_trading_bot

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STOCK_DATA_DIRECTORY = os.path.join(BASE_DIR, "stock_data")
AI_RESPONSE_TIMEOUT = 30

# Initialize application
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Socket.IO
socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://localhost:5173", 
        "http://localhost:3001", 
        "http://localhost:5000",
        "http://localhost:4000",
        "http://127.0.0.1:5000"
    ],
    ping_timeout=60,
    ping_interval=10,
    async_mode='eventlet',
    logger=True,
    engineio_logger=True,
    transports=['websocket']
)

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global state
trading_bot_initialized = False

async def ensure_trading_bot():
    """Ensure trading bot is initialized"""
    global trading_bot_initialized
    if not trading_bot_initialized:
        try:
            await initialize_trading_bot()
            trading_bot_initialized = True
            logger.info("✅ Trading bot initialized successfully")
        except Exception as e:
            logger.error(f"❌ Trading bot initialization failed: {e}")
            raise
    return trading_bot_initialized

def run_async(coro):
    """Run async function in event loop"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    except Exception as e:
        logger.error(f"Async execution error: {e}")
        raise
    finally:
        try:
            loop.close()
        except:
            pass

def format_response(correlation_id, content, status="success"):
    """Standard response format for all messages"""
    return {
        "correlation_id": correlation_id,
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
    
    # Check if trading bot is ready
    try:
        bot_ready = run_async(ensure_trading_bot())
        emit("connection_status", format_response(
            correlation_id="system",
            content={
                "service_ready": bot_ready,
                "message": "Async Financial Chatbot Service Ready"
            }
        ))
    except Exception as e:
        emit("connection_status", format_response(
            correlation_id="system",
            content=f"Service initialization error: {str(e)}",
            status="error"
        ))

@socketio.on("disconnect")
def handle_disconnect():
    """Handle client disconnections"""
    client_id = request.sid
    logger.info(f"Client disconnected: {client_id}")

@socketio.on("process_message")
def handle_process_message(data):
    """Main async message processing handler"""
    correlation_id = None
    try:
        logger.info(f"Flask received data: {data}")
        
        # Validate input format
        if not isinstance(data, dict):
            raise ValueError("Invalid message format")
            
        correlation_id = data.get("correlation_id") or data.get("correlationId")
        if not correlation_id:
            raise ValueError("Missing correlation ID")
            
        query = data.get("content", "").strip()
        logger.info(f"Processing message [{correlation_id}]: {query[:50]}...")
        
        if not query:
            raise ValueError("Empty query received")
        
        # Process query with timeout
        try:
            with Timeout(AI_RESPONSE_TIMEOUT):
                # Run async query processing
                ai_response = run_async(process_query(query))
                
                response = format_response(
                    correlation_id=correlation_id,
                    content=ai_response
                )
                logger.info(f"Sending response for [{correlation_id}]")
                emit("message_response", response)
                
        except Timeout:
            error_msg = f"Processing timeout for [{correlation_id}] (>{AI_RESPONSE_TIMEOUT}s)"
            logger.warning(error_msg)
            emit("message_response", format_response(
                correlation_id=correlation_id,
                content=error_msg,
                status="error"
            ))
            
    except Exception as e:
        error_msg = f"Error processing [{correlation_id or 'unknown'}]: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        emit("message_response", format_response(
            correlation_id=correlation_id or "unknown",
            content=error_msg,
            status="error"
        ))

@socketio.on("ping_server")
def handle_ping(data):
    """Simple ping/pong mechanism"""
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
    try:
        bot_ready = run_async(ensure_trading_bot())
        return jsonify({
            "status": "up",
            "trading_bot_ready": bot_ready,
            "version": "2.0.0-async"
        })
    except Exception as e:
        return jsonify({
            "status": "degraded",
            "trading_bot_ready": False,
            "error": str(e),
            "version": "2.0.0-async"
        }), 503

@app.route('/system/status')
def system_status():
    """Detailed system status"""
    try:
        bot_ready = run_async(ensure_trading_bot())
        return jsonify({
            "service": "async-financial-chatbot",
            "version": "2.0.0",
            "trading_bot_ready": bot_ready,
            "configuration": {
                "ai_response_timeout": AI_RESPONSE_TIMEOUT,
                "websocket_transports": ["websocket"],
                "cors_origins": socketio.cors_allowed_origins
            }
        })
    except Exception as e:
        return jsonify({
            "service": "async-financial-chatbot",
            "version": "2.0.0",
            "trading_bot_ready": False,
            "error": str(e)
        }), 503

@app.route('/test')
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        "message": "Async Flask server is running",
        "time": eventlet.hubs.get_hub().clock(),
        "websocket_url": "ws://127.0.0.1:5001/socket.io/"
    })

@app.route('/api/credentials/validate', methods=['GET'])
def validate_credentials():
    """Validate all API credentials"""
    try:
        from config.credentials import CredentialsManager
        validation_results = CredentialsManager.validate_all_credentials()
        
        return jsonify({
            "status": "success",
            "credentials": validation_results,
            "all_valid": all(validation_results.values())
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Credential validation failed: {str(e)}"
        }), 500

if __name__ == "__main__":
    logger.info("Starting Async Financial Chatbot WebSocket Server...")
    
    try:
        # Initialize trading bot on startup
        run_async(ensure_trading_bot())
        logger.info("✅ Trading bot pre-initialized")
    except Exception as e:
        logger.error(f"❌ Failed to pre-initialize trading bot: {e}")
    
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