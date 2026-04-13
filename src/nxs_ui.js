
const nxs = {
    log: (tag, msg) => {
        const container = document.getElementById('log-content');
        if (!container) {
            console.log(`[${tag}] ${msg}`);
            return;
        }

        const entry = document.createElement('div');
        
        let typeClass = 'log-info';
        const t = tag.toUpperCase();
        
        if (t === 'SISTEMA' || t === 'SYS') typeClass = 'log-sys';
        else if (t === 'THEME') typeClass = 'log-theme';
        else if (t === 'AUDIO') typeClass = 'log-audio';
        else if (t === 'ERRO' || t === 'ERROR') typeClass = 'log-erro';
        else if (t === 'CHEAT') typeClass = 'log-cheat';

        entry.className = `log-entry ${typeClass}`;
        
        entry.innerHTML = `
            <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</small>
            <span style="opacity: 0.7">[${tag}]</span> ${msg}
        `;

        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;

        if (container.children.length > 200) container.removeChild(container.firstChild);
    }
};

function toggleLogPanel() {
    const p = document.getElementById('nxs-log-panel');
    if (!p) return;
    if (p.style.display === 'flex') {
        p.style.display = 'none';
    } else {
        p.style.display = 'flex';
        setTimeout(() => document.getElementById('nxs-cmd-input')?.focus(), 100);
    }
}


const eggBase = "C:/Users/Administrator/Documents/NxsHub/src/Musicas/Eggs/";
let eggAudio = null;

function runNxsCommand(cmd) {
    const command = cmd.toLowerCase().trim();
    if (!command) return;

    if (eggAudio) { eggAudio.pause(); eggAudio = null; }
    
    
    document.body.classList.remove('egg-spinning', 'egg-rgb', 'egg-picapau', 'egg-space', 'egg-matrix', 'egg-horror', 'egg-thanos', 'egg-money', 'egg-disco');
    document.querySelectorAll('.egg-element, .blood-drop, .matrix-column, .invader, .egg-extra, .pica-pau-pop, .tut-box').forEach(el => el.remove());
    if (window.eggInterval) clearInterval(window.eggInterval);
    if (document.getElementById('nxs-minigame')) document.getElementById('nxs-minigame').remove();
    window.onclick = null;

    nxs.log("CHEAT", "Protocolo: " + command);

    switch(command) {
        case 'around the world':
            nxs.log("CHEAT", "🌎 MUNDO EM ROTAÇÃO MÁXIMA!");
            document.body.classList.add('egg-spinning', 'egg-rgb');
            playEggMusic("around.mp3");
            break;

        case 'pica pau':
            nxs.log("CHEAT", "🐦 VOCÊ CAIU NA VILA DO PICA-PAU!");
            document.body.classList.add('egg-picapau');
            playEggMusic("picapau.mp3");
            if (typeof CanvasEngine !== 'undefined') CanvasEngine.start('pica-pau');
            window.onclick = (e) => {
                new Audio(eggBase + "tapeado.mp3").play();
                const p = document.createElement('div');
                p.className = 'egg-element pica-pau-pop';
                p.style.left = e.clientX + 'px';
                p.style.top = e.clientY + 'px';
                p.innerHTML = "🐦";
                document.body.appendChild(p);
                setTimeout(() => p.remove(), 1000);
            };
            break;

        case 'star wars':
            nxs.log("CHEAT", "🌌 INVASÃO DO ESPAÇO INICIADA.");
            document.body.classList.add('egg-space');
            playEggMusic("vader.mp3");
            startSpaceInvaders();
            break;

        case 'matrix':
            nxs.log("CHEAT", "💊 ENTRANDO NA CONSTRUÇÃO...");
            document.body.classList.add('egg-matrix');
            playEggMusic("matrix.mp3");
            startMatrixRain();
            break;

        case 'horror':
            nxs.log("CHEAT", "🩸 O HUB ESTÁ SANGRANDO.");
            document.body.classList.add('egg-horror');
            playEggMusic("horror.mp3");
            startBloodRain();
            break;

        case 'thanos':
            nxs.log("SYS", "Equilibrando o universe...");
            document.body.classList.add('egg-thanos');
            setTimeout(() => {
                document.querySelectorAll('.card').forEach((c, i) => {
                    if(i % 2 === 0) c.style.opacity = '0';
                });
            }, 2000);
            break;

        case 'money':
            playEggMusic("money.mp3");
            startRain("💵");
            break;

        case 'rain':
            startRain("🌧️");
            break;

        case 'disco':
            document.body.classList.add('egg-disco');
            playEggMusic("disco.mp3");
            break;

        case 'doge':
            startRain("🐕");
            break;

        case 'cat':
            startRain("🐱");
            break;

        case 'hack':
            startMatrixRain();
            nxs.log("SYS", "Acessando mainframe da NASA...");
            break;

        case 'love':
            startRain("❤️");
            break;

        case 'fire':
            startRain("🔥");
            break;

        case 'game':
            startNxsGame();
            break;

        case 'tutorial':
            startTutorial();
            break;

        case 'minecraft':
            if (typeof CanvasEngine !== 'undefined') CanvasEngine.start('minecraft');
            nxs.log("SYS", "Sssshhh... BOOM!");
            break;

        case 'clear':
            nxs.log("SYS", "Resetando ambiente...");
            location.reload();
            break;

        default:
            nxs.log("ERRO", "Protocolo desconhecido.");
    }
}

function playEggMusic(file) {
    eggAudio = new Audio(eggBase + file);
    eggAudio.loop = true;
    eggAudio.volume = localStorage.getItem('nxs_forced_volume') || 0.5;
    eggAudio.play().catch(() => nxs.log("SYS", "Interaja com o hub para o som iniciar."));
}

function startMatrixRain() {
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&*%".split("");
    for(let i=0; i<40; i++) {
        const col = document.createElement('div');
        col.className = 'matrix-column';
        col.style.left = Math.random() * 100 + "vw";
        col.style.animationDuration = (Math.random() * 2 + 1) + "s";
        col.style.animationDelay = Math.random() * 2 + "s";
        col.innerText = chars[Math.floor(Math.random()*chars.length)];
        document.body.appendChild(col);
        setInterval(() => { col.innerText = chars[Math.floor(Math.random()*chars.length)]; }, 100);
    }
}

function startBloodRain() {
    window.eggInterval = setInterval(() => {
        const drop = document.createElement('div');
        drop.className = 'blood-drop';
        drop.style.left = Math.random() * 100 + "vw";
        drop.style.width = Math.random() * 5 + 2 + "px";
        drop.style.height = Math.random() * 60 + 30 + "px";
        drop.style.animationDuration = (Math.random() * 1.5 + 0.5) + "s";
        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 2000);
    }, 80);
}

function startSpaceInvaders() {
    const ships = ["🛸", "👾", "🛰️", "🚀"];
    window.eggInterval = setInterval(() => {
        if (!document.body.classList.contains('egg-space')) return;
        const invader = document.createElement('div');
        invader.className = 'invader';
        invader.style.top = Math.random() * 80 + "vh";
        invader.innerHTML = ships[Math.floor(Math.random()*ships.length)];
        document.body.appendChild(invader);
        setTimeout(() => invader.remove(), 6000);
    }, 1200);
}

function startRain(emoji) {
    window.eggInterval = setInterval(() => {
        const el = document.createElement('div');
        el.className = 'egg-extra';
        el.style.left = Math.random() * 100 + "vw";
        el.innerHTML = emoji;
        el.style.position = 'fixed';
        el.style.top = '-50px';
        el.style.fontSize = '30px';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        el.style.transition = 'transform 2s linear';
        document.body.appendChild(el);
        setTimeout(() => { el.style.transform = 'translateY(115vh)'; }, 10);
        setTimeout(() => el.remove(), 2500);
    }, 150);
}


function toggleVisualSub() {
    const sub = document.getElementById('visual-subs');
    if (!sub) return;
    const isShowing = (sub.style.display === 'flex' || sub.style.display === 'block');
    sub.style.display = isShowing ? 'none' : 'flex';
    
    
    const blue = getComputedStyle(document.body).getPropertyValue('--neon-blue').trim();
    document.querySelectorAll('.nxs-arrow').forEach(a => {
        a.style.filter = `brightness(0) invert(1) drop-shadow(0 0 5px ${blue})`;
    });
}


function toggleButtonVisibility(btnName, isChecked) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (card.innerText.toUpperCase().includes(btnName.toUpperCase())) {
            card.style.display = isChecked ? 'flex' : 'none';
        }
    });
    localStorage.setItem(`btn_vis_${btnName}`, isChecked);
}

function renderVisibilityList() {
    const container = document.getElementById('btn-toggle-list');
    if (!container || typeof appConfig === 'undefined' || !appConfig.links) return;
    container.innerHTML = appConfig.links.map(l => {
        const isVisible = localStorage.getItem(`btn_vis_${l.name}`) !== 'false';
        return `
            <div class="premium-switch-row">
                <span>${l.name}</span>
                <div class="nxs-switch ${isVisible ? 'active' : ''}" onclick="nxsToggle(this, '${l.name}')">
                    <div class="nxs-knob"></div>
                </div>
            </div>
        `;
    }).join('');
}

function nxsToggle(el, btnName) {
    const isActive = el.classList.toggle('active');
    toggleButtonVisibility(btnName, isActive);
}


function startNxsGame() {
    nxs.log("CHEAT", "Iniciando NXS DEFENDER...");
    toggleDashboard();
    const gameOverlay = document.createElement('div');
    gameOverlay.id = 'nxs-minigame';
    gameOverlay.innerHTML = `
        <div id='game-ui' style="position:fixed; top:20px; left:20px; color:white; font-family:monospace; z-index:200001; font-size:20px;">PONTOS: <span id='score'>0</span> | ESC PARA SAIR</div>
        <div id='player' style="position:absolute; bottom:20px; left:50%; font-size:50px; transition: 0.1s;">🛸</div>
    `;
    document.body.appendChild(gameOverlay);

    let score = 0;
    const spawnEnemy = () => {
        if (!document.getElementById('nxs-minigame')) return;
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.innerHTML = "👾";
        enemy.style.cssText = `position:absolute; top:-50px; font-size:40px; cursor:crosshair; transition: transform 4s linear; left: ${Math.random() * 90}vw; z-index:200001;`;
        gameOverlay.appendChild(enemy);
        
        setTimeout(() => { enemy.style.transform = 'translateY(110vh)'; }, 10);
        setTimeout(() => { if(enemy.parentNode) enemy.remove(), 4000});

        enemy.onclick = () => {
            score += 10;
            document.getElementById('score').innerText = score;
            enemy.innerHTML = "💥";
            setTimeout(() => enemy.remove(), 200);
        };
        window.eggInterval = setTimeout(spawnEnemy, 1000 - Math.min(score, 800));
    };
    spawnEnemy();
}


function startTutorial() {
    const tutorialData = [
        { target: ".profile-trigger", text: "Gerencie seu perfil e badges de conquista aqui." },
        { target: "#main-grid", text: "Estes são seus aplicativos. Clique para abrir ou use o botão direito para gerenciar." },
        { target: "#nxs-cmd-input", text: "Digite comandos secretos aqui no Terminal Log (CTRL+L)." },
        { target: ".dash-menu-items", text: "No Menu ESC, você customiza temas, músicas e gerencia botões!" }
    ];
    
    const dash = document.getElementById('nxs-dashboard');
    if(dash) dash.style.display = 'none'; 

    let step = 0;
    const overlay = document.getElementById('tut-overlay');
    if(overlay) overlay.style.display = 'block';

    const renderStep = () => {
        document.querySelectorAll('.tut-box').forEach(b => b.remove());

        if (step >= tutorialData.length) {
            if(overlay) overlay.style.display = 'none';
            return;
        }
        
        const data = tutorialData[step];
        const el = document.querySelector(data.target);
        if (!el) { step++; renderStep(); return; }

        const rect = el.getBoundingClientRect();
        
        if(overlay) {
            overlay.style.setProperty('--x', (rect.left + rect.width / 2) + 'px');
            overlay.style.setProperty('--y', (rect.top + rect.height / 2) + 'px');
        }

        const box = document.createElement('div');
        box.className = 'tut-box';
        box.style.left = '50%';
        box.style.top = '70%';
        box.style.transform = 'translateX(-50%)';
        box.innerHTML = `<p style="margin-bottom:20px; font-size:18px;">${data.text}</p><button onclick="window.nextTutStep()" style="background:var(--neon-blue); color:black; border:none; padding:10px 25px; font-weight:bold; border-radius:10px; cursor:pointer; text-transform:uppercase;">OK</button>`;
        
        document.body.appendChild(box);
    };

    window.nextTutStep = () => { step++; renderStep(); };
    renderStep();
}


function toggleDashboard() {
    const dash = document.getElementById('nxs-dashboard');
    if (!dash) return;
    if (dash.style.display === 'flex') {
        dash.style.opacity = '0';
        setTimeout(() => {
            dash.style.display = 'none';
            showDashTab('geral', document.querySelector('.dash-item'));
            const sub = document.getElementById('visual-subs');
            if(sub) sub.style.display = 'none';
        }, 300);
    } else {
        renderHotkeys();
        renderVisibilityList();
        dash.style.display = 'flex';
        setTimeout(() => dash.style.opacity = '1', 10);
    }
}

function showDashTab(tabName, element) {
    document.querySelectorAll('.dash-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.dash-item, .sub-item').forEach(btn => btn.classList.remove('active'));
    
    let targetId = 'tab-' + tabName;
    const target = document.getElementById(targetId);
    if (target) target.style.display = 'flex';
    if (element) element.classList.add('active');
}

function setAppVolume(val) {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => v.volume = val / 100);
    localStorage.setItem('nxs_forced_volume', val / 100);
    nxs.log("SYS", `Volume geral ajustado para ${val}%`);
    sendToCpp({ type: "save_setting", key: "app_volume", value: val });
}


let nxsHotkeys = JSON.parse(localStorage.getItem('nxs_hotkeys')) || {
    "Dashboard": "Escape",
    "Fullscreen": "F11",
    "Logs": "KeyL",
    "Mute": "KeyM",
    "Reload": "KeyR",
    "Social": "KeyA",
    "Home": "Home",
    "Sair": "KeyQ"
};

function recordHotkey(action) {
    const btn = document.getElementById(`hk-${action}`);
    if (!btn) return;
    btn.innerText = "... pressione uma tecla ...";
    btn.classList.add('recording');
    const capture = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newKey = e.code;
        nxsHotkeys[action] = newKey;
        localStorage.setItem('nxs_hotkeys', JSON.stringify(nxsHotkeys));
        btn.innerText = newKey;
        btn.classList.remove('recording');
        window.removeEventListener('keydown', capture, true);
        nxs.log("SYS", `Atalho ${action} alterado para ${newKey}`);
    };
    window.addEventListener('keydown', capture, true);
}

function renderHotkeys() {
    const container = document.getElementById('hotkey-list');
    if (!container) return;
    container.innerHTML = Object.keys(nxsHotkeys).map(action => `
        <div class="setting-row">
            <span>${action}</span>
            <div style="display:flex; gap:10px; align-items:center;">
                <small style="opacity:0.5; font-size:9px;">CODE:</small>
                <button id="hk-${action}" class="btn-hk" onclick="recordHotkey('${action}')">${nxsHotkeys[action]}</button>
            </div>
        </div>
    `).join('');
}


function toggleLoading(show) {
    const loader = document.getElementById('loading-overlay');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function showError(msg) {
    toggleLoading(false);
    const modal = document.getElementById('error-modal');
    const msgElement = document.getElementById('error-message');
    if (modal && msgElement) {
        msgElement.innerText = msg;
        modal.style.display = 'flex';
    }
}

function closeErrorModal() {
    const modal = document.getElementById('error-modal');
    if (modal) modal.style.display = 'none';
}


function toggleFullProfile(show) {
    
    const modal = document.getElementById('profile-page-full') || document.getElementById('profile-modal');
    if (!modal) return;
    if (show) {
        updateProfileStats();
        const disp = document.getElementById('profile-username-display');
        const img = document.getElementById('profile-pic-large');
        if (disp) disp.innerText = window.currentUser || "Offline";
        if (img) img.src = window.userAvatar || "";
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}


function toggleProfileModal(show) { toggleFullProfile(show); }

function previewRegAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const prev = document.getElementById('reg-preview');
            if (prev) prev.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function createLocalProfile() {
    const nickEl = document.getElementById('reg-user');
    const prevEl = document.getElementById('reg-preview');
    const nick = nickEl ? nickEl.value.trim() : "";
    const photo = prevEl ? prevEl.src : "";
    if (!nick) { showError("Por favor, escolha um Nick para continuar."); return; }
    nxs.log("JS", "Criando perfil local...");
    localStorage.setItem('nxs_nick', nick);
    localStorage.setItem('nxs_photo', photo);
    window.currentUser = nick;
    window.userAvatar = photo;
    const navName = document.getElementById('nav-username');
    const navPic = document.getElementById('nav-profile-pic');
    const auth = document.getElementById('auth-screen');
    if (navName) navName.innerText = nick;
    if (navPic) navPic.src = photo;
    if (auth) auth.style.display = 'none';
    sendToCpp({ type: "setup_profile", username: nick, avatar: photo });
}

function updateProfilePic(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;
            window.userAvatar = base64;
            localStorage.setItem('nxs_photo', base64);
            const large = document.getElementById('profile-pic-large');
            const nav = document.getElementById('nav-profile-pic');
            if (large) large.src = base64;
            if (nav) nav.src = base64;
            sendToCpp({ type: "sync_all", username: window.currentUser, avatar: base64 });
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function logout() {
    if (confirm("Deseja realmente sair e resetar o login local?")) {
        localStorage.removeItem('nxs_nick');
        localStorage.removeItem('nxs_photo');
        location.reload();
    }
}

function updateProfileStats() {
    const sessionTime = Math.floor((Date.now() - window.startTime) / 60000);
    const timeEl = document.getElementById('stat-time');
    if(timeEl) timeEl.innerText = sessionTime + " min";
}
window.startTime = Date.now();
setInterval(updateProfileStats, 60000);


function toggleAdm(show) {
    const panel = document.getElementById('adm-panel');
    if (!panel) return;
    if (show) { 
        if(typeof renderAdmEditor === 'function') renderAdmEditor(); 
        panel.style.display = 'flex'; 
    }
    else { panel.style.display = 'none'; }
}

function toggleTV() {
    const panel = document.getElementById('tv-panel');
    if (!panel) return;
    if (panel.style.display === 'flex') { panel.style.display = 'none'; }
    else { if(typeof renderTVList === 'function') renderTVList(); panel.style.display = 'flex'; }
}


function openAnimeSubMenu() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    nxs.log("SISTEMA", "Abrindo Subcategoria: Animes");

    grid.innerHTML = `
        <div class="card" onclick="launch('https://anim.lol')">
            <div style="background:#000; padding:10px; border-radius:10px; display:flex; align-items:center; justify-content:center; height:60px; width:100%; box-sizing: border-box;">
                <span style="font-family: Arial; font-weight:bold; color:white; font-size:24px; letter-spacing:2px;">ANIM</span>
                <span style="background:#4285f4; color:white; padding:2px 10px; border-radius:15px; margin-left:5px; font-size:16px;">LOL</span>
            </div>
            <span style="margin-top:10px;">Anim.lol</span>
        </div>

        <div class="card" onclick="launch('https://animeshd.to')">
            <div style="height:60px; display:flex; align-items:center; justify-content:center; width:100%;">
                <img src="https://animeshd.to/wp-content/uploads/2024/08/animes-hd-logo.png" style="height:45px; width:auto; object-fit:contain;">
            </div>
            <span>AnimesHD</span>
        </div>

        <div class="card" onclick="launch('https://goyabu.io/inicio-2')">
            <div style="height:60px; display:flex; align-items:center; justify-content:center; width:100%;">
                <img src="https://goyabu.io/wp-content/uploads/2025/12/logo-min.webp" style="height:40px; width:auto; object-fit:contain;">
            </div>
            <span>Goyabu</span>
        </div>

        <div class="card" onclick="location.reload()" style="border: 1px dashed rgba(255,255,255,0.2);">
            <div style="font-size:30px; opacity:0.5;">↩️</div>
            <span>Voltar</span>
        </div>
    `;
}


function renderMainGrid() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    if (typeof appConfig === 'undefined' || !appConfig.links) {
        setTimeout(renderMainGrid, 100);
        return;
    }

    grid.innerHTML = appConfig.links.map(link => {
        const isVisible = localStorage.getItem(`btn_vis_${link.name}`) !== 'false';
        
        let clickAction;
        if (link.name.toUpperCase() === 'ANIMES') {
            clickAction = "openAnimeSubMenu()";
        } else {
            clickAction = link.url.startsWith('javascript:') ? link.url.replace('javascript:', '') : `launch('${link.url}')`;
        }

        return `
            <div class="card" onclick="${clickAction}" style="display: ${isVisible ? 'flex' : 'none'}">
                <img src="${link.icon}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
                <span>${link.name}</span>
            </div>
        `;
    }).join('');
}

window.open = function() { return null; };


function cleanExternalSites(url) {
    if (url.includes("anim.lol") || url.includes("goyabu") || url.includes("animeshd.to")) {
        const scriptForce = `
            (function() {
                window.onbeforeunload = null;
                const origAssign = window.location.assign;
                const origReplace = window.location.replace;
                
                window.location.assign = function(u) { if(u === '/' || u.includes('betteranime')) return; origAssign.apply(this, arguments); };
                window.location.replace = function(u) { if(u === '/' || u.includes('betteranime')) return; origReplace.apply(this, arguments); };

                const fixMedia = () => {
                    const video = document.querySelector('video');
                    if (video) {
                        if (video.networkState === 3) { video.load(); } 
                        video.muted = true;
                        video.play().catch(() => {});
                    }
                    document.querySelectorAll('.player-error-overlay, .jw-error, [class*="ads"], iframe:not([src*="player"])').forEach(el => el.remove());
                };

                const fixImages = () => {
                    document.querySelectorAll('img').forEach(img => {
                        const ds = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy-src');
                        if (ds && img.src !== ds) {
                            img.src = ds;
                            img.style.opacity = '1';
                            img.style.visibility = 'visible';
                        }
                    });
                };

                setInterval(() => { fixMedia(); fixImages(); window.dispatchEvent(new Event('scroll')); }, 1500);
            })();
        `;
        if (window.chrome?.webview) window.chrome.webview.executeScript(scriptForce);
    }
}

function launch(url) {
    if (window.chrome?.webview) {
        nxs.log("SYS", "Navegando: " + url);
        window.chrome.webview.postMessage(url);
        
        setTimeout(() => {
            cleanExternalSites(url);
            window.chrome.webview.executeScript("(function(){ window.open = function(){ return null; }; })();");
        }, 5000);
    }
}

function sendToCpp(data) {
    if (typeof data === 'string') { if (window.chrome?.webview) window.chrome.webview.postMessage(data); return; }
    if (window.chrome?.webview) window.chrome.webview.postMessage(JSON.stringify(data));
}

function renderDynamicUI(receivedData) {
    const data = receivedData.type === "config_load" ? receivedData.data : receivedData;
    if (receivedData.type === "stream_resolved") {
        toggleLoading(false);
        if(typeof openTVChannel === 'function') openTVChannel(receivedData.resolvedUrl + "|Referer=https://piratatvs.com/", true);
        return;
    }
    if (data.friends_list) {
        const container = document.getElementById('friends-list');
        if (container) container.innerHTML = data.friends_list.map(f => `<div class="friend-row" onclick="openChat('${f.name}')"><span>${f.name}</span></div>`).join('');
    }
    if (data.messages && window.currentChatFriend) {
        const msgBox = document.getElementById('chat-messages');
        if (msgBox) {
            const chatLog = data.messages[window.currentChatFriend] || [];
            msgBox.innerHTML = chatLog.map(m => `<div class="msg ${m.from === window.currentUser ? 'sent' : 'received'}"><div class="msg-text">${m.text}</div></div>`).join('');
            msgBox.scrollTop = msgBox.scrollHeight;
        }
    }
}


window.addEventListener('DOMContentLoaded', () => {
    if (typeof CanvasEngine !== 'undefined') CanvasEngine.init();
    
    const sn = localStorage.getItem('nxs_nick');
    const sp = localStorage.getItem('nxs_photo');
    const savedTheme = localStorage.getItem('nxs_theme') || 'neon-blue';

    if (sn) {
        window.currentUser = sn;
        window.userAvatar = sp;
        if(document.getElementById('nav-username')) document.getElementById('nav-username').innerText = sn;
        if(document.getElementById('nav-profile-pic')) document.getElementById('nav-profile-pic').src = sp;
        if(document.getElementById('auth-screen')) document.getElementById('auth-screen').style.display = 'none';
        sendToCpp({ type: "presence", username: sn, avatar: sp });
    }

    renderMainGrid();

    
    document.querySelector('.profile-trigger')?.addEventListener('click', () => toggleFullProfile(true));
    
    
    setTimeout(() => {
        if (typeof window.changeTheme === 'function') {
            window.changeTheme(savedTheme);
            nxs.log("THEME", "Ambiente Inicial: " + savedTheme);
        }
    }, 200);

    document.getElementById('nxs-cmd-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { runNxsCommand(e.target.value); e.target.value = ""; }
    });
});

if (window.chrome?.webview) {
    window.chrome.webview.addEventListener('message', event => {
        try {
            const msg = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;
            if (msg.type === "easter_egg" && typeof window.changeTheme === 'function') window.changeTheme(msg.theme);
            if (msg.type === "toggle_dashboard") toggleDashboard();
            if (msg.type === "toggle_logs") toggleLogPanel();
            if (msg.type === "ui_update" || msg.type === "stream_resolved") renderDynamicUI(msg);
        } catch(e) {
            if (event.data === "toggle_dashboard") toggleDashboard();
            else if (event.data === "toggle_logs") toggleLogPanel();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.code === nxsHotkeys["Dashboard"]) { 
        e.preventDefault(); 
        if(document.getElementById('nxs-minigame')) { 
            document.getElementById('nxs-minigame').remove(); 
            if(window.eggInterval) clearInterval(window.eggInterval); 
        } else toggleDashboard(); 
        return; 
    }
    if (e.code === nxsHotkeys["Fullscreen"]) { e.preventDefault(); sendToCpp('toggle_fullscreen'); return; }
    if (e.code === nxsHotkeys["Logs"] && e.ctrlKey) { e.preventDefault(); toggleLogPanel(); return; }
    if (e.code === nxsHotkeys["Social"] && e.ctrlKey) { e.preventDefault(); if(typeof toggleSocial === 'function') toggleSocial(); return; }
    if (e.code === nxsHotkeys["Reload"] && e.ctrlKey) { e.preventDefault(); location.reload(); return; }
    if (e.code === nxsHotkeys["Home"] && e.ctrlKey) { e.preventDefault(); sendToCpp({ type: 'go_home' }); return; }
    if (e.code === nxsHotkeys["Mute"] && e.ctrlKey) { if (typeof toggleMuteMusica === 'function') toggleMuteMusica(); return; }
    if (e.code === nxsHotkeys["Sair"] && e.ctrlKey) { if (window.chrome?.webview) window.chrome.webview.postMessage("encerrar_app"); return; }
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyX') toggleAdm(true);
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        const v = document.querySelector('video');
        if (v) { e.preventDefault(); v.paused ? v.play() : v.pause(); }
    }
});

nxs.log("SISTEMA", "NXSHUB UI CARREGADA");