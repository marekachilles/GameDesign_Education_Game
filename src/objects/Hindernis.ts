// ...existing code...
import Phaser from 'phaser';
import Player from './Player';
import Ball from './Ball';

export default class Hindernis extends Phaser.GameObjects.Container {
    private readonly player: Player;
    private readonly ball: Ball;
    private readonly minY: number;
    private readonly maxY: number;
    private _mode: 'hindernisOhneRandom' | 'hindernisMitRandom';

    public set mode(value: 'hindernisOhneRandom' | 'hindernisMitRandom') {
        this._mode = value;
        this.move(value);
    }
    private tween?: Phaser.Tweens.Tween;
    declare public body: Phaser.Physics.Arcade.Body;

    constructor(
        scene: Phaser.Scene,
        player: Player,
        ball: Ball,
        x: number,
        y: number,
        range: number = 180,
        mode: 'hindernisOhneRandom' | 'hindernisMitRandom' = 'hindernisOhneRandom',
        count: number = 3
    ) {
        super(scene, x, y);

        this.player = player;
        this.ball = ball;
        this.minY = y - range;
        this.maxY = y + range;
        this._mode = mode;

        const partWidth = 64;
        const overlap = 1;
        const effectiveHeight = (partWidth - overlap) * count;

        for (let i = 0; i < count; i++) {
            const sprite = scene.add.sprite(0, i * (partWidth - overlap) - effectiveHeight / 2, 'hindernis');
            sprite.setAngle(-90);
            sprite.setOrigin(0.5, 0); // Origin oben mitte (nach Drehung rechts mitte)
            this.add(sprite);
        }

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Body Größe anpassen. SpikesLow ist 64x45. Gedreht um -90°: 45 breit, 64 hoch.
        // Bei vertikalem Stack: Breite bleibt 45, Höhe wird effectiveHeight.
        this.body.setSize(45, effectiveHeight);
        this.body.setOffset(-22.5, -effectiveHeight / 2);

        this.scene.physics.add.collider(this, this.ball);
        this.scene.physics.add.collider(this, this.player);

        if (this._mode === 'hindernisOhneRandom') {
            this.startRhythm(scene);
        } else {
            this.startRandom(scene);
        }
    }

    // einfache Auf/Ab-Animation (gleichmäßiger Rhythmus)
    private startRhythm(scene: Phaser.Scene) {
        this.tween?.stop();
        this.tween = scene.tweens.add({
            targets: this,
            y: { from: this.minY, to: this.maxY },
            ease: 'Sine.easeInOut',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            onUpdate: () => this.body.updateFromGameObject()
        });
    }

    // zufällige Ziele zwischen minY und maxY
    private startRandom(scene: Phaser.Scene) {
        this.tween?.stop();
        const step = () => {
            const targetY = Phaser.Math.Between(this.minY, this.maxY);
            const duration = Phaser.Math.Between(300, 1200);
            this.tween = scene.tweens.add({
                targets: this,
                y: targetY,
                duration,
                ease: 'Sine.easeInOut',
                onUpdate: () => this.body.updateFromGameObject(),
                onComplete: () => {
                    const pause = Phaser.Math.Between(0, 300);
                    scene.time.delayedCall(pause, step, [], this);
                }
            });
        };
        step();
    }

    public move(mode?: 'hindernisOhneRandom' | 'hindernisMitRandom') {
        if (mode) this._mode = mode;
        if (this._mode === 'hindernisOhneRandom') this.startRhythm(this.scene);
        else this.startRandom(this.scene);
    }

    // einfache Bounce-/Abprall-Funktion für den Ball (falls vorhanden)
    public abprallen() {
        if (!this.ball) return;
        const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
        if (!ballBody) return;

        // Richtung weg vom Spieler
        let dirX = Math.sign(this.x - this.player.x);
        if (dirX === 0) dirX = 1;

        ballBody.setVelocity(dirX * 200, -250);
    }

    public stop(): this {
        this.tween?.pause();
        this.body.setVelocityY(0);
        return this;
    }

    public start(): this {
        this.tween?.resume();
        return this;
    }

    destroy(fromScene?: boolean) {
        this.tween?.stop();
        super.destroy(fromScene);
    }
}
// ...existing code...
