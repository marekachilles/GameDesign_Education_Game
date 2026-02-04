import Phaser from 'phaser';
import Obstacle from '../../objects/Obstacle';
import Player from '../../objects/Player';
import Companion from '../../objects/Companion';
import CharacterSelection from '../../objects/CharacterSelection';

import BaseScene from '../BaseScene';
import PauseMenuManager from '../../utils/PauseMenuManager';
import SoundManager from '../../utils/SoundManager';
import TaskTracker from '../../objects/TaskTracker';

export default class Level1Part1 extends BaseScene {
    private player!: Player;
    private ground!: Obstacle;
    private target!: Obstacle;
    private companion!: Companion;

    constructor() {
        super('Level1Part1');
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

        SoundManager.getInstance().play('level1_2_bgm');
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            SoundManager.getInstance().stop('level1_2_bgm');
        });

        // Add Companion
        this.companion = new Companion(this);
        this.companion.setScale(0);
        this.companion.setAlpha(0);

        // Ground - using block-based sizing for perfect tile alignment
        const groundY = height * 0.9;
        const groundBlocksX = Math.floor(width / 64); // Number of 64px blocks to cover width
        this.ground = new Obstacle(this, width / 2, height + 100, {
            blocksX: groundBlocksX,
            blocksY: 4,
            colorOrTexture: 'green'
        });
        this.ground.setAlpha(0); // Start invisible

        // Player
        this.player = new Player(this, 100, 450);
        this.player.setControlsEnabled(false);

        this.player.setVisible(false); // Start invisible

        // Animate Companion pop-in
        this.tweens.add({
            targets: this.companion,
            scale: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Start initial message after companion appears
                this.companion.say('Hallo? Ist hier jemand?', () => {
                    // Show Character Selection
                    const selection = new CharacterSelection(this, width / 2, height / 2, (spriteKey) => {
                        this.player.setSprite(spriteKey);
                        selection.destroy();

                        // Show Player and Reset Position (to prevent falling while invisible)
                        this.player.resetPosition();
                        this.player.setVisible(true);

                        // Animate Ground
                        this.tweens.add({
                            targets: [this.ground],
                            y: groundY,
                            alpha: 1,
                            duration: 1000,
                            ease: 'Power2',
                            onUpdate: () => {
                                // Update static body positions during tween
                                // We need to manually sync the body position with the tweened position
                                if (this.ground.body) {
                                    const body = this.ground.body as Phaser.Physics.Arcade.StaticBody;
                                    body.position.set(this.ground.x + body.offset.x, this.ground.y + body.offset.y);
                                }
                            },
                            onComplete: () => {
                                // Message 1
                                this.companion.say('Oh, da bist du ja. Schön dich kennenzulernen!', () => {
                                    // Message 2
                                    this.companion.say(
                                        'Ich habe gehört du interessierst dich für Game Design. Das trifft sich super weil ich finde Spiele auch toll!',
                                        () => {
                                            // Message 3
                                            this.companion.say(
                                                'Ich lerne Dinge am besten wenn ich sie ausprobieren kann, vielleicht ist das bei dir ja auch so?!',
                                                () => {
                                                    this.startKeyDiscoveryTutorial(width, height);
                                                }
                                            );
                                        }
                                    );
                                });
                            }
                        });
                    });
                });
            }
        });

        // Colliders
        this.physics.add.collider(this.player, this.ground);

        // ESC to pause
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                PauseMenuManager.getInstance().show('Level1Part1');
            });
        }
    }

    private startKeyDiscoveryTutorial(width: number, height: number) {
        this.companion.say(
            'Am besten fangen wir mit den Grundlagen an. Wie wärs wenn du dich erstmal versuchst zu bewegen?'
        );

        this.player.setControlsEnabled(true);
        // Setting unknown controls for first task
        this.player.setControlKey('up', Phaser.Input.Keyboard.KeyCodes.O);
        this.player.setControlKey('down', Phaser.Input.Keyboard.KeyCodes.U);
        this.player.setControlKey('left', Phaser.Input.Keyboard.KeyCodes.L);
        this.player.setControlKey('right', Phaser.Input.Keyboard.KeyCodes.R);
        this.player.setControlKey('sprint', Phaser.Input.Keyboard.KeyCodes.S);

        // Create TaskTracker for key discovery
        const taskTracker = new TaskTracker(this, {
            type: 'checklist',
            x: width - 100,
            y: 70,
            title: 'Finde die Buchstaben auf deiner Tastatur\nmit denen du dich nach links, rechts,\noben und unten bewegen kannst',
            tasks: [
                { id: 'left', label: 'Links  ', completed: false },
                { id: 'right', label: 'Rechts ', completed: false },
                { id: 'jump', label: 'Springen', completed: false },
                { id: 'duck', label: 'Ducken', completed: false },
                { id: 'run', label: 'Rennen', completed: false }
            ]
        });

        // Set completion callback
        taskTracker.onComplete(() => {
            this.time.removeEvent(keyCheckEvent);
            taskTracker.destroy();
            this.player.setControlsEnabled(false);

            SoundManager.getInstance().play('success');

            // Finish tutorial
            this.companion.say('Super! Du kannst dich mit deinem Charakter schonmal frei bewegen.', () => {
                this.companion.say(
                    'Das Gefühl, dass du bei der Steuerung hast, wird im Game Design als "Agency" bezeichnet.',
                    () => {
                        this.companion.say(
                            'Grob gesagt bedeutet Agency, dass du in dem Spiel ein Gefühl von Kontrolle und Selbstbestimmung hast.',
                            () => {
                                this.companion.say('Wenn du bereit bist laufe zu dem Stern da rechts.');

                                // Target (End of Level)
                                const targetY = height * 0.8 - 60;
                                // Start above the screen for falling animation
                                this.target = new Obstacle(this, width - 50, -100, {
                                    width: 32,
                                    height: 30,
                                    colorOrTexture: 'crystal'
                                });

                                // Overlap check for winning condition
                                this.physics.add.overlap(this.player, this.target, () => {
                                    this.scene.start('Level1Part2');
                                });

                                // Falling Animation
                                this.tweens.add({
                                    targets: this.target,
                                    y: targetY,
                                    duration: 1500,
                                    ease: 'Bounce.easeOut',
                                    onUpdate: () => {
                                        // Sync physics body with tween
                                        if (this.target.body) {
                                            const body = this.target.body as Phaser.Physics.Arcade.StaticBody;
                                            body.position.set(
                                                this.target.x + body.offset.x,
                                                this.target.y + body.offset.y
                                            );
                                        }
                                    },
                                    onComplete: () => {
                                        this.player.setControlsEnabled(true);
                                    }
                                });
                            }
                        );
                    }
                );
            });
        });

        // Monitor key presses
        const checkKeys = () => {
            if (this.input.keyboard) {
                const left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
                const right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
                const up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
                const down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
                const run = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

                if (left.isDown) taskTracker.completeTask('left');
                if (right.isDown) taskTracker.completeTask('right');
                if (up.isDown) taskTracker.completeTask('jump');
                if (down.isDown) taskTracker.completeTask('duck');
                if (run.isDown) taskTracker.completeTask('run');
            }
        };

        // Check keys every frame
        const keyCheckEvent = this.time.addEvent({
            delay: 100,
            callback: checkKeys,
            loop: true
        });
    }

    update() {
        this.player.update();
    }
}
