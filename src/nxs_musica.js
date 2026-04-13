let playlist = [];
let indexAtual = 0;
let currentThemePlaying = "";
const audioPlayer = new Audio();
const baseDir = 'C:/Users/Administrator/Documents/NxsHub/src/Musicas/';

window.carregarMusicasDoTema = function(temaNome) {
    
    let nomeDaPasta = temaNome;
    if (temaNome === 'melanie-martinez') nomeDaPasta = 'Melanie';
    
    currentThemePlaying = nomeDaPasta;

    
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(JSON.stringify({
            type: "get_playlist",
            folder: nomeDaPasta
        }));
    }
}


window.receberPlaylist = function(listaArquivos) {
    playlist = listaArquivos;
    indexAtual = 0;

    if (playlist && playlist.length > 0) {
        tocarMusica();
    } else {
        const display = document.getElementById('music-title');
        if (display) display.innerText = "SEM MÚSICAS NO TEMA";
        audioPlayer.pause();
        const bars = document.querySelectorAll('.bar');
        bars.forEach(b => b.style.animationPlayState = 'paused');
    }
}

function tocarMusica() {
    if (!playlist || playlist.length === 0) return;

    const caminhoMusica = playlist[indexAtual];
    
    
    if (caminhoMusica.startsWith('file:///')) {
        audioPlayer.src = caminhoMusica;
    } else {
        const caminhoFinal = `file:///${baseDir}${currentThemePlaying}/${caminhoMusica}`.replace(/\\/g, '/');
        audioPlayer.src = encodeURI(caminhoFinal);
    }

    audioPlayer.volume = localStorage.getItem('nxs_forced_volume') || 0.5;
    audioPlayer.muted = (localStorage.getItem('nxs_theme_muted') === 'true');
    
    const bars = document.querySelectorAll('.bar');

    audioPlayer.play()
        .then(() => {
            
            if (!audioPlayer.muted) {
                bars.forEach(b => b.style.animationPlayState = 'running');
            }
        })
        .catch(e => {
            console.warn("Autoplay bloqueado. Interaja com o Hub.");
            const display = document.getElementById('music-title');
            if (display) display.innerText = "CLIQUE PARA INICIAR";
            bars.forEach(b => b.style.animationPlayState = 'paused');
        });

    
    const display = document.getElementById('music-title');
    if (display) {
        try {
            const urlLimpa = caminhoMusica.split('?')[0];
            const partes = urlLimpa.replace(/\\/g, '/').split('/');
            const nomeArquivoComExt = partes.pop(); 
            const nomeLimpo = nomeArquivoComExt.replace(/\.[^/.]+$/, "");
            const tituloFinal = decodeURIComponent(nomeLimpo).trim().toUpperCase();

            display.innerText = tituloFinal || "MÚSICA ATUAL";
            display.style.display = "block";
            
            if (tituloFinal.length > 25) {
                display.classList.add('marquee');
            } else {
                display.classList.remove('marquee');
            }

            console.log("NXS Áudio: Tocando " + tituloFinal);
        } catch (err) {
            console.error("Erro ao processar nome da música:", err);
            display.innerText = "MÚSICA EM REPRODUÇÃO";
        }
    }
}


window.toggleMuteMusica = function() {
    audioPlayer.muted = !audioPlayer.muted;
    localStorage.setItem('nxs_theme_muted', audioPlayer.muted);
    
    const btn = document.getElementById('btn-mute-musica');
    const bars = document.querySelectorAll('.bar');

    if (audioPlayer.muted) {
        if (btn) btn.innerText = "DESMUTAR SOM DO TEMA";
        bars.forEach(b => b.style.animationPlayState = 'paused');
    } else {
        if (btn) btn.innerText = "MUTAR SOM DO TEMA";
        if (!audioPlayer.paused) {
            bars.forEach(b => b.style.animationPlayState = 'running');
        }
    }
}

function proximaMusica() {
    if (playlist.length === 0) return;
    indexAtual = (indexAtual + 1) % playlist.length;
    tocarMusica();
}

function musicaAnterior() {
    if (playlist.length === 0) return;
    indexAtual = (indexAtual - 1 + playlist.length) % playlist.length;
    tocarMusica();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('next-btn')?.addEventListener('click', proximaMusica);
    document.getElementById('prev-btn')?.addEventListener('click', musicaAnterior);

    
    const isMuted = localStorage.getItem('nxs_theme_muted') === 'true';
    const btn = document.getElementById('btn-mute-musica');
    if (btn) btn.innerText = isMuted ? "DESMUTAR SOM DO TEMA" : "MUTAR SOM DO TEMA";

    audioPlayer.onended = () => {
        proximaMusica();
    };
});