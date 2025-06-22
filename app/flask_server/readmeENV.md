# Multi-Environment Setup for Algorithmic Trading Project

This project uses **two isolated Python virtual environments** so that broker SDKs with conflicting dependencies do not interfere with one another or with your system-wide Python installation.

```
~/env_5paisa     →  Python 3.12  +  py5paisa 0.3.4 (sync)
~/env_kotakneo   →  Python 3.11  +  neo_api_client v1.2.1 (async)
```

The Flask server itself lives in its own lightweight _local_ `app/flask_server/venv` and never imports either SDK directly; instead, `process_chat.py` dynamically injects the two external venvs into `sys.path`.

---
## 1. Prerequisites

1. **pyenv** – lets you install multiple Python versions side-by-side.
   ```bash
   curl https://pyenv.run | bash
   exec $SHELL  # reload shell after adding init lines
   ```
2. **Python builds**
   ```bash
   pyenv install 3.12.3   # for 5Paisa (already on system if you used 3.12)
   pyenv install 3.11.7   # for Kotak Neo
   ```

---
## 2. Create the broker virtual-envs

### 2.1  5Paisa (Python 3.12)
```bash
pyenv shell 3.12.3                      # switch only for this command
python -m venv ~/env_5paisa             # create once
source ~/env_5paisa/bin/activate        # enter venv
pip install -U pip setuptools wheel
pip install py5paisa==0.3.4
python - <<'PY'
from py5paisa import FivePaisaClient; print('✅ py5paisa ok')
PY
deactivate
```

### 2.2  Kotak Neo (Python 3.11)
```bash
pyenv shell 3.11.7
python -m venv ~/env_kotakneo
source ~/env_kotakneo/bin/activate
pip install -U pip setuptools wheel
pip install "git+https://github.com/Kotak-Neo/kotak-neo-api.git@v1.2.1#egg=neo_api_client"
python - <<'PY'
import neo_api_client, sys; print('✅ neo_api_client', neo_api_client.__version__)
PY
deactivate
```

_pyenv_ is only used while **creating** the venvs. After that you can be on any global interpreter; the project activates the correct venvs internally.

---
## 3. How the Flask layer finds the SDKs

`process_chat.py` contains:
```python
VENV_5PAISA   = '/home/ubuntu/env_5paisa'
VENV_KOTAKNEO = '/home/ubuntu/env_kotakneo'
```
It appends each environment’s `site-packages` path to `sys.path` **at runtime**.  Nothing is installed into the Flask server’s own `venv`, so there is zero dependency clash.

> If you move the venv folders, just update those two constants.

---
## 4. Typical workflow

1. Activate the local Flask env (created with `python -m venv venv` in `app/flask_server`):
   ```bash
   cd app/flask_server
   source venv/bin/activate
   pip install -r requirements.txt  # standard web deps, no broker SDKs
   python main.py                   # starts WebSocket API on :5001
   ```
2. **No need** to activate `env_5paisa` or `env_kotakneo` manually—the server imports them automatically whenever a chat request needs broker access.

If you want to tinker with either SDK interactively:
```bash
source ~/env_kotakneo/bin/activate  # or env_5paisa
python
>>> from neo_api_client import NeoAPI
```

---
## 5. Troubleshooting

• “module not found” → verify the venv paths are correct and that the SDK was installed in that environment.
• M1/ARM chips may need `NUMPY_ARM64=1` for compiling older NumPy.
• Always keep the two broker envs **out** of your repo to avoid committing thousands of compiled files.

---
Happy trading 🚀
