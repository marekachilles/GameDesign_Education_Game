import WhatIsAGameState from './0_WhatIsAGameState';
import GetBallState from './2_GetBallState';

export default class IntroState extends WhatIsAGameState {
    enter(): void {
        this.scene.companion.say('Hüpfen und so ist ja ganz lustig aber wirklich Spaß entsteht da nicht.', () =>
            this.scene.switchState(new GetBallState(this.scene))
        );
    }

    update(): void {
        this.scene.player.update();
    }
}
