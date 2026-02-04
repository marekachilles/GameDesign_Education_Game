import Phaser from 'phaser';
import Obstacle from '../objects/Obstacle';
import Player from '../objects/Player';
import BaseScene from './BaseScene';
import PauseMenuManager from '../utils/PauseMenuManager';

export default class LevelTwoScene extends BaseScene {
    private player!: Player;
    private target!: Phaser.GameObjects.Rectangle;
    private obstacles: Obstacle[] = [];

    constructor() {
        super('LevelTwoScene');
    }

    create() {
        const { width, height } = this.scale;

        // Level Design
        // Starting platform
        this.obstacles.push(
            new Obstacle(this, 100, height - 100, {
                width: 200,
                height: 50,
                colorOrTexture: 'brown'
            })
        );

        // Jump course
        this.obstacles.push(
            new Obstacle(this, 400, height - 250, {
                width: 150,
                height: 50,
                colorOrTexture: 'brown'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 700, height - 400, {
                width: 150,
                height: 50,
                colorOrTexture: 'brown'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 1000, height - 250, {
                width: 150,
                height: 50,
                colorOrTexture: 'brown'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 1300, height - 400, {
                width: 150,
                height: 50,
                colorOrTexture: 'brown'
            })
        );

        // Final platform
        this.obstacles.push(
            new Obstacle(this, width - 150, height - 200, {
                width: 300,
                height: 50,
                colorOrTexture: 'brown'
            })
        );

        // Player
        this.player = new Player(this, 100, height - 200);

        // Target Area
        this.target = this.add.rectangle(width - 100, height - 300, 50, 50, 0x0000ff);
        this.physics.add.existing(this.target, true);

        // Collisions
        this.obstacles.forEach((obstacle) => {
            this.physics.add.collider(this.player, obstacle);
        });

        this.physics.add.overlap(this.player, this.target, this.reachTarget, undefined, this);

        // Controls
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                PauseMenuManager.getInstance().show('LevelTwoScene');
            });
        }

        // Level Text
        this.add
            .text(width / 2, 50, 'Level 2', {
                fontSize: '48px',
                color: '#fff'
            })
            .setOrigin(0.5);
    }

    update() {
        this.player.update();
    }

    reachTarget() {
        this.scene.start('StartScene');
    }
}
