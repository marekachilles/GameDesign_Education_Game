import Obstacle from '../../objects/Obstacle';
import Player from '../../objects/Player';
import Companion from '../../objects/Companion';
import BaseScene from '../BaseScene';
import PauseMenuManager from '../../utils/PauseMenuManager';
import SoundManager from '../../utils/SoundManager';

export default class Level1Part2 extends BaseScene {
    private player!: Player;
    private target!: Obstacle;
    private obstacles: Obstacle[] = [];
    private companion!: Companion;
    private isFirstRun: boolean = true;
    private parkourFinished: boolean = false;

    constructor() {
        super('Level1Part2');
    }

    preload() {
        super.preload();
    }

    create() {
        const { width, height } = this.scale;

        super.create();
        localStorage.setItem('last_level_scene', 'Level1Part1');

        if (!SoundManager.getInstance().isPlaying('level1_2_bgm')) {
            SoundManager.getInstance().play('level1_2_bgm');
        }

        // Add Companion
        this.companion = new Companion(this);
        this.companion.say('Hier müssen wir diesen Parkour bewältigen. Versuch es mal!');

        // Level Design
        // Starting platform (approx 200px -> 3 blocks = 192px)
        this.obstacles.push(
            new Obstacle(this, 100, height - 100, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        // Jump course (approx 150px -> 3 blocks = 192px)
        this.obstacles.push(
            new Obstacle(this, 400, height - 250, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 700, height - 400, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 1000, height - 250, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 1300, height - 400, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        // Final platform (approx 300px -> 5 blocks = 320px)
        this.obstacles.push(
            new Obstacle(this, width - 150, height - 200, {
                blocksX: 5,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        // Player
        this.player = new Player(this, 100, height - 200);

        // Set Controls to same as in Level 1 Part 1
        this.player.setControlKey('up', Phaser.Input.Keyboard.KeyCodes.O);
        this.player.setControlKey('down', Phaser.Input.Keyboard.KeyCodes.U);
        this.player.setControlKey('left', Phaser.Input.Keyboard.KeyCodes.L);
        this.player.setControlKey('right', Phaser.Input.Keyboard.KeyCodes.R);
        this.player.setControlKey('sprint', Phaser.Input.Keyboard.KeyCodes.S);

        // Target Area
        this.target = new Obstacle(this, width - 100, height - 300, {
            width: 32,
            height: 30,
            colorOrTexture: 'crystal'
        });
        this.target.setVisible(false);
        this.target.disableInteractive();
        if (this.target.body) {
            this.target.body.enable = false;
        }

        // Collisions
        this.obstacles.forEach((obstacle, index) => {
            if (index === this.obstacles.length - 1) {
                // Last platform triggers parkour end
                this.physics.add.collider(this.player, obstacle, this.handleParkourEnd, undefined, this);
            } else {
                this.physics.add.collider(this.player, obstacle);
            }
        });

        this.physics.add.overlap(this.player, this.target, this.reachTarget, undefined, this);

        // Controls
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                PauseMenuManager.getInstance().show('Level1Part2');
            });
        }
    }

    update() {
        this.player.update();
    }

    reachTarget() {
        if (!this.isFirstRun) {
            this.scene.start('Level1Part3');
            this.scene.stop('Level1Part2');
        }
    }

    handleParkourEnd() {
        if (this.isFirstRun && !this.parkourFinished) {
            this.parkourFinished = true;
            this.player.setControlsEnabled(false);
            this.player.stopMovement();

            this.companion.say('Puh, das war anstrengend oder?', () => {
                this.companion.say('Diese Tastenbelegung ist wirklich nicht komfortabel.', () => {
                    this.companion.say(
                        'Hmm, vielleicht versuchen wir es mal mit oft zum Bewegen genutzten Tasten wie WASD oder den Pfeiltasten. Mit Shift kann man meistens rennen.',
                        () => {
                            // Reset Flow
                            this.player.resetControlKeysToDefault();
                            this.player.resetPosition();
                            this.isFirstRun = false;
                            this.target.setVisible(true);
                            this.target.setInteractive();
                            if (this.target.body) {
                                this.target.body.enable = true;
                            }

                            this.companion.say(
                                'Versuch es jetzt nochmal mit den neuen Tasten! (WASD oder Pfeiltasten und Shift)'
                            );
                            this.player.setControlsEnabled(true);
                        }
                    );
                });
            });
        }
    }
}
