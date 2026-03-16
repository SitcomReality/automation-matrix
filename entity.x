// Check for items on this building to show their properties
    const items = this.engine.items.filter(it => it.x >= entity.x && it.x < entity.x + entity.width && it.y >= entity.y && it.y < entity.y + entity.height);
    if (items.length > 0) {
        const item = items[0];
        container.innerHTML += `
            <div class="selection-title" style="margin-top:15px; font-size: 11px;">Carrying: ${item.label || item.type}</div>
            <div class="selection-row">
                <span>Hue</span>
                <span>${Math.floor(item.h || 0)}°</span>
            </div>
            <div class="selection-row">
                <span>Vibrancy</span>
                <span>${Math.floor(item.s || 0)}%</span>
            </div>
            <div class="selection-row">
                <span>Complexity</span>
                <span>${item.sides || 0} sides</span>
            </div>
        `;
    }