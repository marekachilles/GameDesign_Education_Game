import WhatIsAGameState from './0_WhatIsAGameState';
import Basket from '../../../objects/Basket';
import Obstacle from '../../../objects/Obstacle';

interface Question {
    id: string;
    text: string;
    choices: string[];
    correctIndex: number;
}

export default class WhatIsAGameQuiz extends WhatIsAGameState {
    private questions: Question[] = [
        {
            id: 'fun',
            text: 'Was ist das wichtigste Element eines guten Game Designs?',
            choices: ['Story', 'Spaß', 'Realismus'],
            correctIndex: 1
        },
        {
            id: 'feedback',
            text: "Was versteht man unter 'Feedback Loops' im Game Design?",
            choices: ['Rückmeldung des Spiels', 'Ein grafischer Effekt', 'Wiederholte Level'],
            correctIndex: 0
        },
        {
            id: 'ziel',
            text: 'Wie ensteht Spaß beim Spielen?',
            choices: ['Durch viel Text', 'Mit einem Ziel', 'Durch langes Warten'],
            correctIndex: 1
        }
    ];

    private index = 0;
    private tempBaskets: Basket[] = [];
    private tempTexts: Phaser.GameObjects.Text[] = [];
    private questionText?: Phaser.GameObjects.Text;

    enter(): void {
        const { width, height } = this.scene.scale;

        this.givePlayerBall();

        // Entferne bestehende Objekte aus der Szene
        if (this.scene.basket) {
            this.scene.basket.destroy();
            this.scene.basket = undefined;
        }
        if (this.scene.hindernis) {
            this.scene.hindernis.destroy();
            this.scene.hindernis = undefined;
        }

        // Wasser entfernen und Boden wieder komplett machen
        if (this.scene.water) {
            this.scene.water.destroy();
            this.scene.water = undefined;
        }
        if (this.scene.ground) {
            this.scene.ground.destroy();
        }
        this.scene.ground = new Obstacle(this.scene, width / 2, height - 32, {
            width: width,
            height: 50,
            colorOrTexture: 'brown'
        });
        this.scene.physics.add.collider(this.scene.player, this.scene.ground);

        this.scene.companion.say('Jetzt testen wir dein Wissen! Wirf den Ball in den richtigen Korb.');

        this.showQuestion();
    }

    exit(): void {
        this.cleanupQuestion();
    }

    update(): void {
        this.scene.player.update();
        if (this.scene.ball) {
            this.scene.ball.update();
        }
    }

    private cleanupQuestion() {
        this.tempBaskets.forEach((b) => b.destroy());
        this.tempBaskets = [];
        this.tempTexts.forEach((t) => t.destroy());
        this.tempTexts = [];
        if (this.questionText) {
            this.questionText.destroy();
            this.questionText = undefined;
        }
    }

    private showQuestion() {
        this.cleanupQuestion();

        if (this.index >= this.questions.length) {
            this.finishQuiz();
            return;
        }

        const q = this.questions[this.index];
        const { width, height } = this.scene.scale;

        // Frage anzeigen
        this.questionText = this.scene.add
            .text(width / 2, 100, q.text, {
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 800 }
            })
            .setOrigin(0.5);

        // Drei Körbe verteilt erstellen
        const basketXPositions = [width * 0.3, width * 0.6, width * 0.9];
        const basketYOffsets = [-100, -250, -400]; // Erster Korb etwas höher (vorher 0), andere mitgezogen

        q.choices.forEach((choice, i) => {
            const x = basketXPositions[i];
            const y = height - 150 + basketYOffsets[i];

            // Text über dem Korb
            const label = this.scene.add
                .text(x, y - 80, choice, {
                    fontSize: '16px',
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    padding: { x: 5, y: 5 },
                    align: 'center',
                    wordWrap: { width: 150 }
                })
                .setOrigin(0.5);
            this.tempTexts.push(label);

            const basket = new Basket(
                this.scene,
                x,
                y,
                this.scene.ball,
                this.scene.player,
                () => this.answer(q, i),
                'blue_basket',
                2
            );
            this.tempBaskets.push(basket);
        });
    }

    private answer(question: Question, choiceIndex: number) {
        // Verhindere multiple Triggerungen während des Übergangs
        this.tempBaskets.forEach((b) => (b.overlapHandler = undefined));

        const choice = question.choices[choiceIndex];
        const isCorrect = choiceIndex === question.correctIndex;

        // Speichern
        this.scene.answers[question.id] = choice;
        this.saveAnswer(this.scene.playerId, question.id, choice);

        this.scene.player.pickUpBall(this.scene.ball);

        if (isCorrect) {
            this.scene.companion.say('Richtig! Auf zur nächsten Frage?', () => {
                this.index++;
                this.showQuestion();
            });
        } else {
            this.scene.companion.say('Das war leider falsch. Versuche es nochmal!', () => {
                // Re-enable baskets for retry
                this.showQuestion();
            });
        }
    }

    private saveAnswer(playerId: string, questionId: string, answer: string) {
        const key = `answers_${playerId}`;
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        stored[questionId] = answer;
        localStorage.setItem(key, JSON.stringify(stored));
    }

    private finishQuiz() {
        localStorage.setItem('level', '2');

        this.scene.companion.say(
            'Gut gemacht! Deine Antworten wurden gespeichert. Jetzt geht es weiter zu Level 3!',
            () => {
                this.scene.playerId = crypto.randomUUID();
                this.scene.answers = {};
                this.scene.scene.start('Level3RivalHoopsScene');
            }
        );
    }
}
