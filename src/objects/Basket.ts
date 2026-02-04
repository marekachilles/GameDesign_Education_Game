import Phaser from 'phaser';
import Ball from './Ball';
import Player from './Player';

export type BasketOverlapHandler = () => void;

export default class Basket extends Phaser.GameObjects.Sprite {
    private readonly ball: Ball;
    private readonly player: Player;
    public overlapHandler?: BasketOverlapHandler;
    private readonly baseScale: number = 1;
    private hitLock: boolean = false;

    declare public body: Phaser.Physics.Arcade.Body;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        ball: Ball,
        player: Player,
        overlapHandler?: BasketOverlapHandler,
        textureKey: string = 'blue_basket',
        scale: number = 3
    ) {
        super(scene, x, y, textureKey);

        this.ball = ball;
        this.player = player;
        this.overlapHandler = overlapHandler;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Make the basket larger by default
        this.setScale(scale);
        this.baseScale = scale;

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.displayWidth, this.displayHeight, true);
        // Basket should not be affected by gravity and not move when hit
        body.setAllowGravity(false);
        body.setImmovable(true);
        body.setCollideWorldBounds(true);

        //this.scene.physics.add.collider(this, this.ball);
        this.scene.physics.add.collider(this, this.player);

        // Register overlap with the ball
        scene.physics.add.overlap(this, this.ball, () => {
            // visual feedback on hit
            this.flashHit();
            if (this.overlapHandler) {
                this.overlapHandler();
            }
        });
    }

    private flashHit() {
        if (this.hitLock) return;
        this.hitLock = true;

        // quick flash using tint fill
        this.setTintFill(0xffffaa);
        this.scene.time.delayedCall(120, () => {
            this.clearTint();
        });

        // subtle scale pulse
        this.scene.tweens.add({
            targets: this,
            scaleX: this.baseScale * 1.12,
            scaleY: this.baseScale * 1.12,
            duration: 90,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // ensure exact base scale and unlock
                this.setScale(this.baseScale);
                this.hitLock = false;
            }
        });
    }
}
