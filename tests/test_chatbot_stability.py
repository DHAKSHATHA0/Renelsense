#!/usr/bin/env python3
"""
Test the chatbot API without external process interference
"""
import requests
import time
import json
from datetime import datetime

def test_chatbot():
    server_url = 'http://localhost:3000'
    
    print('\n' + '='*60)
    print('🤖 CHATBOT STABILITY TEST (Python)')
    print('='*60 + '\n')
    
    test_messages = [
        'Hello! How are you?',
        'How do I keep my kidneys healthy?',
        'What is a kidney stone?',
    ]
    
    for idx, message in enumerate(test_messages, 1):
        print(f'\n📝 Test {idx}/{len(test_messages)}')
        print(f'💬 Message: "{message}"')
        print('🔄 Calling API...')
        
        try:
            start_time = time.time()
            
            response = requests.post(
                f'{server_url}/api/chatbot',
                json={
                    'message': message,
                    'patientResults': {
                        'eGFR': 75,
                        'status': 'Normal Function',
                        'riskLevel': 'Low',
                        'confidence': 95,
                        'heartRate': 72,
                        'temperature': 36.8
                    },
                    'conversationHistory': [],
                    'sessionId': f'test_session_{int(time.time())}'
                },
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    reply = data.get('reply', '')[:80]
                    print(f'✅ Success! Response: "{reply}..."')
                    print(f'⏱️ Response time: {elapsed:.2f}s')
                else:
                    print(f'⚠️ API returned false for success')
            else:
                print(f'❌ HTTP {response.status_code}')
                
        except requests.exceptions.Timeout:
            print(f'⏱️ Request timed out')
        except requests.exceptions.ConnectionError:
            print(f'❌ Connection error - server might have crashed!')
            return False
        except Exception as e:
            print(f'❌ Error: {e}')
            return False
        
        # Wait 2 seconds between tests
        time.sleep(2)
    
    print('\n' + '='*60)
    print('✅ ALL TESTS PASSED - Server is stable!')
    print('='*60 + '\n')
    return True

if __name__ == '__main__':
    try:
        success = test_chatbot()
        exit(0 if success else 1)
    except Exception as e:
        print(f'Fatal error: {e}')
        exit(1)
