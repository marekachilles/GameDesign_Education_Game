import Phaser from 'phaser';
import Obstacle from '../../objects/Obstacle';
import Player from '../../objects/Player';
import Companion from '../../objects/Companion';
import PauseMenuManager from '../../utils/PauseMenuManager';
import BaseScene from '../BaseScene';
import SoundManager from '../../utils/SoundManager';
import TaskTracker from '../../objects/TaskTracker';

export default class Level1Part3 extends BaseScene {
    private player!: Player;
    private obstacles: Obstacle[] = [];
    private collectibles: Phaser.Physics.Arcade.Image[] = [];
    private companion!: Companion;
    private target!: Obstacle;
    private collectedCount: number = 0;
    private totalCollectibles: number = 0;
    private taskTracker!: TaskTracker;
    private isTransitioning: boolean = false;

    constructor() {
        super('Level1Part3');
    }

    preload() {
        super.preload();
        // Brown platforms
        this.load.image('brown_platform_top_left', '/src/assets/environment/brown/brown_platform_top_left.png');
        this.load.image('brown_platform_top_middle', '/src/assets/environment/brown/brown_platform_top_middle.png');
        this.load.image('brown_platform_top_right', '/src/assets/environment/brown/brown_platform_top_right.png');
        this.load.image('brown_platform_fill', '/src/assets/environment/brown/brown_platform_middle.png');
        // Green platforms
        this.load.image('green_platform_top_start', '/src/assets/environment/green/green_platform_top_start.png');
        this.load.image('green_platform_top_middle', '/src/assets/environment/green/green_platform_top_middle.png');
        this.load.image('green_platform_top_end', '/src/assets/environment/green/green_platform_top_end.png');
        this.load.image('green_platform_fill', '/src/assets/environment/green/green_platform_middle.png');

        // Load collectible sprite --> change to better representation of sprite
        this.load.image('collectible_sprite', '/src/assets/abstract-platformer-pack/PNG/Items/keyRed.png');

        // Load Arrow sign
        this.load.image('left', '/src/assets/abstract-platformer-pack/PNG/Other/signArrow_left.png');
        this.load.image('right_up', '/src/assets/abstract-platformer-pack/PNG/Other/signArrow_TR.png');
    }

    create() {
        const { width, height } = this.scale;

        // Reset unlocked animations for this level
        this.registry.set('unlockedAnimations', []);

        this.collectedCount = 0;
        super.create();
        localStorage.setItem('last_level_scene', 'Level1Part1');

        if (!SoundManager.getInstance().isPlaying('level1_2_bgm')) {
            SoundManager.getInstance().play('level1_2_bgm');
        }

        // Add Companion
        this.companion = new Companion(this);
        this.companion.setScrollFactor(0);

        // Create TaskTracker for collectibles
        this.taskTracker = new TaskTracker(this, {
            type: 'counter',
            x: width - 20,
            y: 20,
            current: 0,
            total: 0,
            counterLabel: 'Animationen',
            fontSize: '24px'
        });

        // Level Design
        this.createLevel(width, height);

        // Player
        this.player = new Player(this, 150, height - 200);
        this.player.setControlsEnabled(false); // Disable controls initially

        // Target (End of Level)
        this.target = new Obstacle(this, 1230, height - 710, {
            width: 32,
            height: 30,
            colorOrTexture: 'crystal'
        });
        this.target.setVisible(false); // Hide target initially

        // Collisions
        this.obstacles.forEach((obstacle) => {
            this.physics.add.collider(this.player, obstacle);
        });

        // Collectibles overlap
        this.collectibles.forEach((collectible) => {
            this.physics.add.overlap(this.player, collectible, this.collectSprite, undefined, this);
        });

        // Target overlap
        this.physics.add.overlap(this.player, this.target, this.reachTarget, undefined, this);

        // Start Dialogue
        this.startIntroDialogue();

        // Camera Setup
        // Set bounds to allow multiple screens
        this.physics.world.setBounds(-width, 0, width * 2.5, height);
        this.cameras.main.setBounds(-width, 0, width * 2.5, height);

        // ESC to pause
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                PauseMenuManager.getInstance().show('Level1Part3');
            });
        }
    }

    private createLevel(width: number, height: number) {
        this.obstacles.push(
            new Obstacle(this, 100, height - 100, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        // find walk & run animation
        this.obstacles.push(
            new Obstacle(this, 400, height - 200, {
                blocksX: 2,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 700, height - 300, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 550, height - 480, {
                blocksX: 1,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 300, height - 600, {
                blocksX: 2,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 50, height - 700, {
                blocksX: 4,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.add.image(50, height - 760, 'left');

        this.addCollectible(10, height - 750, ['walk', 'sprint']);

        // find jump animation

        this.obstacles.push(
            new Obstacle(this, -85, height - 400, {
                blocksX: 6,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -450, height - 500, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -690, height - 400, {
                blocksX: 2,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -950, height - 460, {
                blocksX: 2,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -1500, height - 540, {
                blocksX: 1,
                blocksY: 5,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -1280, height - 500, {
                blocksX: 1,
                blocksY: 2,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -1750, height - 460, {
                blocksX: 1,
                blocksY: 3,
                colorOrTexture: 'brown'
            })
        );

        this.obstacles.push(
            new Obstacle(this, -1500, height - 350, {
                blocksX: 10,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        this.addCollectible(-1620, height - 420, ['jump']);

        // find fast and slow fall animation
        this.obstacles.push(
            new Obstacle(this, 1230, height - 500, {
                blocksX: 1,
                blocksY: 2,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 1500, height - 500, {
                blocksX: 2,
                blocksY: 2,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 1700, height - 530, {
                blocksX: 1,
                blocksY: 3,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 1950, height - 610, {
                blocksX: 2,
                blocksY: 6,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 1360, height - 420, {
                blocksX: 14,
                blocksY: 1,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 1230, height - 650, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 2290, height - 400, {
                blocksX: 1,
                blocksY: 4,
                colorOrTexture: 'green'
            })
        );

        this.obstacles.push(
            new Obstacle(this, 2380, height - 290, {
                blocksX: 4,
                blocksY: 1,
                colorOrTexture: 'green'
            })
        );

        this.add.image(1700, height - 652, 'right_up');

        this.addCollectible(2400, height - 380, ['fall', 'fast_fall']);

        this.obstacles.push(
            new Obstacle(this, 2000, height - 238, {
                blocksX: 5,
                blocksY: 1,
                colorOrTexture: 'green'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 2280, height - 100, {
                blocksX: 2,
                blocksY: 1,
                colorOrTexture: 'green'
            })
        );
        this.obstacles.push(
            new Obstacle(this, 2535, height - 140, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'green'
            })
        );

        // Update task tracker with total count
        this.taskTracker.updateCounter(0, this.totalCollectibles);
    }

    private addCollectible(x: number, y: number, animationKeys: string[]) {
        const collectible = this.physics.add.image(x, y, 'collectible_sprite');
        collectible.setData('animationKeys', animationKeys);

        (collectible.body as Phaser.Physics.Arcade.Body).allowGravity = false;

        // Add floating animation
        this.tweens.add({
            targets: collectible,
            y: y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.collectibles.push(collectible);
        this.totalCollectibles++;
    }

    private startIntroDialogue() {
        this.companion.say('Jetzt kannst du schon laufen!', () => {
            this.companion.say('Aber irgenwie siehst du noch nicht so aus als ob du dich wirklich bewegst.', () => {
                this.companion.say('Lass uns passende Animationen zu deiner Bewegung finden.');
                this.player.setControlsEnabled(true);
            });
        });
    }

    private collectSprite(player: any, collectible: any) {
        const animationKeys = collectible.getData('animationKeys') as string[];
        if (animationKeys) {
            animationKeys.forEach((key) => {
                this.player.unlockAnimation(key);
            });
        }
        collectible.destroy();
        this.collectedCount++;
        this.taskTracker.updateCounter(this.collectedCount);

        // Feedback
        this.companion.say('Super! Weiter so!', undefined); // Non-blocking message

        if (this.collectedCount === this.totalCollectibles) {
            SoundManager.getInstance().play('success');
            this.companion.say(
                'Toll, jetzt bewegt sich alles. Du kannst deine neuen Animationen gern testen. Wenn du bereit bist gehe weiter zum Ziel.'
            );
            this.target.setVisible(true);
        }
    }

    private reachTarget(player: any, target: any) {
        if (this.collectedCount >= this.totalCollectibles) {
            this.physics.pause(); // Stop physics
            this.player.setControlsEnabled(false);
            this.player.stopMovement();
            this.player.anims.play('idle', true);
            SoundManager.getInstance().play('success');
            this.companion.say('Geschafft! Jetzt hast du alle Animationen freigeschaltet.', () => {
                this.scene.start('Level1Quiz');
            });
        } else {
            // Optional: Warn player if they somehow reach target without all items (though target is hidden)
            this.companion.say('Hier bist du noch nicht richtig!');
        }
    }

    update() {
        this.player.update();
        this.updateCamera();
    }

    private updateCamera() {
        if (this.isTransitioning) return;

        const cam = this.cameras.main;
        const playerX = this.player.x;
        const { width } = this.scale;

        // Check right boundary
        if (playerX > cam.scrollX + width) {
            this.shiftCamera(width);
        }
        // Check left boundary
        else if (playerX < cam.scrollX) {
            this.shiftCamera(-width);
        }
    }

    private shiftCamera(offset: number) {
        this.isTransitioning = true;
        this.player.setControlsEnabled(false);
        const cam = this.cameras.main;

        // Pan to the new center
        const newX = cam.scrollX + offset;
        cam.pan(newX + cam.width / 2, cam.height / 2, 500, 'Power2');

        // Wait for pan to finish
        this.time.delayedCall(500, () => {
            this.isTransitioning = false;
            this.player.setControlsEnabled(true);
        });
    }
}
