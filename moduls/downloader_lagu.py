import sys
import os
import re
import subprocess
from yt_dlp import YoutubeDL
import json

if len(sys.argv) < 2:
    print('[DOWNLOAD ERROR] Judul lagu tidak diberikan', file=sys.stderr)
    sys.exit(1)

query = ' '.join(sys.argv[1:])
search_keyword = f"ytsearch5:{query}"
output_dir = 'audios'
os.makedirs(output_dir, exist_ok=True)

def sanitize_filename(name):
    return re.sub(r'[^a-zA-Z0-9]', '_', name).lower()

def convert_to_mp3(input_path):
    output_path = os.path.splitext(input_path)[0] + '.mp3'
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', input_path,
            '-vn', '-acodec', 'libmp3lame', '-b:a', '192k',
            output_path
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

        if os.path.exists(output_path):
            os.remove(input_path)
            return output_path
    except Exception as e:
        print(f'[FFMPEG ERROR] {e}', file=sys.stderr)
    return None

try:
    cookies_file = 'cookiesyt.txt'
    if not os.path.exists(cookies_file):
        raise Exception("File cookies tidak ditemukan")

    ydl_opts_info = {
        'quiet': True,
        'skip_download': True,
        'noplaylist': True,
        'cookiefile': cookies_file,
        'default_search': 'ytsearch'
    }

    with YoutubeDL(ydl_opts_info) as ydl:
        search_result = ydl.extract_info(search_keyword, download=False)
        video_info = next((e for e in search_result['entries'] if e.get('duration', 0) >= 60), None)
        if not video_info:
            raise Exception("Tidak ada video cocok")
        video_url = video_info['webpage_url']
        title = sanitize_filename(video_info.get('title', 'audio'))
        output_path = os.path.join(output_dir, f'{title}.mp4')

    ydl_opts_download = {
        'format': '18',
        'quiet': True,
        'outtmpl': output_path,
        'merge_output_format': 'mp4',
        'noplaylist': True,
        'cookiefile': cookies_file,
        'progress_hooks': [lambda d: None]  # Matikan log download
    }

    # Hapus output dari yt-dlp dari stdout
    sys.stdout = open(os.devnull, 'w')

    with YoutubeDL(ydl_opts_download) as ydl2:
        ydl2.download([video_url])

    # Kembalikan stdout
    sys.stdout = sys.__stdout__

    mp3_path = convert_to_mp3(output_path)
    if not mp3_path or not os.path.exists(mp3_path):
        raise Exception("Gagal konversi ke MP3")

    # Cetak hanya file path valid ke stdout
    print(f'::MP3::{mp3_path}')
    print(f'::INFO::{json.dumps({ 
    "title": video_info.get("title", "-"), 
    "uploader": video_info.get("uploader", "-"), 
    "duration": video_info.get("duration", 0)
})}')
except Exception as e:
    sys.stdout = sys.__stdout__  # pastikan stdout dikembalikan
    print(f'[DOWNLOAD ERROR] {e}', file=sys.stderr)
    sys.exit(1)
