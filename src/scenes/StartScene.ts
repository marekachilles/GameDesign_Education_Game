import Phaser from 'phaser';

import Obstacle from '../objects/Obstacle';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        // Preload platform assets (copied from BaseScene)
        this.load.image('brown_platform_top_left', '/src/assets/environment/brown/brown_platform_top_left.png');
        this.load.image('brown_platform_top_middle', '/src/assets/environment/brown/brown_platform_top_middle.png');
        this.load.image('brown_platform_top_right', '/src/assets/environment/brown/brown_platform_top_right.png');
        this.load.image('brown_platform_fill', '/src/assets/environment/brown/brown_platform_middle.png');

        // Preload background assets (using set2 as in BaseScene/Level1)
        this.load.image('bg2_solid', '/src/assets/abstract-platformer-pack/PNG/Backgrounds/set2_background.png');
        this.load.image('bg2_hills', '/src/assets/abstract-platformer-pack/PNG/Backgrounds/set2_hills.png');
        this.load.image('bg2_tiles', '/src/assets/abstract-platformer-pack/PNG/Backgrounds/set2_tiles.png');
    }

    create() {
        const { width, height } = this.scale;

        // Add background sprites (layering them)
        // Solid background color/sky
        this.add.image(width / 2, height / 2, 'bg2_solid').setDisplaySize(width, height);

        // Hills/Mountains (optional, but adds depth)
        this.add.image(width / 2, height / 2, 'bg2_hills').setDisplaySize(width, height);

        // Tiles/Overlay pattern
        this.add.image(width / 2, height / 2, 'bg2_tiles').setDisplaySize(width, height);

        // Add ground
        const groundHeight = 100; // Adjust as needed
        new Obstacle(this, width / 2, height - groundHeight / 2, {
            width: width,
            height: groundHeight,
            colorOrTexture: 'brown' // Using the brown theme
        });

        // Add HTML overlay
        let iframe = document.createElement('iframe');
        iframe.src = '/start.html';
        iframe.style.backgroundColor = 'transparent'; // Ensure iframe itself is transparent
        (iframe as any).allowTransparency = 'true'; // For older browser support/specific behaviors
        iframe.frameBorder = '0'; // Clean up border
        this.add.dom(
            width / 2,
            height / 2,
            iframe,
            'width: 100%; height: 100%; border: none; background-color: transparent;'
        );
    }
}
