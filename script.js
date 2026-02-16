// ===== EFFECT =====
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-rain');
        this.ctx = this.canvas.getContext('2d');
        this.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        this.colors = ['#8a52ff', '#00d9ff', '#00ff88'];
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.init());
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(0).map(() => Math.random() * -100);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 1, 24, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = `${this.fontSize}px 'IBM Plex Mono'`;
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            const alpha = Math.random() * 0.5 + 0.5;
            this.ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillText(char, x, y);
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i] += 0.4;
        }
        requestAnimationFrame(() => this.animate());
    }
}

// ===== TERMINAL =====
class Terminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('cmd-input');
        this.terminalBody = document.getElementById('terminal-body');
        this.history = [];
        this.historyIndex = -1;
        this.isTyping = false;
        this.initEventListeners();
        this.showWelcome();
    }
    
    initEventListeners() {
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        document.querySelector('.terminal-window').addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
                this.input.focus();
            }
        });
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
        });
        document.querySelector('.dot-close')?.addEventListener('click', () => {
            this.executeCommand('exit');
        });
        document.querySelector('.dot-minimize')?.addEventListener('click', () => {
            this.printLine('<span class="info">Window minimized (not really 😉)</span>');
        });
        document.querySelector('.dot-maximize')?.addEventListener('click', () => {
            document.querySelector('.terminal-window').classList.toggle('maximized');
        });
    }
    
    handleInput(e) {
        if (this.isTyping) return;
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            if (cmd) {
                this.echoCommand(cmd);
                this.executeCommand(cmd);
                this.history.push(cmd);
                this.historyIndex = this.history.length;
            } else {
                this.addPromptLine();
            }
            this.input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocomplete();
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            this.clear();
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            this.printLine('^C');
            this.addPromptLine();
            this.input.value = '';
        }
    }
    
    echoCommand(cmd) {
        const line = document.createElement('div');
        line.className = 'output-line command-echo';
        line.innerHTML = `
            <span class="prompt">
                <span class="prompt-user">sirilv</span>
                <span class="prompt-separator">@</span>
                <span class="prompt-host">cachyos</span>
            </span>
            <span class="prompt-path">~</span>
            <span class="prompt-symbol">❯</span>
            <span>${this.escapeHtml(cmd)}</span>
        `;
        this.output.appendChild(line);
    }
    
    addPromptLine() {
        const line = document.createElement('div');
        line.className = 'output-line';
        this.output.appendChild(line);
    }
    
    async executeCommand(cmd) {
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();
        const commands = {
            'help': () => this.showHelp(),
            'fastfetch': () => this.showFastfetch(),
            'neofetch': () => this.showFastfetch(),
            'ls': () => this.listProjects(),
            'projects': () => this.showProjects(),
            'skills': () => this.showSkills(),
            'whoami': () => this.showWhoami(),
            'contact': () => this.showContact(),
            'about': () => this.showAbout(),
            'clear': () => this.clear(),
            'cls': () => this.clear(),
            'github': () => this.openLink('https://github.com/SiriLV'),
            'telegram': () => this.openLink('https://t.me/Siri_Lvs'),
            'sudo': () => this.sudo(args),
            'exit': () => this.exit(),
            'theme': () => this.toggleTheme(),
            'servers': () => this.showServers(),
            'matrix': () => this.matrixMode(),
            'quote': () => this.showQuote(),
            'banner': () => this.showBanner(),
        };
        if (commands[command]) {
            await commands[command]();
        } else if (command) {
            this.printLine(`<span class="error">Command not found: ${this.escapeHtml(command)}</span>`);
            this.printLine(`Type <span class="info">'help'</span> for available commands.`);
        }
        this.scrollToBottom();
    }
    
    // ===== COMMAND =====
    async showWelcome() {
        await this.typeText('╔═════════════════════════════════╗', 1);
        await this.typeText('║   Welcome to SiriLV Terminal ║', 1);
        await this.typeText('╚═════════════════════════════════╝', 1);
        await this.sleep(200);
        this.printLine('');
        await this.typeText('Type <span class="info">\'help\'</span> to see available commands.', 15);
        await this.typeText('Type <span class="info">\'fastfetch\'</span> to see system information.', 15);
        this.printLine('');
        this.input.focus();
    }
    
    showHelp() {
        this.printLine('<span class="info">╭─ Available Commands ──────────────────────────────╮</span>');
        this.printLine('');
        const commands = [
            ['fastfetch', 'Display system information'],
            ['projects', 'Show my development projects'],
            ['skills', 'List programming languages & technologies'],
            ['whoami', 'Information about me'],
            ['about', 'Detailed profile information'],
            ['contact', 'Get my contact information'],
            ['servers', 'Show server infrastructure'],
            ['github', 'Open my GitHub profile'],
            ['telegram', 'Open my Telegram'],
            ['clear', 'Clear terminal screen'],
            ['theme', 'Toggle light/dark theme'],
            ['banner', 'Show welcome banner'],
        ];
        const html = '<div class="help-table">' + 
            commands.map(([cmd, desc]) => 
                `<span class="help-cmd">${cmd}</span><span class="help-desc">${desc}</span>`
            ).join('') +
            '</div>';
        this.printLine(html);
        this.printLine('<span class="info">╰───────────────────────────────────────────────────╯</span>');
    }
    
    showFastfetch() {
        const ascii = `
    ███████╗██╗██████╗ ██╗██╗    ██╗   ██╗
    ██╔════╝██║██╔══██╗██║██║    ██║   ██║
    ███████╗██║██████╔╝██║██║    ██║   ██║
    ╚════██║██║██╔══██╗██║██║    ╚██╗ ██╔╝
    ██████╔╝██║██║  ██║██║███████╗╚████╔╝ 
    ╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═══╝ `;
        const info = [
            ['sirilv@cachyos', '', true],
            ['CPU', 'Intel Core i3-10105 (8) @ 4.40 GHz'],
            ['GPU', 'AMD Radeon RX 6600'],
            ['Memory', '16 GiB DDR4'],
            ['Disk', '2.5 TiB'],
        ];
        this.printLine('<div style="display: flex; gap: 20px; flex-wrap: wrap;">');
        this.printLine(`<pre class="ascii-art">${ascii}</pre>`);
        this.printLine('<div class="system-info">');
        info.forEach(([label, value, isHeader]) => {
            if (isHeader) {
                this.printLine(`<div style="color: var(--primary); font-weight: 700; margin-bottom: 4px;">${label}</div>`);
            } else if (!label && !value) {
                this.printLine('<div style="height: 4px;"></div>');
            } else if (label && value) {
                this.printLine(`<div><span class="info-label">${label}</span>: <span class="info-value">${value}</span></div>`);
            } else {
                this.printLine(`<div>${value}</div>`);
            }
        });
        this.printLine('</div>');
        this.printLine('</div>');
        this.printLine('<div style="clear: both;"></div>');
    }
    
    showProjects() {
        this.printLine('<span class="info">╭─ My Projects ─────────────────────────────────────╮</span>');
        this.printLine('');
        const projects = [
            {
                type: 'PyPI Package',
                name: 'neogram',
                desc: 'Telegram bot framework',
                link: 'https://pypi.org/project/neogram/'
            },
            {
                type: 'PyPI Package',
                name: 'questra',
                desc: 'Async request library',
                link: 'https://pypi.org/project/questra/'
            },
            {
                type: 'GitHub Project',
                name: 'PmOS-port for gtel3g',
                desc: 'PostmarketOS port for gtelwifi',
                link: 'https://github.com/SiriLV/postmarketos_gtel3g_and_gtelwifi'
            },
            {
                type: 'GitHub Tool',
                name: 'API Keys Parser',
                desc: 'GitHub API key scanner and parser',
                link: null
            },
            {
                type: 'AI Project',
                name: 'AI API Key Generator',
                desc: 'ML-based API key generation system',
                link: null
            },
            {
                type: 'Godot Game',
                name: 'Archer',
                desc: 'Archery mechanics game',
                link: null
            },
            {
                type: 'Godot Game',
                name: 'Balls',
                desc: 'Physics-based puzzle game',
                link: null
            }
        ];
        projects.forEach(p => {
            const nameHtml = p.link ? 
                `<a href="${p.link}" target="_blank">${p.name}</a>` : 
                `<span class="project-name">${p.name}</span>`;
            this.printLine(`
                <div class="project-item">
                    <div class="project-type">[${p.type}]</div>
                    <div>${nameHtml}</div>
                    <div class="project-desc">${p.desc}</div>
                </div>
            `);
        });
        this.printLine('');
        this.printLine('<span class="info">╰───────────────────────────────────────────────────╯</span>');
    }
    
    listProjects() {
        this.printLine('drwxr-xr-x  <a href="https://pypi.org/project/neogram/" target="_blank">neogram/</a>');
        this.printLine('drwxr-xr-x  <a href="https://pypi.org/project/questra/" target="_blank">questra/</a>');
        this.printLine('drwxr-xr-x  <a href="https://github.com/SiriLV" target="_blank">gtel3g-port/</a>');
        this.printLine('drwxr-xr-x  api-parser/');
        this.printLine('drwxr-xr-x  ai-keygen/');
        this.printLine('drwxr-xr-x  godot-games/');
        this.printLine('');
        this.printLine('<span class="text-dim">Use \'projects\' for detailed view</span>');
    }
    
    showSkills() {
        this.printLine('<span class="info">╭─ Programming Languages & Technologies ────────────╮</span>');
        this.printLine('');
        this.printLine('<div style="margin-bottom: 12px;"><span class="info-label">Primary:</span> Python</div>');
        const skills = [
            'Python', 'C++', 'JavaScript', 'Lua', 'Kotlin', 'Java', 'C#',
            'Linux', 'CachyOS', 'Wayland', 'Git', 'Docker', 'Telegram API',
            'Godot Engine', 'Backend Dev', 'API Design', 'System Admin'
        ];
        const html = '<div class="skills-grid">' +
            skills.map((skill, i) => {
                const isPrimary = skill === 'Python';
                return `<div class="skill-tag ${isPrimary ? 'primary' : ''}">${skill}</div>`;
            }).join('') +
            '</div>';
        this.printLine(html);
        this.printLine('');
        this.printLine('<span class="info">╰───────────────────────────────────────────────────╯</span>');
    }
    
    showWhoami() {
        this.printLine(`<span class="info-label">Name:</span> Roman`);
        this.printLine(`<span class="info-label">Aliases:</span> Siright, SiriLV`);
        this.printLine(`<span class="info-label">Role:</span> Backend Developer`);
        this.printLine(`<span class="info-label">OS:</span> CachyOS Linux`);
        this.printLine(`<span class="info-label">Primary Lang:</span> Python`);
        this.printLine(`<span class="info-label">Infrastructure:</span> 6 servers`);
    }
    
    showAbout() {
        this.printLine('<span class="info">╭─ About Me ────────────────────────────────────────╮</span>');
        this.printLine('');
        this.printLine('Hi! I\'m <span class="info-label">Roman</span> (aka <span class="info-label">Siright</span> or <span class="info-label">SiriLV</span>)');
        this.printLine('');
        this.printLine('🚀 <span class="info-label">Backend Developer</span> passionate about:');
        this.printLine('   • Building scalable server infrastructure');
        this.printLine('   • Creating Python libraries and frameworks');
        this.printLine('   • Game development with Godot Engine');
        this.printLine('   • Linux system administration');
        this.printLine('');
        this.printLine('💻 Running <span class="info-label">CachyOS</span> with:');
        this.printLine('   • niri (Wayland compositor)');
        this.printLine('   • alacritty terminal');
        this.printLine('   • 6 server infrastructure');
        this.printLine('');
        this.printLine('📚 Proficient in:');
        this.printLine('   • Python (primary), C++, JavaScript');
        this.printLine('   • Lua, Kotlin, Java, C#');
        this.printLine('');
        this.printLine('<span class="info">╰───────────────────────────────────────────────────╯</span>');
    }
    
    showContact() {
        this.printLine('<span class="info">╭─ Contact Information ─────────────────────────────╮</span>');
        this.printLine('');
        this.printLine('📱 <span class="info-label">Telegram:</span> <a href="https://t.me/Siri_Lvs" target="_blank">@Siri_Lvs</a>');
        this.printLine('💻 <span class="info-label">GitHub:</span> <a href="https://github.com/SiriLV" target="_blank">github.com/SiriLV</a>');
        this.printLine('📦 <span class="info-label">PyPI:</span> <a href="https://pypi.org/user/SiriLV/" target="_blank">pypi.org/user/SiriLV</a>');
        this.printLine('');
        this.printLine('<span class="info">╰───────────────────────────────────────────────────╯</span>');
    }
    
    showServers() {
        this.printLine('<span class="info">╭─ Server Infrastructure ───────────────────────────╮</span>');
        this.printLine('');
        this.printLine('🖥️  <span class="info-label">Total Servers:</span> 6');
        this.printLine('');
        this.printLine('📊 <span class="success">Status: All systems operational ✓</span>');
        this.printLine('');
        for (let i = 1; i <= 6; i++) {
            this.printLine(`   Server ${i}: <span class="success">●</span> Online`);
        }
        this.printLine('');
        this.printLine('<span class="info">╰───────────────────────────────────────────────────╯</span>');
    }
    
    showBanner() {
        const banner = `
    ███████╗██╗██████╗ ██╗██╗  ██╗   ██╗
    ██╔════╝██║██╔══██╗██║██║  ██║   ██║
    ███████╗██║██████╔╝██║██║  ██║   ██║
    ╚════██║██║██╔══██╗██║██║  ╚██╗ ██╔╝
    ███████║██║██║  ██║██║███████╗╚████╔╝ 
    ╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═══╝  
    Backend Developer • Python Expert • Linux Enthusiast`;
        this.printLine(`<pre class="ascii-art">${banner}</pre>`);
        this.printLine('<div style="clear: both;"></div>');
    }
    
    showQuote() {
        const quotes = [
            "Code is poetry written in logic.",
            "The best code is no code at all.",
            "Make it work, make it right, make it fast.",
            "Simplicity is the ultimate sophistication.",
            "Talk is cheap. Show me the code. - Linus Torvalds",
            "Programs must be written for people to read. - Harold Abelson"
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        this.printLine(`<span class="info">"${quote}"</span>`);
    }
    
    sudo(args) {
        if (args.length < 2) {
            this.printLine('<span class="error">usage: sudo &lt;command&gt;</span>');
            return;
        }
        this.printLine('[sudo] password for sirilv: ');
        setTimeout(() => {
            this.printLine('<span class="error">Sorry, try again.</span>');
            this.printLine('<span class="warning">sirilv is not in the sudoers file. This incident will be reported.</span>');
        }, 500);
    }
    
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        this.printLine(`<span class="success">Theme switched to ${mode} mode</span>`);
    }
    
    matrixMode() {
        this.printLine('<span class="success">Matrix mode is already enabled! 🟢</span>');
        this.printLine('<span class="info">The Matrix has you...</span>');
    }
    
    openLink(url) {
        window.open(url, '_blank');
        this.printLine(`<span class="success">Opening ${url}</span>`);
    }
    
    exit() {
        this.printLine('<span class="info">Goodbye! 👋</span>');
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 1000);
    }
    
    clear() {
        this.output.innerHTML = '';
    }
    
    autocomplete() {
        const value = this.input.value.toLowerCase();
        const commands = ['help', 'fastfetch', 'neofetch', 'ls', 'projects', 'skills', 
                         'whoami', 'about', 'contact', 'clear', 'github', 'telegram',
                         'sudo', 'theme', 'servers', 'banner', 'quote'];
        const matches = commands.filter(cmd => cmd.startsWith(value));
        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.printLine(matches.join('  '));
            this.addPromptLine();
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    printLine(html) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.innerHTML = html;
        this.output.appendChild(line);
    }
    
    async typeText(text, speed = 30) {
        this.isTyping = true;
        const line = document.createElement('div');
        line.className = 'output-line';
        this.output.appendChild(line);
        for (let i = 0; i < text.length; i++) {
            line.innerHTML = text.substring(0, i + 1);
            this.scrollToBottom();
            await this.sleep(speed);
        }
        this.isTyping = false;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    scrollToBottom() {
        this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== EASTER EGGS =====
const easterEggs = {
    konami: {
        code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
        position: 0,
        activated: false
    }
};

document.addEventListener('keydown', (e) => {
    const konami = easterEggs.konami;
    if (e.key === konami.code[konami.position]) {
        konami.position++;
        if (konami.position === konami.code.length && !konami.activated) {
            konami.activated = true;
            konami.position = 0;
            document.body.style.animation = 'rainbow 2s linear infinite';
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            setTimeout(() => {
                document.body.style.animation = '';
                konami.activated = false;
            }, 5000);
        }
    } else {
        konami.position = 0;
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    new MatrixRain();
    window.terminal = new Terminal();
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName !== 'A') {
            e.preventDefault();
        }
    });
    let interacted = false;
    document.addEventListener('touchstart', () => {
        if (!interacted) {
            setTimeout(() => {
                const hint = document.querySelector('.mobile-hint');
                if (hint) hint.style.display = 'none';
            }, 2000);
            interacted = true;
        }
    });
});

document.addEventListener('visibilitychange', () => {
    const canvas = document.getElementById('matrix-rain');
    if (document.hidden) {
        canvas.style.opacity = '0.2';
    } else {
        canvas.style.opacity = '0.4';
    }
});