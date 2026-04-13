const NXS_VERSION = "1.4";
const GITHUB_USER = "Gregorymachado";
const GITHUB_TOKEN = window.env.GITHUB_TOKEN;

let isSyncing = false;
window.currentUser = "";
window.userAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";


let lastEscTime = 0;


const nxs = {
    isDebug: true,
    startTime: 0,
    debug: function(enable) {
        this.isDebug = enable;
        console.clear();
        console.log(`%c 🚀 NXSHUB TORRE DE CONTROLE: ${enable ? 'ATIVADO' : 'DESATIVADO'} `, 'background: #000; color: #0f0; font-family: monospace; font-size: 14px; border: 1px solid #0f0;');
        return `Monitoramento ${enable ? 'ligado' : 'desligado'}.`;
    },
    log: function(origin, msg, data = "", type = "info") {
        if (!this.isDebug) return;
        const time = new Date().toLocaleTimeString();
        let color = "#4285f4"; 
        if (origin === "C++") color = "#f4b400"; 
        if (origin === "PY") color = "#0f9d58"; 
        if (type === "error") color = "#db4437"; 

        console.log(`%c[${time}] %c[${origin}] %c${msg}`, 'color: #888', `color: ${color}; font-weight: bold;`, 'color: #fff', data);
        
        
        const container = document.getElementById('log-content');
        if (container) {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            entry.innerHTML = `<small>${time}</small> [${origin}] ${msg}`;
            container.appendChild(entry);
            container.scrollTop = container.scrollHeight;
        }
    }
};

const appConfig = {
    links: [
    ]
};


window.addEventListener('DOMContentLoaded', () => {
    const savedNick = localStorage.getItem('nxs_nick');
    const savedPhoto = localStorage.getItem('nxs_photo');

    if (savedNick) {
        window.currentUser = savedNick;
        window.userAvatar = savedPhoto || window.userAvatar;
        
        
        const authScreen = document.getElementById('auth-screen');
        if(authScreen) authScreen.style.display = 'none';
        
        const navNick = document.getElementById('nav-username');
        if(navNick) navNick.innerText = window.currentUser;
        
        const navPic = document.getElementById('nav-profile-pic');
        if(navPic) navPic.src = window.userAvatar;

        nxs.log("SISTEMA", `Perfil carregado: ${savedNick}`);
        
        
        sendToCpp({ type: 'get_config' });
        sendToCpp({ 
            type: 'sync_all', 
            username: savedNick, 
            avatar: window.userAvatar 
        });
    } else {
        nxs.log("SISTEMA", "Nenhum perfil local encontrado. Solicitando criação.");
        if(typeof showTab === 'function') showTab('register');
    }

    
    const savedTheme = localStorage.getItem('nxs_theme');
    if (savedTheme && typeof changeTheme === 'function') changeTheme(savedTheme);
});


function sendToCpp(obj) {
    
    if (typeof obj === 'string') {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage(obj);
        }
        return;
    }

    if (isSyncing && (obj.type === "refresh_chat" || obj.type === "save_progress")) return;

    if (window.chrome && window.chrome.webview) {
        nxs.log("JS", ">> ENVIANDO PARA C++:", obj);
        isSyncing = true;

        
        setTimeout(() => {
            if (isSyncing) {
                nxs.log("SISTEMA", "Timeout de segurança atingido. Liberando interface...", "", "error");
                isSyncing = false;
                if (typeof toggleLoading === 'function') toggleLoading(false);
            }
        }, 15000);

        window.chrome.webview.postMessage(JSON.stringify(obj));
    } else {
        nxs.log("JS", "!! ERRO: WebView2 não detectado.", "", "error");
    }
}


if (window.chrome && window.chrome.webview) {
    window.chrome.webview.addEventListener('message', event => {
        let data = event.data;
        if (typeof data === 'string') data = data.trim();

        
        isSyncing = false;
        if (typeof toggleLoading === 'function') toggleLoading(false);

        
        if (typeof data === "string") {
            if (data.startsWith("log|")) {
                nxs.log("PY", data.split("|")[1]);
                return;
            }
            if (data === "toggle_logs") {
                if (typeof toggleLogPanel === 'function') toggleLogPanel();
                return;
            }
            if (data === "toggle_dashboard" || (typeof data === "object" && data.type === "toggle_dashboard")) {
                const agora = Date.now();
                if (agora - lastEscTime < 400) return; 
                lastEscTime = agora;
                
                if (typeof toggleDashboard === 'function') toggleDashboard();
                return;
            }
        }

        if (data !== "ok") nxs.log("C++", `<< RESPOSTA RECEBIDA:`, data);
        
        
        if (data === "profile_ready" || data === "auth_success" || data === "sync_ok") {
            nxs.log("SISTEMA", "Dados sincronizados com sucesso.");
            const authScreen = document.getElementById('auth-screen');
            if(authScreen) authScreen.style.display = 'none';
        } 
        else if (data === "error_timeout") {
            nxs.log("C++", "Timeout no motor Python.", "", "error");
        } 
        else if (data === "failed") {
            nxs.log("PY", "Falha na operação solicitada.", "", "error");
        }
        else {
            
            try {
                let json = null;
                if (typeof data === 'string' && data.includes("ui_update|")) {
                    const jsonStr = data.split("|")[1];
                    json = JSON.parse(jsonStr);
                } else {
                    json = (typeof data === 'string') ? JSON.parse(data) : data;
                }

                if (json) {
                    if (json.type === "toggle_dashboard") {
                        const agora = Date.now();
                        if (agora - lastEscTime < 400) return;
                        lastEscTime = agora;
                        if (typeof toggleDashboard === 'function') toggleDashboard();
                        return;
                    }

                    
                    const innerData = json.type === "ui_update" ? json.data : (json.data ? json.data : json);
                    
                    if (typeof renderDynamicUI === 'function') {
                        renderDynamicUI(innerData);
                    }
                    
                    if (json.type === "debug_log") {
                        nxs.log(json.origin, json.msg);
                    }

                    if (json.type === "toggle_logs") {
                        if (typeof toggleLogPanel === 'function') toggleLogPanel();
                    }
                    
                    if (json.type === "easter_egg") {
                        if (typeof aplicarEasterEgg === 'function') aplicarEasterEgg(json.theme);
                    }

                    if (json.type === "stream_resolved") {
                        if (typeof toggleLoading === 'function') toggleLoading(false);
                        if (typeof openTVChannel === 'function') openTVChannel(json.resolvedUrl + "|Referer=https://piratatvs.com/", true);
                    }
                }
            } catch(e) { 
                
            }
        }
    });
}

nxs.log("SISTEMA", "NXS Core v1.4 Ativo.");