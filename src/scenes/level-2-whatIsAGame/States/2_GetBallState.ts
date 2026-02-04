import WhatIsAGameState from './0_WhatIsAGameState';
import BallKeyChoiceState from './3_BallKeyChoiceState';

export default class GetBallState extends WhatIsAGameState {
    enter(): void {
        this.givePlayerBall(false);
        this.scene.companion.say('Lass mich dir einen Ball geben. Bälle sind toll. Alle sagen das!', () =>
            this.scene.switchState(new BallKeyChoiceState(this.scene))
        );
    }

    update(): void {
        this.scene.player.update();
    }


}
