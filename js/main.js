import { GameState } from './state.js';
import { GameEngine } from './engine.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { InputHandler } from './input.js';
import { audioManager } from './audio.js';
import { createIcons, icons } from 'lucide';

class App {
    constructor() {
        this.state = new GameState();
        this.engine = new GameEngine(this.state);
        
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas, this.engine, this.state);
        this.ui = new UI(this.state, this.engine);
        this.input = new InputHandler(this.canvas, this.engine, this.state, this.renderer);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Initialize audio on first interaction to comply with browser policies
        const initAudio = () => {
            audioManager.init();
            window.removeEventListener('mousedown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };
        window.addEventListener('mousedown', initAudio);
        window.addEventListener('touchstart', initAudio);

        createIcons({ icons });
        this.loop();
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    loop() {
        this.engine.update();
        this.renderer.render();
        requestAnimationFrame(() => this.loop());
    }
}

new App();