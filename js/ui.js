import { TOOLS } from './constants.js';
import { audioManager } from './audio.js';

export class UI {
    constructor(state, engine) {
        this.state = state;
        this.engine = engine;
        this.initTools();
        this.initDirections();
        this.bindEvents();
        
        this.state.subscribe(() => this.updateHUD());
    }

    initTools() {
        const container = document.getElementById('tool-buttons');
        TOOLS.forEach(tool => {
            const btn = document.createElement('button');
            btn.className = `tool-btn ${this.state.selectedTool === tool.id ? 'active' : ''}`;
            btn.innerHTML = `<i data-lucide="${tool.icon}"></i><span>${tool.label}</span>`;
            btn.onclick = () => {
                this.state.setTool(tool.id);
                audioManager.play('click', 0.2);
            };
            container.appendChild(btn);
        });
    }


    initDirections() {
        const btns = document.querySelectorAll('.dir-btn');
        btns.forEach(btn => {
            btn.onclick = () => {
                this.state.setDirection(btn.dataset.dir);
                audioManager.play('click', 0.2);
            };
        });
    }

    bindEvents() {
        this.state.subscribe((s) => {
            document.querySelectorAll('.tool-btn').forEach((btn, idx) => {
                btn.classList.toggle('active', TOOLS[idx].id === s.selectedTool);
            });
            document.querySelectorAll('.dir-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.dir) === s.direction);
            });
        });
    }

    updateHUD() {
        document.getElementById('currency-value').innerText = Math.floor(this.state.currency);
    }
}