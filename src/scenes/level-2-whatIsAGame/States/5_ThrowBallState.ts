import WhatIsAGameState from './0_WhatIsAGameState';
import AddBasketState from './6_AddBasketState';

export default class ThrowBallState extends WhatIsAGameState {
    private hasThrownThreeTimes: boolean = false;

    enter(): void {
        this.givePlayerBall();

        this.scene.companion.say(
            'Nun werfe den Ball! Und hebe ihn mit der Leertaste wieder auf! \n' +
                '• Drücke [Leertaste], um den Ball aufzuheben.\n' +
                '• Drücke [Leertaste] erneut und halte, um Kraft zu laden.\n' +
                '• Lasse los, um zu werfen!'
        );
    }

    override exit(): void {
        this.scene.player.pickUpBall(this.scene.ball);
    }

    update(): void {
        const player = this.scene.player;
        const ball = this.scene.ball;

        player.update();
        ball.update();

        if (ball.throwCount >= 3 && !this.hasThrownThreeTimes) {
            this.hasThrownThreeTimes = true;
            this.scene.companion.say('Gut gemacht! Du hast 3 Mal geworfen.', () => {
                this.scene.switchState(new AddBasketState(this.scene));
            });
        }
    }
}
