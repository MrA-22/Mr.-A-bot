import sys
import os
import re
import subprocess
import requests
import json
from yt_dlp import YoutubeDL
from urllib.parse import unquote
from playwright.sync_api import sync_playwright
class QuietLogger:
    def debug(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): print(msg, file=sys.stderr)

url = sys.argv[1]

output_dir = 'videos'
os.makedirs(output_dir, exist_ok=True)

def sanitize_filename(name):
    name = name.encode('ascii', 'ignore').decode('ascii')
    name = re.sub(r'[\\/*?:"<>|#]', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def convert_video_to_whatsapp(path):
    output_path = os.path.splitext(path)[0] + '_wa.mp4'
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', path,
            '-vf', 'scale=480:-2',
            '-map', '0:v:0',
            '-map', '0:a?',
            '-c:v', 'libx264',
            '-profile:v', 'main',
            '-pix_fmt', 'yuv420p',
            '-preset', 'fast',
            '-crf', '28',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            output_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        os.remove(path)  
        return output_path
    except Exception as e:
        print(f'[FFMPEG ERROR] {e}', file=sys.stderr, flush=True)
        return path

def resolve_redirect(url):
    try:
        r = requests.head(url, allow_redirects=True, timeout=10)
        return r.url
    except:
        return url

def extract_tiktok_slideshow_photos(play_url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent='Mozilla/5.0')
        page = context.new_page()
        page.goto(play_url, timeout=30000)
        page.wait_for_selector('script#SIGI_STATE', timeout=30000)
        html = page.content()
        context.close()
        browser.close()

    match = re.search(r'<script id="SIGI_STATE"[^>]*>(.*?)</script>', html)
    if not match:
        raise Exception('Tidak menemukan data TikTok')

    state = json.loads(match.group(1))
    images = []

    for item in state.get('ItemModule', {}).values():
        if item.get('imagePost', {}).get('images'):
            images = [img.get('urlList', [])[0] for img in item['imagePost']['images']]
            break

    if not images:
        raise Exception('Tidak ada foto ditemukan')

    downloaded = []
    for idx, img_url in enumerate(images):
        filename = os.path.join(output_dir, f"tiktok_photo_{idx+1}.jpg")
        response = requests.get(img_url, timeout=30)
        with open(filename, 'wb') as f:
            f.write(response.content)
        downloaded.append(os.path.abspath(filename))

    return downloaded

resolved_url = resolve_redirect(url)

if 'tiktok.com' in resolved_url and '/photo/' in resolved_url:
    try:
        photos = extract_tiktok_slideshow_photos(resolved_url)
        if not photos:
            raise Exception('Gagal ambil foto')
        print(os.path.abspath(photos[0]), flush=True)
        sys.exit(0)
    except Exception as e:
        print(f'[DOWNLOAD ERROR] {e}', file=sys.stderr, flush=True)
        sys.exit(1)

try:
    ydl_opts_check = {
    'quiet': True,
    'noplaylist': True,
    'no_warnings': True,
    'skip_download': True,
    'cookies': './ig_cookies.txt',
    'logger': QuietLogger()
}


    with YoutubeDL(ydl_opts_check) as ydl:
        info = ydl.extract_info(resolved_url, download=False)

        if info.get('_type') == 'playlist' and 'entries' in info:
            paths = []
            for i, entry in enumerate(info['entries']):
                img_url = entry.get('url') or entry.get('thumbnail')
                if not img_url:
                    continue
                ext = os.path.splitext(img_url.split('?')[0])[1]
                filename = f"{sanitize_filename(info.get('title', 'slideshow'))}_{i+1}{ext}"
                save_path = os.path.join(output_dir, filename)

                try:
                    response = requests.get(img_url, timeout=30)
                    with open(save_path, 'wb') as f:
                        f.write(response.content)
                    paths.append(os.path.abspath(save_path))
                except Exception as e:
                    print(f'[IMG DOWNLOAD ERROR] {e}', file=sys.stderr, flush=True)

            if paths:
                print(paths[0], flush=True)
                sys.exit(0)
            else:
                raise Exception('Tidak ada gambar di playlist')

        ydl_opts_download = {
            'format': 'bv*+ba/best',
            'quiet': True,
            'no_warnings': True,
            'outtmpl': os.path.join(output_dir, '%(title).80s.%(ext)s'),
            'cookies': './ig_cookies.txt',
            'progress_with_newline': False,
            'progress_hooks': [],
            'logger': QuietLogger()
    }

    with YoutubeDL(ydl_opts_download) as ydl2:
        result = ydl2.extract_info(resolved_url, download=True)
        filename = ydl2.prepare_filename(result)
        base = os.path.basename(filename)
        clean = sanitize_filename(base)
        clean_path = os.path.join(output_dir, clean)

        if clean_path != filename:
            os.rename(filename, clean_path)

        ext = os.path.splitext(clean_path)[1].lower()
        final_path = convert_video_to_whatsapp(clean_path) if ext == '.mp4' else clean_path

        # === OUTPUT KE NODE.JS ===
        print(os.path.abspath(final_path), flush=True)
        print('::INFO::' + json.dumps({
    'title': result.get('title', '-'),
    'uploader': result.get('uploader', '-'),
    'view_count': result.get('view_count') or 0,
    'like_count': result.get('like_count') or 0,
    'comment_count': result.get('comment_count') or 0,
    'duration': result.get('duration') or 0,
    'upload_date': result.get('upload_date', '-'),
    'description': result.get('description', '')[:100]
    }), flush=True)

except Exception as e:
    print(f'[DOWNLOAD ERROR] {e}', file=sys.stderr, flush=True)
    sys.exit(1)
