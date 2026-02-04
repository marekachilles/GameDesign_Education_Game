import WhatIsAGameScene from '../WhatIsAGameScene';
import Ball from '../../../objects/Ball';
import Basket from '../../../objects/Basket';
import Hindernis from '../../../objects/Hindernis';
import Obstacle from '../../../objects/Obstacle';

export default abstract class WhatIsAGameState {
    protected scene: WhatIsAGameScene;

    constructor(scene: WhatIsAGameScene) {
        this.scene = scene;
    }

    protected givePlayerBall(enabled: boolean = true, easyBallback: boolean = true): void {
        if (!this.scene.ball) {
            this.scene.ball = new Ball(this.scene, this.scene.player, this.scene.powerBar, 250, 400);
            this.scene.ball.isEnabled = enabled;
            this.scene.ball.easyBallBack = easyBallback;
            this.scene.physics.add.collider(this.scene.ground, this.scene.ball);
        } else if (this.scene.ball) {
            this.scene.ball.isEnabled = enabled;
            this.scene.ball.easyBallBack = easyBallback;
        }
    }

    protected addBasket(overlapHandler?: () => void): void {
        if (this.scene.ball && this.scene.player && !this.scene.basket) {
            const { width, height } = this.scene.scale;
            if (overlapHandler) {
                this.scene.basket = new Basket(
                    this.scene,
                    width - 300,
                    height - 300,
                    this.scene.ball,
                    this.scene.player,
                    () => overlapHandler(),
                    'blue_basket'
                );
            } else {
                this.scene.basket = new Basket(
                    this.scene,
                    width - 300,
                    height - 300,
                    this.scene.ball,
                    this.scene.player,
                    undefined,
                    'blue_basket'
                );
            }
        } else if (this.scene.ball && this.scene.player && this.scene.basket && overlapHandler) {
            this.scene.basket.overlapHandler = () => overlapHandler();
        }
    }

    protected addHindernis(mode: 'hindernisOhneRandom' | 'hindernisMitRandom' = 'hindernisOhneRandom'): void {
        const { width, height } = this.scene.scale;

        // vorher entfernen falls vorhanden
        if (this.scene.hindernis) {
            this.scene.hindernis.destroy();
            this.scene.hindernis = undefined;
        }

        this.scene.hindernis = new Hindernis(
            this.scene,
            this.scene.player,
            this.scene.ball,
            width - 440,
            height - 350,
            180,
            mode
        );

        // Kollisionen registrieren
        this.scene.physics.add.collider(this.scene.player, this.scene.hindernis);
        if (this.scene.ball) {
            this.scene.physics.add.collider(this.scene.ball, this.scene.hindernis);
        }
    }

    protected addWater(): void {
        const { width, height } = this.scene.scale;
        const blockSize = Obstacle.BLOCK_SIZE;

        if (!this.scene.hindernis) return;

        // Boden verkürzen und Ende ausblenden
        const rawWaterXStart = this.scene.hindernis.x;
        const waterXStart = Math.round(rawWaterXStart / blockSize) * blockSize;
        const groundWidth = waterXStart;

        if (this.scene.ground) {
            this.scene.ground.destroy();
        }

        this.scene.ground = new Obstacle(this.scene, groundWidth / 2, height - 32, {
            width: groundWidth,
            height: 50,
            colorOrTexture: 'brown',
            showEnd: false
        });
        this.scene.physics.add.collider(this.scene.player, this.scene.ground);
        if (this.scene.ball) {
            this.scene.physics.add.collider(this.scene.ball, this.scene.ground);
        }

        // Wasser-Hindernis hinzufügen (reicht vom Hindernis bis zum rechten Rand)
        const waterWidth = Math.ceil((width - waterXStart) / blockSize) * blockSize;
        const waterY = height - 32;

        if (this.scene.water) {
            this.scene.water.destroy();
        }

        this.scene.water = new Obstacle(this.scene, waterXStart + waterWidth / 2, waterY, {
            width: waterWidth,
            height: 64,
            colorOrTexture: 'water',
            showStart: false
        });
        this.scene.water.setDepth(this.scene.ground.depth + 1);

        // Überlappung mit Wasser: Spieler zurücksetzen
        this.scene.physics.add.overlap(this.scene.player, this.scene.water, () => {
            this.scene.player.resetPosition();
            this.scene.companion.say('Netter Versuch, aber schwimmen kannst du leider nicht.');
        });

        if (this.scene.ball) {
            this.scene.physics.add.collider(this.scene.ball, this.scene.water);
        }
    }

    abstract enter(): void;

    abstract update(): void;

    public exit(): void {}
}
