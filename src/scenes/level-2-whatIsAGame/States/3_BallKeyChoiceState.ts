import WhatIsAGameState from './0_WhatIsAGameState';
import Dialog from '../../../objects/Dialog';
import BallWrongChoiceState from './4b_BallWrongChoiceState';
import BallRightChoiceState from './4a_BallRightChoiceState';

export default class BallKeyChoiceState extends WhatIsAGameState {
    enter(): void {
        this.givePlayerBall(false);
        const { width, height } = this.scene.scale;
        new Dialog(this.scene, width / 2, height / 2, 'Ich möchte:', [
            {
                text: 'esc',
                callback: () => {
                    this.scene.switchState(new BallWrongChoiceState(this.scene));
                }
            },
            {
                text: 'F11',
                callback: () => {
                    this.scene.switchState(new BallWrongChoiceState(this.scene));
                }
            },
            {
                text: 'Leertaste',
                callback: () => {
                    this.scene.switchState(new BallRightChoiceState(this.scene));
                }
            }
        ]);
        this.scene.companion.say('Welche Taste denkst du eignet sich gut, um den Ball zu werfen?');
    }
    update(): void {}
}
