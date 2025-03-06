import json
import requests
import os
import time
import re
import traceback
import glob
from collections import defaultdict
from functools import lru_cache
import sys
import importlib

# Define Virtual Environment Paths
VENV_5PAISA = "/home/ubuntu/env_5paisa"
VENV_KOTAKNEO = "/home/ubuntu/env_kotakneo"

# Function to activate a virtual environment by adding its site-packages to sys.path
def activate_venv(venv_path):
    site_packages = os.path.join(venv_path, "lib", "python3.10", "site-packages")  # Adjust the Python version if needed
    if os.path.exists(site_packages):
        sys.path.insert(0, site_packages)
    else:
        print(f"[ERROR] Virtual environment not found: {venv_path}")
        sys.exit(1)
# Activate 5Paisa Virtual Environment and import py5paisa
activate_venv(VENV_5PAISA)
try:
    py5paisa = importlib.import_module("py5paisa")
    FivePaisaClient = py5paisa.FivePaisaClient
except ModuleNotFoundError:
    print("[ERROR] py5paisa module not found. Install it inside env_5paisa.")
    sys.exit(1)

# Activate Kotak Neo Virtual Environment and import neo_api_client
activate_venv(VENV_KOTAKNEO)
try:
    neo_api_client = importlib.import_module("neo_api_client")
    NeoAPI = neo_api_client.NeoAPI
except ModuleNotFoundError:
    print("[ERROR] neo_api_client module not found. Install it inside env_kotakneo.")
    sys.exit(1)

import json
import requests
import os
import time
import re
import traceback
import glob
import pytz
import paramiko
import neo_api_client
from neo_api_client import NeoAPI
from datetime import datetime, timedelta, timezone
from neo_api_client import NeoAPI
from py5paisa import FivePaisaClient
from collections import defaultdict
from functools import lru_cache  # Added for caching

def safe_float(value, default=0.0):
    """Robust type-agnostic number conversion"""
    if isinstance(value, (int, float)):
        return float(value)
    try:
        cleaned = str(value).replace('%', '').replace(',', '').strip()
        return float(cleaned) if cleaned else default
    except (TypeError, ValueError):
        return default

def load_stock_data(directory='stock_data'):
    data = []
    json_files = glob.glob(os.path.join(directory, "*.json"))
    if not json_files:
        raise FileNotFoundError(f"No JSON files found in directory: {directory}")
    for file_path in json_files:
        try:
            with open(file_path, "r") as file:
                file_data = json.load(file)
                if isinstance(file_data, list):
                    data.extend(file_data)
                elif isinstance(file_data, dict):
                    data.append(file_data)
                else:
                    print(f"Warning: {file_path} contains unexpected data format.")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    return data

def clean_ai_response(text):
    return re.sub(r'[\{\}\"]', '', text).replace("\\n", "\n")

def bold(text):
    return f"\033[1;36m{text}\033[0m"

def text_chart(value, max_value=None, width=20):
    if not max_value:
        max_value = max(value)
    return '▇' * max(1, int((value / max_value) * width))

def trend_icon(value):
    if value > 0:
        return "↑"
    if value < 0:
        return "↓"
    return "→"

def get_prev_year(fy):
    try:
        start = int(fy.split('-')[0])
        return f"{start-1}-{start%1000}"
    except:
        return str(int(fy) - 1)

def format_table(headers, rows):
    col_widths = [
        max(len(str(row[i])) for row in rows + [headers])
        for i in range(len(headers))
    ]
    top_border = "╔" + "╦".join("═" * (w + 2) for w in col_widths) + "╗"
    header_row = "║" + "║".join(f" {header.center(col_widths[i])} " for i, header in enumerate(headers)) + "║"
    separator = "╠" + "╬".join("═" * (w + 2) for w in col_widths) + "╣"
    bottom_border = "╚" + "╩".join("═" * (w + 2) for w in col_widths) + "╝"
    data_rows = []
    for row in rows:
        data_row = "║" + "║".join(f" {str(cell).ljust(col_widths[i])} " for i, cell in enumerate(row)) + "║"
        data_rows.append(data_row)
    return "\n".join([top_border, header_row, separator] + data_rows + [bottom_border])

def generate_explanation_for_table(table_text, context):
    prompt = (context + "\nHere is the table:\n" + table_text +
              "\nPlease provide a detailed explanation in at least 5 lines, including key insights and reasoning on how the conclusion was reached.")
    return cached_openrouter_request("mistralai/mistral-7b-instruct:free",
                                      "You are a senior financial analyst providing detailed insights.",
                                      prompt)

def get_current_price(five_paisa_client, scrip_data):
    """Fetches the current market price using FivePaisaClient."""
    req_data = [{"Exch": "N", "ExchType": "C", "ScripData": scrip_data}]
    try:
        response = five_paisa_client.fetch_market_feed_scrip(req_data)
        return response['Data'][0]['LastRate']
    except Exception as e:
        print(f"Error fetching price: {e}")
        return None

def deploy_remote_script():
    # AWS EC2 Instance Details
    EC2_HOST = "34.229.205.14"  # 🔹 Replace with your EC2 public IP
    USERNAME = "ubuntu"      # 🔹 Replace with your EC2 username
    KEY_PATH = "94463.pem"  # 🔹 Replace with your private key file path
    REMOTE_SCRIPT = "/home/ubuntu/test13/hackathon/deployment.py"  # 🔹 Path of test4.py on EC2

    # Create an SSH client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print("[INFO] Connecting to EC2 instance...")
        ssh.connect(EC2_HOST, username=USERNAME, key_filename=KEY_PATH)

        # Run the script in the background
        command = f"nohup python3 {REMOTE_SCRIPT} > output.log 2>&1 & echo $!"
        stdin, stdout, stderr = ssh.exec_command(command)

        # Get the process ID (PID)
        pid = stdout.read().decode().strip()
        
        # Get current time in IST (UTC+5:30)
        ist_timezone = timezone(timedelta(hours=5, minutes=30))
        current_time = datetime.now(ist_timezone).strftime("%Y-%m-%d %H:%M:%S")
        
        result = (f"[INFO] Script started with PID: {pid}\n"
                  f"[INFO] Check logs using: cat output.log\n"
                  f"Your Algo has been deployed on AWS server with IP {EC2_HOST} at time {current_time} in IST")
    except Exception as e:
        result = f"[ERROR] {str(e)}"
    finally:
        print("[INFO] Connection closed.")
        ssh.close()
    return result

def historical_trend_analysis(stock, metric, start_year=None, years=5):
    all_years = sorted(stock['years'].keys(), reverse=True)
    if start_year:
        filtered_years = [yr for yr in all_years if int(yr.split('-')[0]) >= start_year]
    else:
        filtered_years = all_years
    valid_data = [(yr, stock['years'][yr].get(metric)) for yr in filtered_years[:years] if stock['years'][yr].get(metric) is not None]
    if not valid_data:
        return f"{bold('⚠️ No Data')}: {metric} not available for analysis"
    years_list = [yr for yr, _ in valid_data]
    values = [val for _, val in valid_data]
    max_val = max(values)
    min_val = min(values)
    response = [
        f"{bold('📈 HISTORICAL TREND ANALYSIS')}",
        f"Company: {stock['Stock']} | Metric: {metric} | Period: {years_list[-1]}–{years_list[0]}",
        ""
    ]
    table_data = []
    for yr, val in valid_data:
        prev_val = next((v for y, v in valid_data if y == get_prev_year(yr)), 0)
        # Calculate percentage change for D/E, absolute for others
        if metric == 'DebtToEquity' and prev_val != 0:
            change = ((val - prev_val) / prev_val) * 100
        else:
            change = val - prev_val
        if change > 0:
            trend_text = "Uptrend"
        elif change < 0:
            trend_text = "Downtrend"
        else:
            trend_text = "Stable"
        # Format D/E as ratio, others as percentage
        val_str = f"{val:.2f}" if metric == 'DebtToEquity' else f"{val}%"
        change_str = f"{trend_icon(change)} {abs(change):.1f}%"  # Use .2f for more precision if desired
        table_data.append([yr, val_str, trend_text, change_str])
    table_text = format_table(["Year", "Value", "Trend", "YoY Change"], table_data)
    response.append(table_text)
    # Rest of the function remains unchanged
    response.extend([
        "\n" + bold("🔍 KEY INSIGHTS:"),
        f"- Peak Performance: {max_val}% in {years_list[values.index(max_val)]}",
        f"- Lowest Value: {min_val}% in {years_list[values.index(min_val)]}",
        f"- 3Y Avg: {sum(values[:3]) / 3:.1f}% | 5Y Avg: {sum(values) / len(values):.1f}%"
    ])
    overall_change = values[0] - values[-1]
    if overall_change > 0:
        overall_trend = "uptrend"
    elif overall_change < 0:
        overall_trend = "downtrend"
    else:
        overall_trend = "stable"
    response.append(f"\nOverall, the performance shows an {overall_trend}.")
    explanation = generate_explanation_for_table(table_text,
                    "Analyze the historical trend table above. Describe how the year-over-year changes and average values contribute to the overall trend, and explain key insights from the data.")
    response.append("\n" + explanation)
    return "\n".join(response)

# Add cache clearing to ensure fresh responses
@lru_cache(maxsize=100)
def cached_openrouter_request(model, system_content, user_content):
    # Add this at the start
    if os.getenv('CLEAR_CACHE'):
        cached_openrouter_request.cache_clear()
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content}
        ],
        "temperature": 0.3,
        "max_tokens": 1000  # Increased from 250 to 1000
    }
    response = send_to_openrouter(payload)

    # Handle incomplete responses
    content = response.get('choices', [{}])[0].get('message', {}).get('content', '')
    if not content.endswith(('.','!','?')):
        content += " [Analysis truncated due to length constraints]"

    return content

def annual_report_summarizer(stock, year=None):
    if not year:
        year = max(stock['years'].keys())
    if year not in stock['years']:
        return f"No data available for {year}"
    data = stock['years'][year]
    prompt = f"Create a concise 5-point summary for {stock['Stock']}'s {year} annual report with these metrics: "
    prompt += ", ".join([f"{k}: {v}" for k, v in data.items()])
    system_content = "You are a financial analyst creating concise report summaries."
    return cached_openrouter_request("mistralai/mistral-7b-instruct:free", system_content, prompt)

def financial_health_timeline(stock, metric_filter=None):
    # Enhanced validation
    if metric_filter == 'CashReserve':
        if not any(stock['years'][y].get('CashReserve') is not None for y in stock['years']):
            return "Cash reserve data not available for this stock"

    metrics = ['CashReserve'] if metric_filter == 'CashReserve' else ['DebtToEquity', 'InterestCoverage', 'PromoterHolding']

    timeline_data = []
    for year in sorted(stock['years'].keys(), reverse=True)[:3]:  # Last 3 years
        year_metrics = []
        for metric in metrics:
            if value := stock['years'][year].get(metric):
                if metric == 'CashReserve':
                    year_metrics.append(f"Cash Reserve: ₹{safe_float(value):,.0f} Cr")
                else:
                    year_metrics.append(f"{metric}: {value}")
        if year_metrics:
            timeline_data.append([year, "\n".join(year_metrics)])

    table_text = (f"{bold('🏛️ CASH RESERVE TREND' if metric_filter else '🏛️ FINANCIAL HEALTH TIMELINE')}\n" +
                 format_table(["Year", "Metrics"], timeline_data))
    explanation = generate_explanation_for_table(table_text,
                    "Analyze the cash reserve changes" if metric_filter else
                    "Analyze the financial health timeline")
    return table_text + "\n" + explanation

def performance_forecasting(stock, metric, years=3):
    sorted_years = sorted(stock['years'].keys(), reverse=True)[:years]
    values = [stock['years'][y].get(metric, 0) for y in sorted_years]

    if len(values) < 2:
        return format_table(["Warning"], [["Insufficient data for forecasting"]])

    # Calculate YoY changes using actual previous fiscal years
    growth_rates = []
    for i in range(len(sorted_years)):
        current_year = sorted_years[i]
        prev_year = get_prev_year(current_year)
        prev_value = stock['years'].get(prev_year, {}).get(metric, None)

        if prev_value is not None and prev_value != 0:
            growth = ((values[i] - prev_value) / prev_value) * 100
        else:
            growth = None
        growth_rates.append(growth)

    # Calculate CAGR properly
    cagr = (values[0] / values[-1]) ** (1/(len(values)-1)) - 1

    # Build table with YoY growth
    table_data = []
    for i, (yr, val) in enumerate(zip(sorted_years, values)):
        growth = growth_rates[i]
        table_data.append([
            yr,
            f"{val}%",
            f"{growth:.1f}%" if growth is not None else "-"
        ])

    forecast = values[0] * (1 + cagr)

    table_text = "\n".join([
        f"{bold('📊 PERFORMANCE FORECAST')}",
        f"Metric: {metric} | Basis: {years}Y CAGR",
        format_table(
          ["Year", "Growth Rate", "YoY Change"],
            table_data
                    ),
        f"Projected {metric} for next fiscal year: {forecast:.1f}% ",
        f"CAGR: {cagr * 100:.1f}% | Confidence: {'High' if cagr > 0 else 'Low'}"
    ])

    explanation = generate_explanation_for_table(table_text,
                    "Analyze the performance forecast table above. Explain the year-over-year growth rates and how they contribute to the CAGR.")
    return table_text + "\n" + explanation

def generate_ai_summary(prompt):
    system_content = "You are a financial analyst creating concise report summaries."
    return cached_openrouter_request("mistralai/mistral-7b-instruct:free", system_content, prompt)

def extract_metric(query):
    metrics = {
        'revenue': 'RevenueGrowth',
        'ebitda': 'EBITDAGrowth',
        'debt': 'DebtToEquity',
        'debt ratio': 'DebtToEquity',
        'profit': 'NetProfitMargin',
        'recommendation': 'Verdict',
        'advice': 'Verdict',
        'cash reserve':'CashReserve',  # Add mapping
        'cash':'CashReserve'
    }
    for key, metric in metrics.items():
        if key in query.lower():
            return metric
    return None

def find_stock_from_query(query, stock_data):
    query_lower = query.lower()
    for stock in stock_data:
        name = stock.get('Stock', '')
        if query_lower == name.lower():
            return name
    for stock in stock_data:
        name = stock.get('Stock', '').lower()
        query_words = set(query_lower.split())
        name_words = set(name.split())
        if query_words & name_words:
            return stock.get('Stock')
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
            if any(s.get('Stock', '').lower() == full_name.lower() for s in stock_data):
                return full_name
    return None

def clean_numerical_fields(stock_item):
    if 'years' not in stock_item:
        return
    numerical_fields = [
        'RevenueGrowth', 'EBITDAGrowth', 'NetProfitMargin',
        'DebtToEquity', 'InterestCoverage', 'PromoterHolding',
        'IndustryRanking', 'EPSGrowth'
    ]
    for year, data in stock_item['years'].items():
        for field in numerical_fields:
            if field in data:
                data[field] = safe_float(data[field])

def extract_year(query):
    year_match = re.search(r'(20\d{2}-\d{2})|(FY\s?\d{4})|(20\d{2})', query, re.IGNORECASE)
    if year_match:
        year = year_match.group()
        if '-' in year and len(year) == 7:
            return year
        elif year.lower().startswith('fy'):
            return f"20{year[-2:]}-{str(int(year[-2:])) + 1}"
        else:
            return f"{year}-{str(int(year) + 1)[-2:]}"
    return None

def validate_data_presence(stock, metric):
    required_fields = {
        'revenue': ['RevenueGrowth', 'AnnualReports'],
        'profit': ['NetProfitMargin', 'EBITDA'],
        'debt': ['DebtToEquity'],
        'cash': ['CashReserve']
    }
    latest_year = max(stock['years'])
    missing = [f for f in required_fields.get(metric, []) if f not in stock['years'][latest_year]]
    return missing

# New scoring functions based on the provided rules

def score_revenue_growth(value):
    if value > 15: return {'points': 10, 'display': '++10 (＞15%)'}
    if value > 10: return {'points': 8, 'display': '+8 (10-15%)'}
    if value > 5: return {'points': 5, 'display': '+5 (5-10%)'}
    return {'points': 2, 'display': '+2 (＜5%)'}

def score_ebitda(value):
    if value > 20: return {'points': 15, 'display': '++15 (＞20%)'}
    if value > 15: return {'points': 12, 'display': '+12 (15-20%)'}
    if value > 10: return {'points': 5, 'display': '+5 (10-15%)'}
    return {'points': 2, 'display': '+2 (＜10%)'}

def score_profit(value):
    if value > 20: return {'points': 10, 'display': '++10 (＞20%)'}
    if value > 15: return {'points': 7, 'display': '+7 (15-20%)'}
    if value > 10: return {'points': 5, 'display': '+5 (10-15%)'}
    return {'points': 3, 'display': '+3 (＜10%)'}

def score_debt(value):
    if 1.5 <= value <= 3: return {'points': 5, 'display': '+5 (Optimal 1.5-3)'}
    if value < 1.5: return {'points': 3, 'display': '+3 (Low <1.5)'}
    return {'points': -2, 'display': '-2 (High >3)'}

def score_holding(value):
    if 40 <= value <= 60: return {'points': 5, 'display': '+5 (40-60%)'}
    if value > 60: return {'points': 3, 'display': '+3 (>60%)'}
    return {'points': -1, 'display': '-1 (<40%)'}

def calculate_risks(stock, year):
    risks = {
        'geo_political': -5 if 'paints' in stock['Stock'].lower() else 0,
        'debt_risk': -3 if safe_float(stock['years'][year].get('DebtToEquity', 0)) > 4 else 0,
        'growth_risk': -2 if safe_float(stock['years'][year].get('RevenueGrowth', 0)) < 5 else 0
    }
    return {
        'total': sum(risks.values()),
        'details': "\n".join([f"• {k.replace('_',' ').title()}: {v} pts" for k,v in risks.items() if v < 0])
    }

def get_recommendation(score):
    recommendations = {
        range(80, 101): {
            'text': '✅ Strong Buy',
            'reasons': ['Excellent fundamentals', 'Strong growth trajectory'],
            'outlook': 'High growth potential with strong fundamentals'
        },
        range(60, 80): {
            'text': '🟢 Buy',
            'reasons': ['Good financial metrics', 'Stable growth'],
            'outlook': 'Positive outlook with moderate growth'
        },
        range(40, 60): {
            'text': '🟡 Hold',
            'reasons': ['Mixed performance', 'Moderate risks'],
            'outlook': 'Wait for improved fundamentals'
        },
        range(0, 40): {
            'text': '🔴 Risky - Consider Exit',
            'reasons': ['Weak metrics', 'High risk profile'],
            'outlook': 'Caution advised - monitor closely'
        }
    }
    for range_, details in recommendations.items():
        if score in range_:
            return details
    return {'text': '⚠️ No Recommendation', 'reasons': ['Insufficient data'], 'outlook': 'Cannot determine'}

# Add these NEW functions to handle general stock analysis
def analyze_stock(stock_name, stock_data, year=None):
    """Comprehensive stock analysis combining multiple metrics"""
    stock = next((s for s in stock_data if s['Stock'].lower() == stock_name.lower()), None)
    if not stock:
        return {"error": f"Stock '{stock_name}' not found in database"}

    if not year:
        year = max(stock['years'].keys(), default=None)
        if not year:
            return {"error": "No annual data available for this stock"}

    analysis = {
        "Stock": stock['Stock'],
        "Year": year,
        "Basic Metrics": {},
        "Trend Analysis": {},
        "Financial Health": {},
        "Verdict": stock.get('Verdict', 'No recommendation available')
    }

    # Basic metrics
    current_data = stock['years'].get(year, {})
    analysis["Basic Metrics"] = {
        "Revenue Growth": safe_float(current_data.get('RevenueGrowth')),
        "EBITDA Margin": safe_float(current_data.get('EBITDAGrowth')),
        "Net Profit Margin": safe_float(current_data.get('NetProfitMargin')),
        "ROCE": safe_float(current_data.get('ROCE')),
        "EPS Growth": safe_float(current_data.get('EPSGrowth'))
    }

    # Trend analysis
    analysis["Trend Analysis"] = {
        "3Y Revenue Trend": historical_trend_analysis(stock, 'RevenueGrowth', years=3),
        "5Y Profit Trend": historical_trend_analysis(stock, 'NetProfitMargin', years=5)
    }

    # Financial health
    analysis["Financial Health"] = {
        "Debt Ratio": safe_float(current_data.get('DebtToEquity')),
        "Interest Coverage": safe_float(current_data.get('InterestCoverage')),
        "Promoter Holding": safe_float(current_data.get('PromoterHolding'))
    }

    return analysis

def format_analysis_response(analysis):
    """Format the analysis into a user-friendly report"""
    if 'error' in analysis:
        return f"❌ Error: {analysis['error']}"

    response = [
        f"{bold('🚀 COMPREHENSIVE ANALYSIS')}",
        f"Company: {analysis['Stock']} | Fiscal Year: {analysis['Year']}",
        ""
    ]

    # Basic Metrics Table
    metrics_table = format_table(
        ["Metric", "Value"],
        [[k, f"{v}%"] for k, v in analysis['Basic Metrics'].items()]
    )
    response.extend([bold("📊 KEY METRICS"), metrics_table])

    # Financial Health
    health_table = format_table(
        ["Indicator", "Value"],
        [
            ["Debt-to-Equity", analysis['Financial Health']['Debt Ratio']],
            ["Interest Coverage", analysis['Financial Health']['Interest Coverage']],
            ["Promoter Holding", f"{analysis['Financial Health']['Promoter Holding']}%"]
        ]
    )
    response.extend(["\n" + bold("🏛️ FINANCIAL HEALTH"), health_table])

    # Trend Analysis
    response.extend([
        "\n" + bold("📈 TREND ANALYSIS"),
        analysis['Trend Analysis']['3Y Revenue Trend'],
        "\n" + analysis['Trend Analysis']['5Y Profit Trend']
    ])

    # Verdict
    response.extend([
        "\n" + bold("📌 ANALYST VERDICT"),
        analysis['Verdict']
    ])

    return "\n".join(str(item) for item in response)

# Add these missing forensic functions right before the forensic_analysis function
from collections import defaultdict

def check_benfords_law(stock):
    """Apply Benford's Law to detect accounting anomalies"""
    amounts = []
    for year, data in stock['years'].items():
        if 'Revenue' in data:
            amount = str(int(safe_float(data['Revenue'])))
            if amount:
                amounts.append(amount[0])

    if not amounts:
        return ["Insufficient data for Benford's Law analysis"]

    distribution = defaultdict(int)
    for d in amounts:
        distribution[d] += 1

    total = len(amounts)
    expected = {'1': 30.1, '2': 17.6, '3': 12.5, '4': 9.7,
                '5': 7.9, '6': 6.7, '7': 5.8, '8': 5.1, '9': 4.6}

    anomalies = []
    for digit in '123456789':
        observed = (distribution[digit]/total)*100
        expected_pct = expected[digit]
        if abs(observed - expected_pct) > 5:
            anomalies.append(f"Digit {digit}: {observed:.1f}% vs expected {expected_pct}%")

    return anomalies if anomalies else ["No significant deviations from Benford's Law"]

def detect_insider_trading(stock):
    """Identify suspicious insider trading patterns"""
    trading_data = stock.get('InsiderTrades', [])
    if not trading_data:
        return ["No insider trading data available"]

    last_year = max(stock['years'].keys(), default="")
    recent_trades = [t for t in trading_data if t.get('date', '').startswith(last_year.split('-')[0])]

    if not recent_trades:
        return ["No recent insider trades"]

    sell_ratio = sum(1 for t in recent_trades if t.get('type', '').lower() == 'sell')/len(recent_trades)
    anomalies = []
    if sell_ratio > 0.7:
        anomalies.append(f"High sell ratio ({sell_ratio:.0%}) in current year")
    if any(int(t.get('shares', 0)) > 10000 for t in recent_trades):
        anomalies.append("Large block trades detected")

    return anomalies if anomalies else ["No suspicious insider trading patterns"]

def analyze_revenue_quality(stock):
    """Check for revenue recognition issues"""
    anomalies = []
    for year, data in stock['years'].items():
        rev_growth = safe_float(data.get('RevenueGrowth', 0))
        ar_days = safe_float(data.get('AccountsReceivableDays', 0))

        if rev_growth > 20 and ar_days > 90:
            anomalies.append(f"{year}: High revenue growth ({rev_growth}%) with long AR days ({ar_days})")
        elif rev_growth < -10 and ar_days < 30:
            anomalies.append(f"{year}: Declining revenue ({rev_growth}%) with short AR days ({ar_days})")

    return anomalies if anomalies else ["Consistent revenue quality metrics"]

# The rest of your existing code remains unchanged below
# [All previous functions stay exactly as they were]

def forensic_analysis(stock, year=None):
    """Perform forensic financial analysis on a stock"""
    if not year:
        year = max(stock['years'].keys(), default=None)

    current_data = stock['years'].get(year, {})
    analysis = {
        'benfords_law': check_benfords_law(stock),
        'insider_trading': detect_insider_trading(stock),
        'revenue_quality': analyze_revenue_quality(stock),
        'expense_anomalies': check_expense_anomalies(stock),
        'auditor_issues': check_auditor_remarks(stock),
        'cash_flow': check_cash_flow_anomalies(stock),
        'related_parties': check_related_parties(stock)
    }

    return format_forensic_report(stock, analysis, year)

def check_auditor_remarks(stock):
    """Analyze auditor comments for red flags"""
    anomalies = []
    for year, data in stock['years'].items():
        remarks = data.get('AuditorRemarks', '')
        if any(keyword in remarks.lower() for keyword in ['disclaimer', 'qualified', 'uncertainty', 'material misstatement']):
            anomalies.append(f"{year}: {remarks[:100]}...")
    return anomalies if anomalies else ["No critical auditor remarks found"]

def check_cash_flow_anomalies(stock):
    """Detect cash flow irregularities"""
    anomalies = []
    for year, data in stock['years'].items():
        cash_flow_note = data.get('CashFlowAnomalies', '')
        if any(keyword in cash_flow_note.lower() for keyword in ['irregular', 'dispute', 'non-recurring', 'unexplained']):
            anomalies.append(f"{year}: {cash_flow_note[:100]}...")
    return anomalies if anomalies else ["No significant cash flow anomalies"]

def check_related_parties(stock):
    """Identify problematic related party transactions"""
    anomalies = []
    for year, data in stock['years'].items():
        transactions = data.get('RelatedPartyTransactions', '')
        if any(keyword in transactions.lower() for keyword in ['material', 'significant', 'unapproved', 'non-arm']):
            anomalies.append(f"{year}: Suspicious transactions reported")
    return anomalies if anomalies else ["No problematic related party transactions"]

def check_expense_anomalies(stock):
    """Detect unusual expense patterns"""
    anomalies = []
    for year, data in stock['years'].items():
        if safe_float(data.get('EBITDAGrowth', 0)) < -50 and safe_float(data.get('RevenueGrowth', 0)) > 5:
            anomalies.append(f"{year}: Severe EBITDA decline ({data['EBITDAGrowth']}%) despite revenue growth")
    return anomalies if anomalies else ["No significant expense anomalies"]

def format_forensic_report(stock, analysis, year):
    """Format forensic findings into a report"""
    report = [
        f"{bold('🔍 FORENSIC ANALYSIS')}",
        f"Company: {stock['Stock']} | FY: {year}",
        "\n" + bold("🚩 Benford's Law Analysis:"),
        *[f"• {item}" for item in analysis['benfords_law']],
        "\n" + bold("🚩 Insider Trading Patterns:"),
        *[f"• {item}" for item in analysis['insider_trading']],
        "\n" + bold("🚩 Revenue Quality Check:"),
        *[f"• {item}" for item in analysis['revenue_quality']],
        "\n" + bold("🚩 Expense Anomalies:"),
        *[f"• {item}" for item in analysis['expense_anomalies']],
        "\n" + bold("🚩 Auditor Remarks Analysis:"),
        *[f"• {item}" for item in analysis['auditor_issues']],
        "\n" + bold("🚩 Cash Flow Irregularities:"),
        *[f"• {item}" for item in analysis['cash_flow']],
        "\n" + bold("🚩 Related Party Transactions:"),
        *[f"• {item}" for item in analysis['related_parties']]
    ]

    # Add AI explanation
    prompt = f"""Explain these forensic findings for {stock['Stock']} in under 300 words: {analysis}
Focus on:
1. Most critical red flags
2. Investor implications
3. Recommended next steps
"""
    explanation = cached_openrouter_request("anthropic/claude-3-haiku",
                                           "You're a forensic accountant explaining findings",
                                           prompt)
    report.extend(["\n" + bold("📝 Expert Interpretation:"), clean_ai_response(explanation)])

    return "\n".join(report)

# Updated process_query function
def process_query(query, stock_data, five_paisa_client, neo_client):
        # First check for custom questions
    custom_responses = {
        'who built you': {
            'response': "I was developed by Cancerian Capital Team. made by Avinash,Karan,Vedant and Satya",
            'priority': 1
        },
        'parent company': {
            'response': "My Parent Company is Cancerian Capital",
            'priority': 1
        },
        'your creator': {
            'response': "I was created by a team of full of passion for stock market",
            'priority': 1
        },
        'who are you': {
            'response': "I'm AlgoTrade Assistant - an AI-powered trading companion developed by Cancerian Capital.",
            'priority': 1
        }
    }
    lower_query = query.lower()

    # Greeting check (unchanged)
    greeting_pattern = r'\b(hi|hello|hey|howdy|hola)\b'
    if re.search(greeting_pattern, lower_query) and len(query.split()) <= 3:
        return "Hello! I'm your Stock Analysis Chatbot. I can help you analyze financial data or place buy/sell orders for stocks in our database. To place an order, use 'place buy order for [quantity] shares of [stock]' or 'place sell order for [quantity] shares of [stock]'."

    if lower_query.strip() == "deploy":
      return deploy_remote_script()

    # Forensic triggers (unchanged)
    forensic_triggers = [
        'forensic', 'fraud check', 'accounting anomaly', 'auditor remark',
        'insider trading', 'benford', 'revenue quality', 'cash flow',
        'related party', 'expense anomaly'
    ]
    if any(trigger in lower_query for trigger in forensic_triggers):
        matched_stock = find_stock_from_query(query, stock_data)
        if matched_stock:
            stock = next((s for s in stock_data if s['Stock'].lower() == matched_stock.lower()), None)
            return forensic_analysis(stock)
        return "Please specify a valid stock for forensic analysis"

    # Buy order check with Neo API
    buy_match = re.search(r'place buy order for (\d+) shares of (.+)', lower_query)
    if buy_match:
        quantity = int(buy_match.group(1))
        stock_name = buy_match.group(2).strip()
        matched_stock = find_stock_from_query(stock_name, stock_data)
        if matched_stock:
            stock = next((s for s in stock_data if s['Stock'] == matched_stock), None)
            if stock:
                ticker = stock.get('Ticker', '')
                if not ticker:
                    return f"No ticker available for {stock['Stock']}."
                trading_symbol = f"{ticker}-EQ"  # e.g., 'ITC-EQ'
                try:
                    print(f"Placing buy order with Neo API: symbol={trading_symbol}, quantity={quantity}")
                    response = neo_client.place_order(
                        exchange_segment='nse_cm',
                        product='CNC',
                        price='0',
                        order_type='MKT',
                        quantity=str(quantity),
                        validity='DAY',
                        trading_symbol=trading_symbol,
                        transaction_type='B',  # Buy
                        amo="NO",
                        disclosed_quantity="0",
                        market_protection="0",
                        pf="N",
                        trigger_price="0",
                        tag=None
                    )
                    print(f"Neo API response: {response}")
                    if response and ('stat' in response and response['stat'] == 'Ok'):
                        order_id = response.get('nOrdNo', 'Not provided')
                        return f"Buy order placed successfully for {quantity} shares of {stock['Stock']}. Order ID: {order_id}"
                    elif response and 'code' in response and response['code'] == '900901':
                        return "Authentication failed: Invalid JWT token. Please restart the chatbot and provide a valid OTP."
                    else:
                        return f"Failed to place buy order. Response: {response}"
                except Exception as e:
                    return f"Failed to place buy order with Neo API: {str(e)}"
            else:
                return "Stock not found in database after matching."
        else:
            return f"Stock '{stock_name}' not found in database. Try the full name or check available stocks."

    # Sell order check with Neo API
    sell_match = re.search(r'place sell order for (\d+) shares of (.+)', lower_query)
    if sell_match:
        quantity = int(sell_match.group(1))
        stock_name = sell_match.group(2).strip()
        matched_stock = find_stock_from_query(stock_name, stock_data)
        if matched_stock:
            stock = next((s for s in stock_data if s['Stock'] == matched_stock), None)
            if stock:
                ticker = stock.get('Ticker', '')
                if not ticker:
                    return f"No ticker available for {stock['Stock']}."
                trading_symbol = f"{ticker}-EQ"  # e.g., 'ITC-EQ'
                try:
                    print(f"Placing sell order with Neo API: symbol={trading_symbol}, quantity={quantity}")
                    response = neo_client.place_order(
                        exchange_segment='nse_cm',
                        product='CNC',
                        price='0',
                        order_type='MKT',
                        quantity=str(quantity),
                        validity='DAY',
                        trading_symbol=trading_symbol,
                        transaction_type='S',  # Sell
                        amo="NO",
                        disclosed_quantity="0",
                        market_protection="0",
                        pf="N",
                        trigger_price="0",
                        tag=None
                    )
                    print(f"Neo API response: {response}")
                    if response and ('stat' in response and response['stat'] == 'Ok'):
                        order_id = response.get('nOrdNo', 'Not provided')
                        return f"Sell order placed successfully for {quantity} shares of {stock['Stock']}. Order ID: {order_id}"
                    elif response and 'code' in response and response['code'] == '900901':
                        return "Authentication failed: Invalid JWT token. Please restart the chatbot and provide a valid OTP."
                    else:
                        return f"Failed to place sell order. Response: {response}"
                except Exception as e:
                    return f"Failed to place sell order with Neo API: {str(e)}"
            else:
                return "Stock not found in database after matching."
        else:
            return f"Stock '{stock_name}' not found in database. Try the full name or check available stocks."

    # Rest of the function remains unchanged (omitted for brevity)
    start_year_match = re.search(r'since\s*(\d{4})', query, re.IGNORECASE)
    start_year = int(start_year_match.group(1)) if start_year_match else None
    extracted_year = extract_year(query)
    clean_query = re.sub(r'(20\d{2}-\d{2})|(FY\s?\d{4})|(20\d{2})', '', query, flags=re.IGNORECASE).strip()

    matched_stock = find_stock_from_query(clean_query, stock_data)
    if matched_stock:
        stock = next((s for s in stock_data if s['Stock'].lower() == matched_stock.lower()), None)
        metric = extract_metric(clean_query)
        lower_query = query.lower()

        if "predict" in lower_query and metric:
            return performance_forecasting(stock, metric, years=3)
        elif "summarize" in lower_query or "annual report" in lower_query:
            return annual_report_summarizer(stock, extracted_year)
        elif ("display" in lower_query or "show" in lower_query) and "cash reserve" in lower_query:
            return financial_health_timeline(stock, metric_filter='CashReserve')
        elif "trend" in lower_query and metric:
            return historical_trend_analysis(stock, metric, start_year=start_year)

        price_keywords = ["current price", "live price", "stock price", "market price", "share price"]
        if any(keyword in lower_query for keyword in price_keywords):
            ticker = stock.get('Ticker', '')
            if not ticker:
                return f"No ticker available for {stock['Stock']} in the database."
            scrip_data = f"{ticker}_EQ"
            current_price = get_current_price(five_paisa_client, scrip_data)
            if current_price is not None:
                ist = pytz.timezone('Asia/Kolkata')
                current_time = datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S %Z")
                return f"The current price of {stock['Stock']} ({ticker}) is ₹{current_price} as of {current_time}."
            else:
                return f"Unable to fetch the current price for {stock['Stock']} at this time."

        return generate_scoring_verdict(stock, extracted_year)

    if any(term in lower_query for term in ['stock', 'share', 'market', 'invest', 'finance', 'analysis']):
        return "I don't have information about this specific stock or query in my database. I can help you analyze stocks in my database. Could you ask about one of those instead?"
    else:
        return "I'm specialized in stock analysis based on my financial database. I don’t have information to answer this query. Could I help you with analyzing stocks in my database instead?"
def generate_scoring_verdict(stock, year=None):
    if not year:
        year = max(stock['years'].keys(), default=None)
        if not year:
            return f"{bold('❌ Error')}: No annual data available for {stock['Stock']}"

    current_data = stock['years'][year]
    # Build a prompt that includes key metrics and instructions for the response format
    prompt = f"""
You are a senior financial analyst. Evaluate the following financial metrics for {stock['Stock']} for the fiscal year {year} and provide a **detailed** analysis in the following format:

Score: <number>/100
Recommendation: <text> (Choose from "Strong Buy", "Buy", "Hold", "Risky - Consider Exit")
Analysis: <detailed explanation of at least **200 words**, covering financial health, growth potential, risks, and investor sentiment>

### **Metrics**:
- Revenue Growth: {current_data.get('RevenueGrowth', 'Data not available')}%
- EBITDA Growth: {current_data.get('EBITDAGrowth', 'Data not available')}%
- Net Profit Margin: {current_data.get('NetProfitMargin', 'Data not available')}%
- Debt-to-Equity: {current_data.get('DebtToEquity', 'Data not available')}
- Interest Coverage: {current_data.get('InterestCoverage', 'Data not available')}
- Promoter Holding: {current_data.get('PromoterHolding', 'Data not available')}%

Your response should:
1. **Compare these metrics to industry benchmarks** (if available) and interpret whether they are strong or weak.
2. **Discuss the potential risks** that may concern investors.
3. **Analyze how the company’s financial health aligns with market trends**.
4. **Explain why you assigned the given score**.
5. Provide a **conclusion with a clear investment recommendation**.

**Ensure that your response includes at least 200 words** and starts with "Score: <value>/100" on a new line.
"""
    # Call OpenRouter API using your cached function.
    # Replace "your-model-name" with the actual model identifier you wish to use.
    response_text = cached_openrouter_request(
        "meta-llama/llama-3.3-70b-instruct:free",
        "You are a senior financial analyst evaluating stock performance based solely on provided metrics.",
        prompt
    )
    return response_text


# Helper function for bold text
def bold(text):
    return f"**{text}**"  # Replace with actual formatting as needed


def send_to_openrouter(payload, max_retries=3, retry_delay=5):
    OPENPOUTER_API_KEY='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'
    api_key = os.getenv('OPENROUTER_API_KEY') or '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'
    if not api_key:
        return {"error": "API key not found. Please set OPENROUTER_API_KEY."}
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "<YOUR_SITE_URL>",
        "X-Title": "<YOUR_SITE_NAME>"
    }
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                if "quota" in str(e).lower():
                    print(f"API quota limit reached. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                else:
                    print(f"API error: {str(e)}. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
            else:
                return {
                    "choices": [{
                        "message": {
                            "content": f"Unable to complete analysis due to API error: {str(e)}"
                        }
                    }]
                }
    return {"error": "Exceeded maximum retries."}

def openrouter_chat(query, stock_data, general_chat=False):
    system_message = f"""You are a financial data parser that ONLY uses provided JSON data.
NEVER use prior knowledge. If data isn't available, say so explicitly. Use your thought process and give a ChatGPT-like response.
Available Stock Data:
{json.dumps(stock_data, indent=2)}

Response Rules:
1. Base all answers strictly on the provided JSON.
2. Never mention external sources or dates.
3. Format numbers exactly as in the data.
4. For missing data: "Data not available in provided records"
"""
     # Updated model for the chat functionality
    return cached_openrouter_request("nousresearch/deephermes-3-llama-3-8b-preview:free", system_message, f"Query: {query}\n\nAnswer using ONLY the provided JSON:")

def stream_response(text):
    import sys
    lines = text.split('\n')
    for line in lines:
        if any(c in line for c in ('╔', '║', '╚', '═', '╬')):
            sys.stdout.write(line + '\n')
            sys.stdout.flush()
            time.sleep(0.05)
        else:
            words = re.findall(r'\S+|\n', line)
            for i, word in enumerate(words):
                prefix = ' ' if i > 0 and not word.startswith(('\n', '▇')) else ''
                sys.stdout.write(prefix + word)
                sys.stdout.flush()
                delay = 0.02 if any(c in word for c in ('▇', '→', '↑', '↓')) else 0.03
                time.sleep(delay)
            sys.stdout.write('\n')
            sys.stdout.flush()
        time.sleep(0.01)

def main_chatbot():
    STOCK_DATA_DIRECTORY = 'stock_data'
    stock_data = load_stock_data(STOCK_DATA_DIRECTORY)

    # Initialize FivePaisaClient with provided credentials
    five_paisa_cred = {
        "APP_NAME": "5P50289032",
        "APP_SOURCE": "22145",
        "USER_ID": "jv0zaXaW7lD",
        "PASSWORD": "ZusnUUqsJoh",
        "USER_KEY": "24BLhwIxzMHo31rotJYypWuvYUU4mCHZ",
        "ENCRYPTION_KEY": "FanCs8NKjzunmTmGXgxkOPYS5QUwsXvU"
    }
    five_paisa_client = FivePaisaClient(cred=five_paisa_cred)

    # Initialize NeoAPI with separate credentials
    neo_client = NeoAPI(
        consumer_key="fmHOCOoINQuyTfdB8S_aiiWMdlQa",
        consumer_secret="xjI_osC4q4r4zkWbFpq_Vgw4LTga",
        environment='prod',
        access_token=None,
        neo_fin_key=None
    )

    # NeoAPI login process
    try:
        neo_client.login(mobilenumber="+916303008951", password="Avks@1234")
        neo_client.session_2fa(OTP="271707")
    except Exception as e:
        print(f"NeoAPI login failed: {str(e)}")

    print("Welcome to the Stock Analysis Chatbot! Ask me about a stock or any related questions. 😊")
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ["quit", "exit", "bye"]:
                print("Goodbye! 👋")
                break
            print("\nBot: ", end='', flush=True)
            # Pass both clients to process_query
            response = process_query(user_input, stock_data, five_paisa_client, neo_client)
            stream_response(response)
        except KeyboardInterrupt:
            print("\n\nSession ended abruptly. Thank you for using the chatbot!")
            break
        except Exception as e:
            traceback.print_exc()
            stream_response(f"⚠️ Error: {str(e)}. Please try again.")

if __name__ == "__main__":
    main_chatbot()