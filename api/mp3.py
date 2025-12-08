from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import yt_dlp
import os
import shutil
import json
import time
import hmac
import hashlib
import base64

# Secret key for HMAC signing (should ideally be an env var)
SECRET_KEY = b'super_secret_key_change_this'

def create_token(url):
    exp = int(time.time()) + 60  # 1 minute expiration
    data = json.dumps({'url': url, 'exp': exp}, separators=(',', ':'))
    signature = hmac.new(SECRET_KEY, data.encode(), hashlib.sha256).digest()
    token = base64.urlsafe_b64encode(data.encode() + b'.' + signature).decode().strip('=')
    return token

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parsing the URL parameters
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        url = params.get('url', [None])[0]

        if not url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write('{"error": "Missing url parameter"}'.encode())
            return

        # Prepare temporary directory for cookies handling
        output_dir = '/tmp'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Handle cookies
        original_cookies = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
        tmp_cookies = os.path.join(output_dir, 'cookies.txt')
        if os.path.exists(original_cookies):
            shutil.copy(original_cookies, tmp_cookies)

        # yt-dlp options for metadata extraction
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            # 'cookiefile': tmp_cookies if os.path.exists(tmp_cookies) else None 
        }
        if os.path.exists(tmp_cookies):
            ydl_opts['cookiefile'] = tmp_cookies

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Extract relevant info
                title = info.get('title', 'Unknown')
                thumbnail = info.get('thumbnail', '')
                duration = info.get('duration', 0)
                
                # Create download token
                token = create_token(url)
                
                response_data = {
                    "status": "success",
                    "title": title,
                    "thumbnail": thumbnail,
                    "duration": duration,
                    "download_url": f"/api/download?token={token}"
                }

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
                
                # Cleanup cookies
                if os.path.exists(tmp_cookies):
                    try:
                        os.remove(tmp_cookies)
                    except:
                        pass

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())
