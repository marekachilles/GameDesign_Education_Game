import WhatIsAGameState from './0_WhatIsAGameState';
import HindernisNotRandomState from './7_HindernisNotRandom';

export default class AddBasketState extends WhatIsAGameState {
    enter(): void {
        this.givePlayerBall();
        this.scene.companion.say(
            'Hast du Spaß? Ich glaube nicht ... lass mich dir ein Ziel geben. Ziele treiben die Spielenden an, am Ball zu bleiben.',
            () => {
                this.scene.companion.say('Wie wäre es mit einem Korb, den du versuchen kannst zu treffen?');
                this.addBasket(() => this.scene.switchState(new HindernisNotRandomState(this.scene)));
            }
        );
    }

    update(): void {
        this.scene.player.update();
        this.scene.ball.update();
    }

    override exit(): void {
        if (this.scene.basket) {
            this.scene.basket.overlapHandler = undefined;
        }
        this.scene.player.pickUpBall(this.scene.ball);
    }
}
