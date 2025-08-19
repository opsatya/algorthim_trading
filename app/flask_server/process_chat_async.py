"""
Async version of process_chat.py with improved performance and error handling
"""
import asyncio
import aiohttp
import os
import sys
import importlib
import glob
import json
import time
import re
import traceback
import pytz
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from functools import lru_cache
from typing import Dict, List, Optional, Any, Union
import logging

# Import credentials manager
from config.credentials import CredentialsManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Virtual environment activation (same as before)
VENV_5PAISA = "/home/satya/env_5paisa"
VENV_KOTAKNEO = "/home/satya/env_kotakneo"

def activate_venv(venv_path):
    """Activate virtual environment by adding site-packages to sys.path"""
    possible_dirs = glob.glob(os.path.join(venv_path, "lib", "python*", "site-packages"))
    if possible_dirs:
        sys.path.insert(0, possible_dirs[0])
    else:
        logger.error(f"Could not locate site-packages inside: {venv_path}")
        sys.exit(1)

# Activate virtual environments and import modules
activate_venv(VENV_5PAISA)
try:
    py5paisa = importlib.import_module("py5paisa")
    FivePaisaClient = py5paisa.FivePaisaClient
    logger.info("✅ py5paisa module loaded successfully")
except ModuleNotFoundError:
    logger.error("❌ py5paisa module not found. Install it inside env_5paisa.")
    sys.exit(1)

activate_venv(VENV_KOTAKNEO)
try:
    neo_api_client = importlib.import_module("neo_api_client")
    NeoAPI = neo_api_client.NeoAPI
    logger.info("✅ neo_api_client module loaded successfully")
except ModuleNotFoundError:
    logger.error("❌ neo_api_client module not found. Install it inside env_kotakneo.")
    sys.exit(1)

class AsyncTradingBot:
    """Async trading bot with improved architecture"""
    
    def __init__(self):
        self.stock_data = []
        self.five_paisa_client = None
        self.neo_client = None
        self.session = None
        self._initialize_clients()
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    def _initialize_clients(self):
        """Initialize API clients with credentials from environment"""
        try:
            # Initialize 5Paisa client
            five_paisa_cred = CredentialsManager.get_five_paisa_credentials()
            self.five_paisa_client = FivePaisaClient(cred=five_paisa_cred)
            logger.info("✅ 5Paisa client initialized")
            
            # Initialize Neo client
            neo_cred = CredentialsManager.get_neo_credentials()
            self.neo_client = NeoAPI(**neo_cred)
            logger.info("✅ Neo client initialized")
            
        except ValueError as e:
            logger.error(f"❌ Credential error: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Client initialization error: {e}")
            raise
    
    async def login_neo_client(self):
        """Async Neo client login"""
        try:
            login_cred = CredentialsManager.get_neo_login_credentials()
            
            # Run blocking operations in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None, 
                self.neo_client.login,
                login_cred['mobile_number'],
                login_cred['password']
            )
            
            # 2FA with default OTP
            await loop.run_in_executor(
                None,
                self.neo_client.session_2fa,
                login_cred['default_otp']
            )
            
            logger.info("✅ Neo client logged in successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Neo login failed: {e}")
            return False
    
    async def load_stock_data(self, directory='stock_data'):
        """Async stock data loading"""
        data = []
        json_files = glob.glob(os.path.join(directory, "*.json"))
        
        if not json_files:
            raise FileNotFoundError(f"No JSON files found in directory: {directory}")
        
        for file_path in json_files:
            try:
                # Use async file reading in production
                with open(file_path, "r") as file:
                    file_data = json.load(file)
                    if isinstance(file_data, list):
                        data.extend(file_data)
                    elif isinstance(file_data, dict):
                        data.append(file_data)
                    else:
                        logger.warning(f"Unexpected data format in {file_path}")
            except Exception as e:
                logger.error(f"Error loading {file_path}: {e}")
        
        self.stock_data = data
        logger.info(f"✅ Loaded {len(data)} stock records")
        return data
    
    async def get_current_price_async(self, scrip_data: str) -> Optional[float]:
        """Async current price fetching"""
        if not self.five_paisa_client:
            return None
            
        req_data = [{"Exch": "N", "ExchType": "C", "ScripData": scrip_data}]
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                self.five_paisa_client.fetch_market_feed_scrip,
                req_data
            )
            return response['Data'][0]['LastRate']
        except Exception as e:
            logger.error(f"Error fetching price for {scrip_data}: {e}")
            return None
    
    async def place_order_async(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Async order placement"""
        if not self.neo_client:
            return {"success": False, "message": "Neo client not initialized"}
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                self.neo_client.place_order,
                **order_data
            )
            
            if response and response.get('stat') == 'Ok':
                return {
                    "success": True,
                    "order_id": response.get('nOrdNo', 'Not provided'),
                    "message": f"Order placed successfully"
                }
            else:
                return {
                    "success": False,
                    "message": f"Order failed: {response}",
                    "response": response
                }
                
        except Exception as e:
            logger.error(f"Order placement error: {e}")
            return {
                "success": False,
                "message": f"Order placement failed: {str(e)}"
            }
    
    async def send_to_openrouter_async(self, payload: Dict[str, Any], max_retries: int = 3) -> Dict[str, Any]:
        """Async OpenRouter API call"""
        try:
            api_key = CredentialsManager.get_openrouter_api_key()
        except ValueError as e:
            return {"error": str(e)}
        
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        for attempt in range(max_retries):
            try:
                async with self.session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        logger.warning(f"OpenRouter API error (attempt {attempt + 1}): {error_text}")
                        
                        if attempt < max_retries - 1:
                            await asyncio.sleep(2 ** attempt)  # Exponential backoff
                        
            except Exception as e:
                logger.error(f"OpenRouter request error (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
        
        return {
            "choices": [{
                "message": {
                    "content": "Unable to complete analysis due to API error"
                }
            }]
        }
    
    async def process_query_async(self, query: str) -> str:
        """Main async query processing"""
        try:
            lower_query = query.lower()
            
            # Greeting check
            greeting_pattern = r'\b(hi|hello|hey|howdy|hola)\b'
            if re.search(greeting_pattern, lower_query) and len(query.split()) <= 3:
                return "Hello! I'm your async Stock Analysis Chatbot. I can help you analyze financial data or place buy/sell orders for stocks in our database."
            
            # Buy order processing
            buy_match = re.search(r'place buy order for (\d+) shares of (.+)', lower_query)
            if buy_match:
                return await self._process_buy_order(buy_match)
            
            # Sell order processing
            sell_match = re.search(r'place sell order for (\d+) shares of (.+)', lower_query)
            if sell_match:
                return await self._process_sell_order(sell_match)
            
            # Stock analysis
            matched_stock = self._find_stock_from_query(query)
            if matched_stock:
                return await self._analyze_stock_async(matched_stock, query)
            
            # Price queries
            price_keywords = ["current price", "live price", "stock price", "market price", "share price"]
            if any(keyword in lower_query for keyword in price_keywords):
                return await self._get_stock_price_async(query)
            
            # Default response for unmatched queries
            if any(term in lower_query for term in ['stock', 'share', 'market', 'invest', 'finance', 'analysis']):
                return "I don't have information about this specific stock or query in my database. I can help you analyze stocks in my database. Could you ask about one of those instead?"
            else:
                return "I'm specialized in stock analysis based on my financial database. I don't have information to answer this query. Could I help you with analyzing stocks in my database instead?"
                
        except Exception as e:
            logger.error(f"Query processing error: {e}")
            return f"An error occurred while processing your query: {str(e)}"
    
    async def _process_buy_order(self, match) -> str:
        """Process buy order asynchronously"""
        quantity = int(match.group(1))
        stock_name = match.group(2).strip()
        
        matched_stock = self._find_stock_from_query(stock_name)
        if not matched_stock:
            return f"Stock '{stock_name}' not found in database. Try the full name or check available stocks."
        
        stock = next((s for s in self.stock_data if s['Stock'] == matched_stock), None)
        if not stock:
            return "Stock not found in database after matching."
        
        ticker = stock.get('Ticker', '')
        if not ticker:
            return f"No ticker available for {stock['Stock']}."
        
        order_data = {
            'exchange_segment': 'nse_cm',
            'product': 'CNC',
            'price': '0',
            'order_type': 'MKT',
            'quantity': str(quantity),
            'validity': 'DAY',
            'trading_symbol': f"{ticker}-EQ",
            'transaction_type': 'B',
            'amo': "NO",
            'disclosed_quantity': "0",
            'market_protection': "0",
            'pf': "N",
            'trigger_price': "0",
            'tag': None
        }
        
        result = await self.place_order_async(order_data)
        
        if result['success']:
            return f"Buy order placed successfully for {quantity} shares of {stock['Stock']}. Order ID: {result['order_id']}"
        else:
            return f"Failed to place buy order: {result['message']}"
    
    async def _process_sell_order(self, match) -> str:
        """Process sell order asynchronously"""
        quantity = int(match.group(1))
        stock_name = match.group(2).strip()
        
        matched_stock = self._find_stock_from_query(stock_name)
        if not matched_stock:
            return f"Stock '{stock_name}' not found in database. Try the full name or check available stocks."
        
        stock = next((s for s in self.stock_data if s['Stock'] == matched_stock), None)
        if not stock:
            return "Stock not found in database after matching."
        
        ticker = stock.get('Ticker', '')
        if not ticker:
            return f"No ticker available for {stock['Stock']}."
        
        order_data = {
            'exchange_segment': 'nse_cm',
            'product': 'CNC',
            'price': '0',
            'order_type': 'MKT',
            'quantity': str(quantity),
            'validity': 'DAY',
            'trading_symbol': f"{ticker}-EQ",
            'transaction_type': 'S',
            'amo': "NO",
            'disclosed_quantity': "0",
            'market_protection': "0",
            'pf': "N",
            'trigger_price': "0",
            'tag': None
        }
        
        result = await self.place_order_async(order_data)
        
        if result['success']:
            return f"Sell order placed successfully for {quantity} shares of {stock['Stock']}. Order ID: {result['order_id']}"
        else:
            return f"Failed to place sell order: {result['message']}"
    
    async def _get_stock_price_async(self, query: str) -> str:
        """Get stock price asynchronously"""
        matched_stock = self._find_stock_from_query(query)
        if not matched_stock:
            return "Please specify a valid stock name for price lookup."
        
        stock = next((s for s in self.stock_data if s['Stock'] == matched_stock), None)
        if not stock:
            return "Stock not found in database."
        
        ticker = stock.get('Ticker', '')
        if not ticker:
            return f"No ticker available for {stock['Stock']} in the database."
        
        scrip_data = f"{ticker}_EQ"
        current_price = await self.get_current_price_async(scrip_data)
        
        if current_price is not None:
            ist = pytz.timezone('Asia/Kolkata')
            current_time = datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S %Z")
            return f"The current price of {stock['Stock']} ({ticker}) is ₹{current_price} as of {current_time}."
        else:
            return f"Unable to fetch the current price for {stock['Stock']} at this time."
    
    async def _analyze_stock_async(self, stock_name: str, query: str) -> str:
        """Analyze stock asynchronously with AI"""
        stock = next((s for s in self.stock_data if s['Stock'].lower() == stock_name.lower()), None)
        if not stock:
            return f"Stock '{stock_name}' not found in database"
        
        # Get latest year data
        latest_year = max(stock['years'].keys(), default=None)
        if not latest_year:
            return f"No annual data available for {stock['Stock']}"
        
        current_data = stock['years'][latest_year]
        
        # Build AI analysis prompt
        prompt = f"""
        You are a senior financial analyst. Evaluate the following financial metrics for {stock['Stock']} for the fiscal year {latest_year} and provide a detailed analysis:

        ### Metrics:
        - Revenue Growth: {current_data.get('RevenueGrowth', 'Data not available')}%
        - EBITDA Growth: {current_data.get('EBITDAGrowth', 'Data not available')}%
        - Net Profit Margin: {current_data.get('NetProfitMargin', 'Data not available')}%
        - Debt-to-Equity: {current_data.get('DebtToEquity', 'Data not available')}
        - Interest Coverage: {current_data.get('InterestCoverage', 'Data not available')}
        - Promoter Holding: {current_data.get('PromoterHolding', 'Data not available')}%

        Provide:
        1. Score out of 100
        2. Investment recommendation (Strong Buy/Buy/Hold/Risky)
        3. Detailed analysis (200+ words)
        """
        
        payload = {
            "model": "meta-llama/llama-3.3-70b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are a senior financial analyst evaluating stock performance."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1000
        }
        
        response = await self.send_to_openrouter_async(payload)
        content = response.get('choices', [{}])[0].get('message', {}).get('content', 'Analysis unavailable')
        
        return content
    
    def _find_stock_from_query(self, query: str) -> Optional[str]:
        """Find stock from query (synchronous helper)"""
        query_lower = query.lower()
        
        # Exact match first
        for stock in self.stock_data:
            name = stock.get('Stock', '')
            if query_lower == name.lower():
                return name
        
        # Partial match
        for stock in self.stock_data:
            name = stock.get('Stock', '').lower()
            query_words = set(query_lower.split())
            name_words = set(name.split())
            if query_words & name_words:
                return stock.get('Stock')
        
        # Abbreviation mapping
        abbrev_mapping = {
            'asian': 'Asian Paints Limited',
            'itc': 'ITC Limited',
            'coal': 'Coal India Limited',
            'bharti': 'Bharti Airtel Limited',
            'bajaj': 'Bajaj Auto Limited',
            'axis': 'Axis Bank Limited'
        }
        
        for abbrev, full_name in abbrev_mapping.items():
            if abbrev in query_lower:
                if any(s.get('Stock', '').lower() == full_name.lower() for s in self.stock_data):
                    return full_name
        
        return None

# Global bot instance
trading_bot = None

async def initialize_trading_bot():
    """Initialize the global trading bot instance"""
    global trading_bot
    if trading_bot is None:
        trading_bot = AsyncTradingBot()
        await trading_bot.load_stock_data()
        await trading_bot.login_neo_client()
    return trading_bot

async def process_query(query: str, stock_data=None, five_paisa_client=None, neo_client=None) -> str:
    """Main entry point for query processing (maintains backward compatibility)"""
    global trading_bot
    
    try:
        if trading_bot is None:
            trading_bot = await initialize_trading_bot()
        
        async with trading_bot:
            return await trading_bot.process_query_async(query)
            
    except Exception as e:
        logger.error(f"Process query error: {e}")
        return f"An error occurred: {str(e)}"

# Backward compatibility functions
def load_stock_data(directory='stock_data'):
    """Synchronous wrapper for backward compatibility"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        bot = AsyncTradingBot()
        return loop.run_until_complete(bot.load_stock_data(directory))
    finally:
        loop.close()

# Export the main classes and functions
__all__ = [
    'AsyncTradingBot',
    'process_query',
    'load_stock_data',
    'FivePaisaClient',
    'NeoAPI',
    'initialize_trading_bot'
]