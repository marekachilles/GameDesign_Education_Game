import WhatIsAGameState from './0_WhatIsAGameState';
import FeedbackState from './9_FeedbackState';

export default class HindernisMitRandomState extends WhatIsAGameState {
    enter(): void {
        this.givePlayerBall();
        this.addHindernis('hindernisMitRandom');
        this.addWater();

        this.scene.companion.say(
            'Um es herausfordernder zu gestalten lass es uns etwas unvorsehbarer machen, denn dadurch entsteht of mehr spaß!" \n'+
            'Das Hindernis bewegt sich nun unregelmäßig, mal schauen ob du das schaffst!'
        );

        this.addBasket(() => this.scene.switchState(new FeedbackState(this.scene)));
    }

    update(): void {
        this.scene.player.update();
        if (this.scene.ball) {
            this.scene.ball.update();
        }
    }

    exit(): void {
        this.scene.player.pickUpBall(this.scene.ball);
        this.scene.ball.isEnabled = false;
        if (this.scene.basket) {
            this.scene.basket.overlapHandler = undefined;
        }
    }
}
