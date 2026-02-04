import WhatIsAGameState from './0_WhatIsAGameState';
import ThrowBallState from './5_ThrowBallState';

export default class BallWrongChoiceState extends WhatIsAGameState {
    enter(): void {
        this.givePlayerBall(false);
        this.scene.companion.say(
            'Ähm... interessante Wahl! Die Leertaste eignet sich tatsächlich am Besten. Häufig werden die Tasten F11 oder ESC mit anderen Funktionen belegt, was dann zu Schwierigkeiten führen kann.',
            () =>
                this.scene.companion.say(
                    'F11 wird oft dafür verwendet in den Vollbildmodus zu wechseln. ESC dient im Spiel oft als Menuaufruf.',
                    () => this.scene.switchState(new ThrowBallState(this.scene))
                )
        );
    }

    update(): void {}
}
