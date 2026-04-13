import json
import requests
import sys
import os
import logging
import re
from dotenv import load_dotenv

load_dotenv()


if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SRC_DIR = os.path.join(BASE_DIR, "src")
if not os.path.exists(SRC_DIR):
    SRC_DIR = BASE_DIR


log_path = os.path.join(BASE_DIR, "sync_debug.log")
logging.basicConfig(
    filename=log_path,
    level=logging.DEBUG,
    format='%(asctime)s - [%(levelname)s] - %(message)s',
    encoding='utf-8'
)

def log_debug(msg):
    print(msg)
    logging.debug(msg)


BIN_ID = "6979a419d0ea881f408c44f1"
API_KEY = os.getenv('JSONBIN_API_KEY')
URL = f"https://api.jsonbin.io/v3/b/{BIN_ID}"
HEADERS = {"X-Master-Key": API_KEY, "Content-Type": "application/json"}

def write_output(msg):
    """Escreve a resposta final garantindo que o C++ consiga ler sem conflito."""
    output_path = os.path.join(SRC_DIR, "sync_out.txt")
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            try:
                if os.path.exists(log_path):
                    with open(log_path, "r", encoding="utf-8") as lr:
                        lines = lr.readlines()[-3:]
                        for line in lines:
                            f.write(f"log|{line.strip()}\n")
            except: pass
            f.write(msg)
    except Exception as e:
        log_debug(f"Erro ao escrever sync_out.txt: {e}")

def resolve_dynamic_link(target_url):
    """Tenta extrair o link real de vídeo de uma página ou resolver redirecionamentos."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Referer': 'https://piratatvs.com/'
    }
    try:
        log_debug(f"Resolvendo link para: {target_url}")
        
        r = requests.get(target_url, headers=headers, timeout=10, allow_redirects=True)
        
        
        if r.url != target_url and (".m3u8" in r.url or ".xml" in r.url):
            return r.url
            
        
        html = r.text
        
        match = re.search(r'["\'](https?://.*?/.*?\.xml(?:\?.*?)?)["\']', html)
        if not match:
            match = re.search(r'["\'](https?://.*?/.*?\.m3u8(?:\?.*?)?)["\']', html)
            
        if match:
            resolved = match.group(1)
            log_debug(f"Link extraído: {resolved}")
            return resolved
            
        return target_url 
    except Exception as e:
        log_debug(f"Erro no Scraper: {e}")
        return target_url

def run():
    log_debug("--- MOTOR SYNC START (v1.5 DYNAMIC) ---")
    input_path = os.path.join(SRC_DIR, "sync_in.json")
    config_path = os.path.join(SRC_DIR, "config.json")
    
    if not os.path.exists(input_path):
        return

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data_in = json.load(f)
        
        action_type = data_in.get("type")
        log_debug(f"Executando: {action_type}")

        
        if action_type == "resolve_stream":
            site_url = data_in.get("url")
            resolved = resolve_dynamic_link(site_url)
            write_output(f"ui_update|{json.dumps({'type':'stream_resolved', 'resolvedUrl': resolved})}\nok")
            return

        
        elif action_type == "get_config":
            if not os.path.exists(config_path):
                default_config = {
                    "links": [
                        {"name": "YOUTUBE", "url": "https://www.youtube.com", "icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png"},
                        {"name": "FILMES / SÉRIES", "url": "https://pomfy.online", "icon": "https://pomfy.online/pomfylogofullcolor.png"},
                        {"name": "B-ANIME", "url": "https://betteranime.io/home/", "icon": "https://i.ibb.co/zTBpXdH8/unnamed.webp"},
                        {"name": "NETFLIX", "url": "https://www.netflix.com", "icon": "https://www.vectorlogo.zone/logos/netflix/netflix-ar21.svg"}
                    ],
                    "tv_channels": []
                }
                with open(config_path, "w", encoding="utf-8") as f:
                    json.dump(default_config, f, indent=4)
            
            with open(config_path, "r", encoding="utf-8") as f:
                app_config = json.load(f)
            write_output(f"ui_update|{json.dumps({'type':'config_load', 'data':app_config})}\nok")
            return

        
        elif action_type == "save_config":
            new_config = data_in.get("config")
            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(new_config, f, indent=4)
            write_output("ok")
            return

        
        resp = requests.get(URL, headers=HEADERS, timeout=12)
        resp.raise_for_status()
        db = resp.json()["record"]
        
        if "users" not in db: db["users"] = {}
        if "chats" not in db: db["chats"] = {}

        needs_save = False
        res_msg = "ok"
        ui_data = None

        
        if action_type in ["setup_profile", "sync_all", "presence"]:
            user = data_in.get("username", "Guest").strip()
            avatar = data_in.get("avatar", "")
            
            if user not in db["users"]:
                db["users"][user] = {"avatar": avatar, "h": {}, "f": []}
                needs_save = True
            else:
                if avatar and db["users"][user].get("avatar") != avatar:
                    db["users"][user]["avatar"] = avatar
                    needs_save = True

            u_data = db["users"][user]
            friends_enriched = []
            for f_name in u_data.get("f", []):
                f_info = db["users"].get(f_name, {})
                friends_enriched.append({
                    "name": f_name,
                    "avatar": f_info.get("avatar", "https://cdn-icons-png.flaticon.com/512/149/149071.png")
                })

            ui_data = {
                "user_info": {"avatar": u_data.get("avatar")},
                "history": u_data.get("h", {}),
                "friends_list": friends_enriched
            }
            res_msg = "profile_ready"

        
        elif action_type == "send_chat":
            sender = data_in.get("currentUser")
            to = data_in.get("to")
            text = data_in.get("message")
            chat_id = "-".join(sorted([sender, to]))
            if chat_id not in db["chats"]: db["chats"][chat_id] = []
            db["chats"][chat_id].append({"from": sender, "text": text})
            db["chats"][chat_id] = db["chats"][chat_id][-30:] 
            needs_save = True

        
        elif action_type == "save_progress":
            user = data_in.get("currentUser", "").strip()
            if user in db["users"]:
                db["users"][user].setdefault("h", {})[data_in["title"]] = {
                    "url": data_in["url"], 
                    "time": data_in["time"]
                }
                needs_save = True

        
        if needs_save:
            requests.put(URL, headers=HEADERS, json=db, timeout=12)

        
        final_output = ""
        if ui_data:
            final_output += f"ui_update|{json.dumps(ui_data)}\n"
        final_output += res_msg
        write_output(final_output)

    except Exception as e:
        log_debug(f"FALHA: {e}")
        write_output(f"log|Erro Motor: {str(e)[:40]}\nfailed")
    finally:
        if os.path.exists(input_path):
            try: os.remove(input_path)
            except: pass

if __name__ == "__main__":
    run()