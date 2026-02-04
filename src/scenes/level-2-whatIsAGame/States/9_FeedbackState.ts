import WhatIsAGameState from './0_WhatIsAGameState';
import Confetti from '../../../objects/Confetti';
import WhatIsAGameQuiz from './10_WhatIsAGameQuiz';

export default class FeedbackState extends WhatIsAGameState {
    private confetti?: Confetti;

    enter(): void {
        this.givePlayerBall();
        this.addHindernis('hindernisMitRandom');
        this.addWater();
        this.confetti = new Confetti(this.scene);
        const feedbacks: string[] = [
            'UNFASSBAR! Dieser Wurf war so perfekt, besser geht es gar nicht.',
            'LEGENDÄRER TREFFER! Präzision, Timing und pure Größe – besser geht’s wirklich nicht.',
            'BOOM, KORB! Das war kein Zufall, das war Schicksal.',
            'Treffer! Sauber gezielt und genau im richtigen Moment geworfen.',
            'Gut gemacht! Der Ball sitzt sicher im Korb.',
            'Korb getroffen! Das war ein kontrollierter und präziser Wurf.'
        ];

        const randomIndex = Math.floor(Math.random() * feedbacks.length);
        this.scene.companion.say(feedbacks[randomIndex], () => {
            this.confetti?.destroy();
            this.scene.companion.say(
                'Fandest du das Feedback war angemessen, oder doch etwas übertrieben für die Situation?',
                () => {
                    this.scene.companion.say(
                        'Wichtig ist es, dass das Feedback zur Situation passt. Zu viel Lob kann übertrieben wirken und somit als nicht “ernstgemeint” aufgenommen werden.',
                        () => {
                            this.scene.companion.say(
                                'Das richtige Maß an Feedback ist sehr entscheidend um Spielende weiterhin zu motivieren.',
                                () => {
                                    this.scene.companion.say('', () => {
                                        this.scene.switchState(new WhatIsAGameQuiz(this.scene));
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    }

    update(): void {
        if (this.scene.ball) {
            this.scene.ball.update();
        }
    }
}
