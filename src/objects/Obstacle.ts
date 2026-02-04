import Phaser from 'phaser';

type ObstacleColor = 'brown' | 'green' | 'blue' | 'yellow' | 'water';

interface ObstacleOptions {
    /** Number of horizontal blocks (alternative to width in pixels) */
    blocksX?: number;
    /** Number of vertical blocks (alternative to height in pixels) */
    blocksY?: number;
    /** Width in pixels (used when not specifying blocks) */
    width?: number;
    /** Height in pixels (used when not specifying blocks) */
    height?: number;
    /** Color preset or texture key */
    colorOrTexture?: ObstacleColor | string;
    /** Hex color code for solid colored obstacles (e.g., 0xff0000) */
    solidColor?: number;
    /** Whether to show the start tile (left/top depending on orientation) */
    showStart?: boolean;
    /** Whether to show the end tile (right/bottom depending on orientation) */
    showEnd?: boolean;
}

export default class Obstacle extends Phaser.GameObjects.Container {
    declare body: Phaser.Physics.Arcade.StaticBody;

    /** Standard tile/block size in pixels */
    static readonly BLOCK_SIZE = 64;

    constructor(scene: Phaser.Scene, x: number, y: number, options: ObstacleOptions) {
        super(scene, x, y);

        let finalWidth: number;
        let finalHeight: number;

        // Calculate dimensions based on blocks or pixels
        if (options.blocksX !== undefined && options.blocksY !== undefined) {
            finalWidth = options.blocksX * Obstacle.BLOCK_SIZE;
            finalHeight = options.blocksY * Obstacle.BLOCK_SIZE;
        } else if (options.width !== undefined && options.height !== undefined) {
            finalWidth = options.width;
            finalHeight = options.height;
        } else {
            throw new Error('Must specify either blocksX/blocksY or width/height');
        }

        // Create the visual representation
        if (options.solidColor !== undefined) {
            // Solid color rectangle
            const rect = scene.add.rectangle(0, 0, finalWidth, finalHeight, options.solidColor);
            this.add(rect);
        } else if (options.colorOrTexture && this.isColor(options.colorOrTexture)) {
            // Tiled platform using color preset
            const actualVisualSize = this.createPlatformFromColor(
                scene,
                finalWidth,
                finalHeight,
                options.colorOrTexture,
                options.showStart,
                options.showEnd
            );
            // Optional: Adjust physics body to match visual size?
            // For now let's keep it as requested to not break logic depending on exact width
            finalWidth = actualVisualSize.width;
            finalHeight = actualVisualSize.height;
        } else if (options.colorOrTexture) {
            // Custom texture as TileSprite
            const tile = scene.add.tileSprite(0, 0, finalWidth, finalHeight, options.colorOrTexture);
            this.add(tile);
        } else {
            // Default: green rectangle
            const rect = scene.add.rectangle(0, 0, finalWidth, finalHeight, 0x00ff00);
            this.add(rect);
        }

        scene.add.existing(this);
        scene.physics.add.existing(this, true); // true = static body

        // Store reference to physics body and set correct size
        this.body = this.body as Phaser.Physics.Arcade.StaticBody;
        
        // Body sollte die ganze sichtbare Fläche abdecken
        this.body.setSize(finalWidth, finalHeight);
        this.body.setOffset(-finalWidth / 2, -finalHeight / 2);

        // Manually position the body because refreshBody() crashes on Containers
        // and StaticBody doesn't automatically update position when offset changes
        this.body.position.x = this.x + this.body.offset.x;
        this.body.position.y = this.y + this.body.offset.y;

        console.log(`[Obstacle] Center: (${this.x}, ${this.y}), Body Pos: (${this.body.position.x}, ${this.body.position.y}), Size: ${this.body.width}x${this.body.height}`);
    }

    private isColor(value: string): value is ObstacleColor {
        return ['brown', 'green', 'blue', 'yellow', 'water'].includes(value);
    }

    private createPlatformFromColor(
        scene: Phaser.Scene,
        width: number,
        height: number,
        color: ObstacleColor,
        showStart: boolean = true,
        showEnd: boolean = true
    ): { width: number; height: number } {
        const blockSize = Obstacle.BLOCK_SIZE;
        const numBlocksX = Math.round(width / blockSize);
        const numBlocksY = Math.round(height / blockSize);

        // Adjust internal width/height to match the number of blocks to avoid gaps/overlaps
        const actualWidth = numBlocksX * blockSize;
        const actualHeight = numBlocksY * blockSize;

        // Map colors to their asset keys
        const assetKeyMap: Record<ObstacleColor, { start: string; middle: string; end: string; fill: string }> = {
            brown: {
                start: 'brown_platform_top_left',
                middle: 'brown_platform_top_middle',
                end: 'brown_platform_top_right',
                fill: 'brown_platform_fill'
            },
            green: {
                start: 'green_platform_top_start',
                middle: 'green_platform_top_middle',
                end: 'green_platform_top_end',
                fill: 'green_platform_fill'
            },
            blue: {
                start: 'blue_platform_top_left',
                middle: 'blue_platform_top_middle',
                end: 'blue_platform_top_right',
                fill: 'blue_platform_fill' // Placeholder
            },
            yellow: {
                start: 'yellow_platform_top_left',
                middle: 'yellow_platform_top_middle',
                end: 'yellow_platform_top_right',
                fill: 'yellow_platform_fill' // Placeholder
            },
            water: {
                start: 'water_top',
                middle: 'water_top',
                end: 'water_top',
                fill: 'water_fill'
            }
        };

        const keys = assetKeyMap[color];

        // Render tiles
        for (let y = 0; y < numBlocksY; y++) {
            const yPos = -actualHeight / 2 + blockSize / 2 + y * blockSize;
            const isTopRow = y === 0;

            if (numBlocksX >= 2) {
                // Full platform with start, middle(s), and end
                const startX = -actualWidth / 2 + blockSize / 2;

                // Start tile
                const startKey = isTopRow ? (showStart ? keys.start : keys.middle) : keys.fill;
                const startTile = scene.add.image(startX, yPos, startKey);
                this.add(startTile);

                // Middle tiles (if any)
                const numMiddleTiles = numBlocksX - 2;
                for (let i = 0; i < numMiddleTiles; i++) {
                    const middleX = startX + blockSize * (i + 1);
                    const middleKey = isTopRow ? keys.middle : keys.fill;
                    const middleTile = scene.add.image(middleX, yPos, middleKey);
                    this.add(middleTile);
                }

                // End tile
                const endX = startX + blockSize * (numBlocksX - 1);
                const endKey = isTopRow ? (showEnd ? keys.end : keys.middle) : keys.fill;
                const endTile = scene.add.image(endX, yPos, endKey);
                this.add(endTile);
            } else if (numBlocksX === 1) {
                // Single block
                const key = isTopRow ? keys.middle : keys.fill;
                const tile = scene.add.image(0, yPos, key);
                this.add(tile);
            }
        }

        return { width: actualWidth, height: actualHeight };
    }
}
