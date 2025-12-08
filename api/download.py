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
import imageio_ffmpeg

# Secret key for HMAC signing (MUST MATCH api/mp3.py)
SECRET_KEY = b'super_secret_key_change_this'

def validate_token(token):
    try:
        # Re-add padding if needed
        token += '=' * (-len(token) % 4)
        payload, signature = base64.urlsafe_b64decode(token).rsplit(b'.', 1)
        
        # Verify signature
        expected_signature = hmac.new(SECRET_KEY, payload, hashlib.sha256).digest()
        if not hmac.compare_digest(signature, expected_signature):
            return None
        
        data = json.loads(payload.decode())
        if data['exp'] < time.time():
            return None # Expired
        
        return data['url']
    except Exception:
        return None

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parsing the URL parameters
        parsed_path = urlparse(self.path)
        params = parse_qs(parsed_path.query)
        token = params.get('token', [None])[0]

        if not token:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write('{"error": "Missing token"}'.encode())
            return
            
        url = validate_token(token)
        if not url:
            self.send_response(403)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write('{"error": "Invalid or expired token"}'.encode())
            return

        # Prepare temporary directory
        output_dir = '/tmp'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Handle cookies
        original_cookies = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
        tmp_cookies = os.path.join(output_dir, 'cookies.txt')
        
        if os.path.exists(original_cookies):
            shutil.copy(original_cookies, tmp_cookies)

        # yt-dlp options for download
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }, {
                'key': 'FFmpegMetadata',
                'add_metadata': True,
            }, {
                'key': 'EmbedThumbnail',
            }],
            'writethumbnail': True,
            'outtmpl': os.path.join(output_dir, '%(id)s.%(ext)s'),
            'quiet': True,
            'ffmpeg_location': imageio_ffmpeg.get_ffmpeg_exe(),
        }
        
        if os.path.exists(tmp_cookies):
            ydl_opts['cookiefile'] = tmp_cookies

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                video_id = info.get('id', None)
                title = info.get('title', 'audio')
                
                target_file = None
                for file_name in os.listdir(output_dir):
                    if file_name.startswith(video_id) and file_name.endswith('.mp3'):
                        target_file = os.path.join(output_dir, file_name)
                        break
                
                if target_file and os.path.exists(target_file):
                    # Read file content
                    with open(target_file, 'rb') as f:
                        file_content = f.read()

                    # Send response
                    self.send_response(200)
                    self.send_header('Content-type', 'audio/mpeg')
                    safe_title = "".join([c for c in title if c.isalnum() or c in (' ','-','_')]).strip()
                    self.send_header('Content-Disposition', f'attachment; filename="{safe_title}.mp3"')
                    self.end_headers()
                    self.wfile.write(file_content)

                    # Cleanup
                    try:
                        os.remove(target_file)
                        if os.path.exists(tmp_cookies):
                            os.remove(tmp_cookies)
                    except:
                        pass
                    
                    for file_name in os.listdir(output_dir):
                         if file_name.startswith(video_id):
                             try:
                                 os.remove(os.path.join(output_dir, file_name))
                             except:
                                 pass
                else:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(f'{{"error": "Failed to generate MP3 file"}}'.encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())
