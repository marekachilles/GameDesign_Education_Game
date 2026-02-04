import Phaser from 'phaser';
import Obstacle from '../objects/Obstacle';
import Player from '../objects/Player';
import Companion from '../objects/Companion';
import PauseMenuManager from '../utils/PauseMenuManager';

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private ground!: Obstacle;
    private target!: Phaser.GameObjects.Rectangle;
    private companion!: Companion;

    constructor() {
        super('GameScene');
    }

    create() {
        const { width, height } = this.scale;

        // Add Companion
        this.companion = new Companion(this);

        // Ground
        this.ground = new Obstacle(this, width / 2, height - 20, { width, height: 40, solidColor: 0x00ff00 });

        // Player
        this.player = new Player(this, 100, 450);

        // Target (End of Level)
        this.target = this.add.rectangle(width - 50, height - 70, 50, 50, 0x0000ff);
        this.physics.add.existing(this.target, true); // Static body

        // Colliders
        this.physics.add.collider(this.player, this.ground);

        // Overlap check for winning condition
        this.physics.add.overlap(this.player, this.target, () => {
            this.companion.say('Level Complete!');

            // Delay transition to let player read message
            this.time.delayedCall(2000, () => {
                this.scene.start('LevelTwoScene');
            });
        });

        // ESC to pause
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                PauseMenuManager.getInstance().show('GameScene');
            });
        }
    }
}