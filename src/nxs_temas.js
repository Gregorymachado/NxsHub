
let currentAudio = null;
let isThemeMuted = localStorage.getItem('nxs_theme_muted') === 'true';


function initVanta(colorCode = 0x00d2ff) {
    if (window.vantaInstance) window.vantaInstance.destroy();
    if (typeof VANTA === 'undefined') return;
    
    window.vantaInstance = VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: colorCode,
        backgroundColor: 0x050508,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 16.00
    });
}


const NxsBackground = {
    canvas: null,
    ctx: null,
    particles: [],
    shape: 'circle',
    color: '#00d2ff',

    init() {
        this.canvas = document.getElementById('nxs-dynamic-bg');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'nxs-dynamic-bg';
            this.canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; z-index:-3; pointer-events:none;';
            document.body.prepend(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.createParticles();
        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticles() {
        this.particles = [];
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                rot: Math.random() * Math.PI * 2
            });
        }
    },

    setThemeEffect(theme) {
        const blue = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim();
        this.color = blue || '#00d2ff';
    },

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;
        this.ctx.globalAlpha = 0.2;

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        requestAnimationFrame(() => this.animate());
    }
};


const CanvasEngine = {
    ctx: null,
    canvas: null,
    particles: [],
    theme: '',
    spriteCache: {},

    init() {
        this.canvas = document.getElementById('nxs-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.spriteCache = {};
        });
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.animate();
    },

    generateSprite(symbol, color) {
        const key = `${symbol}-${color}`;
        if (this.spriteCache[key]) return this.spriteCache[key];

        const offscreen = document.createElement('canvas');
        const buffer = 20;
        const fontSize = 30;
        offscreen.width = fontSize + buffer;
        offscreen.height = fontSize + buffer;
        const oCtx = offscreen.getContext('2d');

        oCtx.shadowBlur = 12;
        oCtx.shadowColor = color;
        oCtx.font = `bold ${fontSize}px serif`;
        oCtx.textAlign = "center";
        oCtx.textBaseline = "middle";
        oCtx.fillStyle = "white";
        oCtx.fillText(symbol, offscreen.width / 2, offscreen.height / 2);

        this.spriteCache[key] = offscreen;
        return offscreen;
    },

    start(theme) {
        this.theme = theme;
        this.particles = [];
        this.spriteCache = {}; 
        
        const display = document.getElementById('current-theme-display');
        if (display) display.innerText = theme.toUpperCase().replace('-', ' ');
        
        let count = 35;

        if (['blood-red', 'toxic-slime', 'minecraft', 'matrix-green', 'lil-peep', 'adventure-time', 'gumball', 'hazbin-hotel', 'fnaf', 'stranger-things', 'premium-lava', 'pica-pau', 'resident-evil-4', 'hatsune-miku'].includes(theme)) count = 70;
        if (theme.includes('clean')) count = 0;

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    },

    createParticle() {
        const themeMap = {
            'chaves': ['📦', '🥯', '🍭', '👒'],
            'adventure-time': ['⚔️', '🐶', '👑', '🍎'],
            'teen-titans': ['🍕', '🦅', '🤖', '⭐'],
            'gumball': ['🐱', '🐰', '🐟', '📺'],
            'regular-show': ['☕', '🎮', '📼', '🦝'],
            'pica-pau': ['🐦', '🪵', '🪓', '🍉'],
            'hazbin-hotel': ['🍎', '😈', '🏨', '📻'],
            'rio': ['🦜', '⚽', '🏖️', '💃'],
            'memes': ['🤣', '🐵', '🍞', '🕶️'],
            'cod': ['🔫', '💣', '🎖️', '🚁'],
            'fnaf': ['🐻', '🐰', '🐥', '🍕'],
            'stranger-things': ['🚲', '🧇', '🔦', '🎲'],
            'attack-on-titan': ['⚔️', '🧱', '🗝️', '🩸'],
            'hatsune-miku': ['🎵', '🎼', '🎹', '✨'],
            'resident-evil-4': ['🧟', '🔫', '💊', '👁️'],
            'nintendo': ['🍄', '⭐', '🥚', '🗡️'],
            'playstation': ['△', '○', '✖', '□'],
            'xbox': ['💚', '🎮', '🔋', '✖'],
            'premium-gold-silk': ['💰', '💎', '👑', '✨'],
            'premium-stellar-vacuum': ['🌌', '🛰️', '🛸', '☄️'],
            'premium-cyber-abyss': ['0', '1', '💻', '🔍'],
            'premium-digital-purgatory': ['🔥', '🌋', '☄️', '🧨'],
            'one-piece': ['🌊', '⚓', '☠️', '⛵'],
            'melanie-martinez': ['🧸', '🍼', '☁️', '🎀'],
            'ariana-grande': ['💸', '💎', '💄', '🌙'],
            'gachiakuta': ['⚙️', '🔧', '⛓️', '☂️', '✂️', '🗑️'],
            'demon-slayer': ['⚔️', '🌸', '🏮', '❄️'],
            'naruto': ['🗡️', '🍥', '🔥', '☁️'],
            'noragami': ['👻', '⚔️', '縁', '⛩️'],
            'cbjr': ['🛹', '🎸', '🇧🇷', '⭐'],
            'lil-peep': ['🍀', '☁️', '🌧️', '💔'],
            'minecraft': ['🌿', '📦', '⛏️', '🧱'],
            'blood-red': ['🩸'],
            'toxic-slime': ['☣️', '🧪', '🧼'],
            'ice-glacier': ['❄️', '💎'],
            'neon-blue': ['⚡', '💠', '🔹'],
            'midnight-purple': ['✨', '🔮', '💜'],
            'cyber-orange': ['⚡', '🔋', '💥'],
            'matrix-green': ['0', '1', '👾'],
            'barbie-pink': ['💖', '🎀', '💄'],
            'forest-zen': ['🍃', '🎋', '🧘'],
            'sunset-glow': ['🌅', '☁️', '🕊️'],
            'deep-space': ['🪐', '🚀', '🌠'],
            'volcano-ash': ['🔥', '🌋', '💨'],
            'halloween': ['🎃', '👻', '🦇', '💀'],
            'christmas': ['🎄', '❄️', '🎁', '🎅']
        };

        const symbols = themeMap[this.theme] || ['✨', '⭐'];
        const color = getComputedStyle(document.body).getPropertyValue('--neon-blue').trim() || '#00d2ff';
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        let speedBase = 0.6 + Math.random() * 1.5;
        if (this.theme === 'lil-peep') speedBase = 1.2 + Math.random() * 1.3;
        if (this.theme.includes('premium')) speedBase = 0.8 + Math.random() * 2.0;

        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            speed: speedBase,
            sprite: this.generateSprite(symbol, color),
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.03,
            opacity: 0.3 + Math.random() * 0.5,
            hFlow: (Math.random() - 0.5) * 0.7 
        };
    },

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.y += p.speed;
            p.x += p.hFlow;
            p.angle += p.spin;

            if (p.y > this.canvas.height + 50) {
                p.y = -50;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x > this.canvas.width + 50) p.x = -50;
            if (p.x < -50) p.x = this.canvas.width + 50;

            this.ctx.save();
            this.ctx.globalAlpha = p.opacity;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.drawImage(p.sprite, -p.sprite.width / 2, -p.sprite.height / 2);
            this.ctx.restore();
        }
        requestAnimationFrame(() => this.animate());
    }
};

function toggleThemeMusic() {
    if (typeof toggleMuteMusica === 'function') {
        toggleMuteMusica();
    }
}

function changeTheme(themeName) {
    if (!themeName) return;

    if (themeName !== 'blood-red') {
        document.body.classList.remove('egg-horror');
        document.querySelectorAll('.blood-drop').forEach(d => d.remove());
        if(window.eggInterval) clearInterval(window.eggInterval);
    }

    const colorMap = {
        'neon-blue': { blue: '#00d2ff', dark: '#0a0b10', vanta: 0x00d2ff },
        'midnight-purple': { blue: '#bf55ff', dark: '#090214', vanta: 0xbf55ff },
        'blood-red': { blue: '#ff003c', dark: '#0a0000', vanta: 0xff003c },
        'matrix-green': { blue: '#00ff41', dark: '#000a00', vanta: 0x00ff41 },
        'cyber-orange': { blue: '#ff9d00', dark: '#120d00', vanta: 0xff9d00 },
        'chaves': { blue: '#facc15', dark: '#1e1b01', vanta: 0xfacc15 },
        'minecraft': { blue: '#22c55e', dark: '#18181b', vanta: 0x22c55e },
        'hatsune-miku': { blue: '#39c5bb', dark: '#001a18', vanta: 0x39c5bb },
        'resident-evil-4': { blue: '#93c5fd', dark: '#020617', vanta: 0x93c5fd },
        'nintendo': { blue: '#e60012', dark: '#110000', vanta: 0xe60012 },
        'playstation': { blue: '#00439c', dark: '#000814', vanta: 0x00439c },
        'xbox': { blue: '#107c10', dark: '#020a02', vanta: 0x107c10 },
        'halloween': { blue: '#ea580c', dark: '#0c0114', vanta: 0xea580c },
        'christmas': { blue: '#16a34a', dark: '#1a0101', vanta: 0x16a34a },
        'naruto': { blue: '#f97316', dark: '#0c0500', vanta: 0xf97316 },
        'melanie-martinez': { blue: '#fbcfe8', dark: '#1c1117', vanta: 0xfbcfe8 },
        'adventure-time': { blue: '#2dd4bf', dark: '#061f1c', vanta: 0x2dd4bf },
        'teen-titans': { blue: '#6366f1', dark: '#0a0a1a', vanta: 0x6366f1 },
        'gumball': { blue: '#87ceeb', dark: '#001f3f', vanta: 0x87ceeb },
        'regular-show': { blue: '#94a3b8', dark: '#0f172a', vanta: 0x94a3b8 },
        'noragami': { blue: '#818cf8', dark: '#0d0a1f', vanta: 0x818cf8 },
        'cbjr': { blue: '#ca8a04', dark: '#000000', vanta: 0xca8a04 },
        'lil-peep': { blue: '#ec4899', dark: '#000000', vanta: 0xec4899 },
        'ariana-grande': { blue: '#e5e7eb', dark: '#111827', vanta: 0xe5e7eb },
        'demon-slayer': { blue: '#f43f5e', dark: '#0f0507', vanta: 0xf43f5e },
        'gachiakuta': { blue: '#d9f99d', dark: '#0c0d0a', vanta: 0xd9f99d },
        'one-piece': { blue: '#38bdf8', dark: '#081221', vanta: 0x38bdf8 },
        'jujutsu-kaisen': { blue: '#4f46e5', dark: '#030308', vanta: 0x4f46e5 },
        'brawl-stars': { blue: '#fbbf24', dark: '#1c1917', vanta: 0xfbbf24 },
        'hazbin-hotel': { blue: '#e11d48', dark: '#110105', vanta: 0xe11d48 },
        'rio': { blue: '#22d3ee', dark: '#06202e', vanta: 0x22d3ee },
        'memes': { blue: '#86efac', dark: '#05140b', vanta: 0x86efac },
        'cod': { blue: '#bef264', dark: '#0a0c08', vanta: 0xbef264 },
        'fnaf': { blue: '#7c2d12', dark: '#0c0a09', vanta: 0x7c2d12 },
        'stranger-things': { blue: '#ef4444', dark: '#050101', vanta: 0xef4444 },
        'attack-on-titan': { blue: '#78350f', dark: '#0c0a09', vanta: 0x78350f },
        'premium-gold-silk': { blue: '#fbbf24', dark: '#000000', vanta: 0xfbbf24 },
        'premium-stellar-vacuum': { blue: '#ddd6fe', dark: '#020005', vanta: 0xddd6fe },
        'premium-cyber-abyss': { blue: '#06b6d4', dark: '#000000', vanta: 0x06b6d4 },
        'premium-digital-purgatory': { blue: '#ff0000', dark: '#000000', vanta: 0xff0000 }
    };

    const cfg = colorMap[themeName] || { blue: '#00d2ff', dark: '#0a0b10', vanta: 0x00d2ff };

    document.documentElement.style.setProperty('--neon-blue', cfg.blue, 'important');
    document.documentElement.style.setProperty('--bg-dark', cfg.dark, 'important');
    document.documentElement.style.setProperty('--bg-gradient-top', cfg.dark, 'important');

    const currentClasses = Array.from(document.body.classList);
    currentClasses.forEach(c => {
        if (c.startsWith('theme-')) document.body.classList.remove(c);
    });
    
    document.body.classList.add('theme-' + themeName);
    document.querySelectorAll('.theme-pic').forEach(p => p.remove());
    localStorage.setItem('nxs_theme', themeName);
    window.currentTheme = themeName;

    initVanta(cfg.vanta);
    
    const vantaBg = document.getElementById('vanta-bg');
    if (vantaBg) {
        vantaBg.style.opacity = themeName.includes('clean') ? '0' : '1';
    }

    CanvasEngine.start(themeName);
    NxsBackground.setThemeEffect(themeName);

    if (themeName === 'blood-red') {
        if (typeof runNxsCommand === 'function') runNxsCommand('horror');
    }

    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (window.carregarMusicasDoTema) {
        window.carregarMusicasDoTema(themeName);
    }

    const imgPath = "src/Imagens/";
    if (!themeName.includes('clean')) {
        const pic1 = document.createElement('img');
        pic1.className = "theme-pic pic-l";
        pic1.src = `${imgPath}${themeName}_1.png`;
        pic1.onerror = () => pic1.remove(); 

        const pic2 = document.createElement('img');
        pic2.className = "theme-pic pic-r";
        pic2.src = `${imgPath}${themeName}_2.png`;
        pic2.onerror = () => pic2.remove();

        document.body.appendChild(pic1);
        document.body.appendChild(pic2);
    }

    document.querySelectorAll('.nxs-arrow').forEach(a => {
        a.style.filter = `drop-shadow(0 0 5px ${cfg.blue})`;
    });

    if (typeof nxs !== 'undefined' && nxs.log) {
        nxs.log("THEME", `Ambiente ${themeName} carregado.`);
    }

    if (typeof renderMainGrid === 'function') {
        renderMainGrid();
    }
}

function aplicarEfeitoTema(themeName) {
    changeTheme(themeName);
}

document.addEventListener('DOMContentLoaded', () => {
    NxsBackground.init();
    CanvasEngine.init();
    const saved = localStorage.getItem('nxs_theme') || 'neon-blue';
    setTimeout(() => {
        changeTheme(saved);
    }, 150);
});

window.changeTheme = changeTheme;
window.aplicarEfeitoTema = aplicarEfeitoTema;