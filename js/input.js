import { TILE_SIZE, MAP_SIZE } from './constants.js';

export class InputHandler {
    constructor(canvas, engine, state, renderer) {
        this.canvas = canvas;
        this.engine = engine;
        this.state = state;
        this.renderer = renderer;
        
        this.isDragging = false;
        this.isBuilding = false;
        this.lastMouse = { x: 0, y: 0 };
        this.lastCell = null;

        this.bindEvents();
    }

    getWorldCoord(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = clientX - rect.left;
        const cy = clientY - rect.top;
        const cam = this.renderer.cam;
        return {
            wx: (cx - (rect.width / 2 + cam.x)) / cam.zoom + MAP_SIZE * TILE_SIZE / 2,
            wy: (cy - (rect.height / 2 + cam.y)) / cam.zoom + MAP_SIZE * TILE_SIZE / 2
        };
    }

    bindEvents() {
        this.canvas.onmousedown = (e) => {
            if (e.button === 2) this.isDragging = true;
            if (e.button === 0) {
                this.isBuilding = true;
                this.handleClick(e);
            }
            this.lastMouse = { x: e.clientX, y: e.clientY };
        };

        window.onmousemove = (e) => {
            if (this.isDragging) {
                this.renderer.cam.x += e.clientX - this.lastMouse.x;
                this.renderer.cam.y += e.clientY - this.lastMouse.y;
            } else if (this.isBuilding && this.state.selectedTool === 'belt') {
                this.handleDragBuild(e);
            } else if (this.isBuilding && this.state.selectedTool === 'deleter') {
                const { wx, wy } = this.getWorldCoord(e.clientX, e.clientY);
                this.engine.removeEntity(Math.floor(wx/TILE_SIZE), Math.floor(wy/TILE_SIZE));
            }
            this.lastMouse = { x: e.clientX, y: e.clientY };
        };

        window.onmouseup = () => {
            this.isDragging = false;
            this.isBuilding = false;
            this.lastCell = null;
        };

        this.canvas.onwheel = (e) => {
            const cam = this.renderer.cam;
            const oldZoom = cam.zoom;
            cam.zoom = Math.max(0.2, Math.min(3, cam.zoom - e.deltaY * 0.001));
            
            // Zoom toward cursor (approx)
            const rect = this.canvas.getBoundingClientRect();
            const relX = (e.clientX - rect.left) - rect.width / 2;
            const relY = (e.clientY - rect.top) - rect.height / 2;
            cam.x = relX - (relX - cam.x) * (cam.zoom / oldZoom);
            cam.y = relY - (relY - cam.y) * (cam.zoom / oldZoom);
        };

        this.canvas.oncontextmenu = (e) => e.preventDefault();
    }

    handleClick(e) {
        const { wx, wy } = this.getWorldCoord(e.clientX, e.clientY);
        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);
        this.lastCell = { x: tx, y: ty };

        const tool = this.state.selectedTool;
        if (tool === 'cursor') {
            const ent = this.engine.getEntityAt(tx, ty);
            this.state.setSelectedEntityId(ent ? ent.id : null);
        } else if (tool === 'deleter') {
            this.engine.removeEntity(tx, ty);
        } else {
            this.engine.addEntity(tool, tx, ty, this.state.direction);
        }
    }

    handleDragBuild(e) {
        const { wx, wy } = this.getWorldCoord(e.clientX, e.clientY);
        const tx = Math.floor(wx / TILE_SIZE);
        const ty = Math.floor(wy / TILE_SIZE);
        if (this.lastCell && (this.lastCell.x !== tx || this.lastCell.y !== ty)) {
            const dx = tx - this.lastCell.x;
            const dy = ty - this.lastCell.y;
            let dir = this.state.direction;
            if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 1 : 3;
            else dir = dy > 0 ? 2 : 0;
            
            this.engine.addEntity('belt', this.lastCell.x, this.lastCell.y, dir);
            this.engine.addEntity('belt', tx, ty, dir);
            this.lastCell = { x: tx, y: ty };
        }
    }
}