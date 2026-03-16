export const MAP_SIZE = 50;
export const TILE_SIZE = 32;

export const BASE_RESOURCES = {
    bloodrock: { h: 5, s: 50, l: 30, sides: 3, label: 'Bloodrock' },
    tearshard: { h: 220, s: 50, l: 20, sides: 3, label: 'Tearshard' },
    snotstone: { h: 45, s: 50, l: 20, sides: 3, label: 'Snotstone' }
};

export const TOOLS = [
    { id: 'cursor', label: 'Select', icon: 'MousePointer2' },
    { id: 'miner', label: 'Miner', icon: 'Hammer' },
    { id: 'belt', label: 'Belt', icon: 'FastForward' },
    { id: 'screw-conveyor', label: 'Screw', icon: 'Activity' },
    { id: 'splitter', label: 'Splitter', icon: 'GitPullRequest' },
    { id: 'stitcher', label: 'Stitcher', icon: 'Scissors' },
    { id: 'blender', label: 'Blender', icon: 'Blend' },
    { id: 'hue-rotator', label: 'Prism', icon: 'RefreshCw' },
    { id: 'sand-processor', label: 'Polisher', icon: 'Sparkles' },
    { id: 'crystallizer', label: 'Apotheosis', icon: 'Gem' },
    { id: 'slot-machine', label: 'Sacrifice', icon: 'Coins' },
    { id: 'deleter', label: 'Delete', icon: 'Trash2' }
];

export const DIRECTIONS = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3
};