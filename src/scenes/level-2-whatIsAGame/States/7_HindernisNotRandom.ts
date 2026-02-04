import WhatIsAGameState from './0_WhatIsAGameState';
import HindernisMitRandom from './8_HindernisMitRandom';

export default class HindernisNotRandomState extends WhatIsAGameState {
    private basketHitted: boolean = false;

    enter(): void {
        this.givePlayerBall();
        this.addBasket();
        this.scene.companion.say('Langweilig? ' + 'Wie wäre es mit einem Hindernis.', () => {
            this.addHindernis('hindernisOhneRandom');
            this.addWater();
            this.scene.companion.say('Das Bewältigen von Hindernissen erzeugt ein noch größeres Gefühl von Erfolg.');
        });
    }

    update(): void {
        if (!this.basketHitted) {
            this.scene.player.update();
        }
        this.scene.ball?.update();

        if (this.scene.basket && !this.basketHitted) {
            this.scene.basket.overlapHandler = () => {
                if (this.basketHitted) return;

                this.scene.player.pickUpBall(this.scene.ball);
                this.basketHitted = true;
                this.scene.ball.isEnabled = false;

                this.scene.companion.say('Perfekt du hast den Korb getroffen!', () => {
                    this.scene.companion.say(
                        'Du hast das wirklich gut gemacht und dir somit ein schwierigeres Hindernis verdient.',
                        () => {
                            this.scene.companion.say('', () => {
                                'Wenn du etwas schaffst gibt dir das Spiel neue Herausforderungen, damit alles spannend bleibt.';
                            });
                            this.scene.companion.say(
                                'Das nennt man Feedback Loop das eine Art Rückmeldung vom Spiel.',
                                () => {
                                    this.scene.switchState(new HindernisMitRandom(this.scene));
                                }
                            );
                        }
                    );
                });
            };
        }
    }

    override exit(): void {
        this.scene.ball.isEnabled = true;
        if (this.scene.basket) {
            this.scene.basket.overlapHandler = undefined;
        }
    }
}
