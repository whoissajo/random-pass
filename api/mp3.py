from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import yt_dlp
import os
import shutil

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

        # Prepare temporary directory
        output_dir = '/tmp'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Handle cookies
        # Vercel file system is read-only, so we copy cookies.txt to /tmp
        original_cookies = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cookies.txt')
        tmp_cookies = os.path.join(output_dir, 'cookies.txt')
        
        if os.path.exists(original_cookies):
            shutil.copy(original_cookies, tmp_cookies)

        # yt-dlp options
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
        }
        
        # Only add cookiefile if it exists in tmp (copied successfully)
        if os.path.exists(tmp_cookies):
            ydl_opts['cookiefile'] = tmp_cookies

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                video_id = info.get('id', None)
                title = info.get('title', 'audio')
                
                # After post-processing, the file should be .mp3
                # We need to find the file because outtmpl might not correspond 1:1 if postprocessors run
                # Typically yt-dlp updates info dict or we can predict. 
                # With '%(id)s.%(ext)s', and mp3 conversion, it should be start with video_id and end with .mp3
                
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
                    # Safe filename for header
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
                    
                    # Also try to clean up thumbnail if it exists (it might be .jpg or .webp)
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
