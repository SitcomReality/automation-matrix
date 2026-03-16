export class GameState {
    constructor() {
        this.currency = 0;
        this.selectedTool = 'cursor';
        this.direction = 2; // South
        this.selectedEntityId = null;
        this.listeners = [];

        // Load data
        const saved = localStorage.getItem('factory-state');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currency = data.currency || 0;
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
    }

    addCurrency(amount) {
        this.currency += amount;
        this.notify();
    }

    setTool(tool) {
        this.selectedTool = tool;
        this.notify();
    }

    setDirection(dir) {
        this.direction = parseInt(dir);
        this.notify();
    }

    setSelectedEntityId(id) {
        this.selectedEntityId = id;
        this.notify();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
        this.save();
    }

    save() {
        localStorage.setItem('factory-state', JSON.stringify({
            currency: this.currency
        }));
    }
}