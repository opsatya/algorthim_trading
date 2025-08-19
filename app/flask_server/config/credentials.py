"""
Secure credentials management for trading APIs
"""
import os
from dotenv import load_dotenv
from typing import Dict, Optional

# Load environment variables
load_dotenv()

class CredentialsManager:
    """Centralized credentials management"""
    
    @staticmethod
    def get_five_paisa_credentials() -> Dict[str, str]:
        """Get 5Paisa API credentials from environment"""
        required_fields = [
            'FIVE_PAISA_APP_NAME',
            'FIVE_PAISA_APP_SOURCE', 
            'FIVE_PAISA_USER_ID',
            'FIVE_PAISA_PASSWORD',
            'FIVE_PAISA_USER_KEY',
            'FIVE_PAISA_ENCRYPTION_KEY'
        ]
        
        credentials = {}
        missing_fields = []
        
        for field in required_fields:
            value = os.getenv(field)
            if not value:
                missing_fields.append(field)
            else:
                # Map environment variable names to 5Paisa expected keys
                key_mapping = {
                    'FIVE_PAISA_APP_NAME': 'APP_NAME',
                    'FIVE_PAISA_APP_SOURCE': 'APP_SOURCE',
                    'FIVE_PAISA_USER_ID': 'USER_ID',
                    'FIVE_PAISA_PASSWORD': 'PASSWORD',
                    'FIVE_PAISA_USER_KEY': 'USER_KEY',
                    'FIVE_PAISA_ENCRYPTION_KEY': 'ENCRYPTION_KEY'
                }
                credentials[key_mapping[field]] = value
        
        if missing_fields:
            raise ValueError(f"Missing 5Paisa credentials: {', '.join(missing_fields)}")
            
        return credentials
    
    @staticmethod
    def get_neo_credentials() -> Dict[str, str]:
        """Get Kotak Neo API credentials from environment"""
        required_fields = [
            'NEO_CONSUMER_KEY',
            'NEO_CONSUMER_SECRET'
        ]
        
        credentials = {}
        missing_fields = []
        
        for field in required_fields:
            value = os.getenv(field)
            if not value:
                missing_fields.append(field)
            else:
                # Map to expected keys
                key_mapping = {
                    'NEO_CONSUMER_KEY': 'consumer_key',
                    'NEO_CONSUMER_SECRET': 'consumer_secret',
                    'NEO_ACCESS_TOKEN': 'access_token',
                    'NEO_ENVIRONMENT': 'environment',
                    'NEO_FIN_KEY': 'neo_fin_key'
                }
                mapped_key = key_mapping.get(field, field.lower())
                credentials[mapped_key] = value
        
        # Optional fields
        optional_fields = ['NEO_ACCESS_TOKEN', 'NEO_ENVIRONMENT', 'NEO_FIN_KEY']
        for field in optional_fields:
            value = os.getenv(field)
            if value:
                mapped_key = key_mapping.get(field, field.lower())
                credentials[mapped_key] = value
        
        # Set defaults
        credentials.setdefault('environment', 'prod')
        credentials.setdefault('access_token', None)
        credentials.setdefault('neo_fin_key', None)
        
        if missing_fields:
            raise ValueError(f"Missing Neo credentials: {', '.join(missing_fields)}")
            
        return credentials
    
    @staticmethod
    def get_neo_login_credentials() -> Dict[str, str]:
        """Get Neo login credentials for session management"""
        mobile = os.getenv('NEO_MOBILE_NUMBER')
        password = os.getenv('NEO_PASSWORD')
        
        if not mobile or not password:
            raise ValueError("Neo login credentials (mobile/password) not found in environment")
            
        return {
            'mobile_number': mobile,
            'password': password,
            'default_otp': os.getenv('NEO_DEFAULT_OTP', '123456')
        }
    
    @staticmethod
    def get_openrouter_api_key() -> str:
        """Get OpenRouter API key"""
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not found in environment variables")
        return api_key
    
    @staticmethod
    def get_aws_credentials() -> Optional[Dict[str, str]]:
        """Get AWS EC2 credentials for deployment"""
        host = os.getenv('EC2_HOST')
        if not host:
            return None
            
        return {
            'host': host,
            'username': os.getenv('EC2_USERNAME', 'ubuntu'),
            'key_path': os.getenv('EC2_KEY_PATH', ''),
            'remote_script': os.getenv('EC2_REMOTE_SCRIPT_PATH', '')
        }
    
    @staticmethod
    def validate_all_credentials() -> Dict[str, bool]:
        """Validate all credential sets"""
        validation_results = {}
        
        try:
            CredentialsManager.get_five_paisa_credentials()
            validation_results['five_paisa'] = True
        except ValueError:
            validation_results['five_paisa'] = False
            
        try:
            CredentialsManager.get_neo_credentials()
            validation_results['neo'] = True
        except ValueError:
            validation_results['neo'] = False
            
        try:
            CredentialsManager.get_openrouter_api_key()
            validation_results['openrouter'] = True
        except ValueError:
            validation_results['openrouter'] = False
            
        return validation_results

# Convenience functions for backward compatibility
def get_five_paisa_cred():
    """Legacy function name support"""
    return CredentialsManager.get_five_paisa_credentials()

def get_neo_cred():
    """Legacy function name support"""
    return CredentialsManager.get_neo_credentials()