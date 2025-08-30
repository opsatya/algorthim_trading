import os

# Ensure production mode for hosted environment
os.environ.setdefault('NODE_ENV', 'production')

from main import app, socketio  # main.py must be in same folder

# Gunicorn entrypoint expects a callable; for SocketIO use the server object
application = app  # optional, not used with eventlet pattern
# We will point gunicorn to "wsgi:app" or "wsgi:application" or use module:function

# If running directly (local debug)
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
