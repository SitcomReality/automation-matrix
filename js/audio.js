export class AudioManager {
    constructor() {
        this.ctx = null;
        this.buffers = {};
    }

    async init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        const sounds = [
            { name: 'place', url: 'place.mp3' },
            { name: 'click', url: 'click.mp3' },
            { name: 'money', url: 'money.mp3' }
        ];

        for (const sound of sounds) {
            try {
                const response = await fetch(sound.url);
                const arrayBuffer = await response.arrayBuffer();
                this.buffers[sound.name] = await this.ctx.decodeAudioData(arrayBuffer);
            } catch (e) {
                console.warn(`Failed to load sound: ${sound.name}`, e);
            }
        }
    }

    play(name, volume = 0.4) {
        if (!this.ctx || !this.buffers[name]) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[name];
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(this.ctx.destination);
        source.connect(gainNode);
        source.start(0);
    }
}

export const audioManager = new AudioManager();