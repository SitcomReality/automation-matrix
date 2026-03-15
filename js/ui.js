import { TOOLS } from './constants.js';

export class UI {
    constructor(state, engine) {
        this.state = state;
        this.engine = engine;
        this.initTools();
        this.initMatrix();
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
            btn.onclick = () => this.state.setTool(tool.id);
            container.appendChild(btn);
        });
    }

    initMatrix() {
        const container = document.getElementById('clicker-matrix');
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            let activeTimer = 0;
            
            cell.onmouseenter = () => {
                if (activeTimer <= 0) {
                    this.state.addCurrency(1);
                    cell.classList.add('active');
                    activeTimer = 120;
                    const loop = () => {
                        activeTimer--;
                        if (activeTimer <= 0) {
                            cell.classList.remove('active');
                        } else {
                            requestAnimationFrame(loop);
                        }
                    };
                    requestAnimationFrame(loop);
                }
            };
            container.appendChild(cell);
        }
    }

    initDirections() {
        const btns = document.querySelectorAll('.dir-btn');
        btns.forEach(btn => {
            btn.onclick = () => this.state.setDirection(btn.dataset.dir);
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