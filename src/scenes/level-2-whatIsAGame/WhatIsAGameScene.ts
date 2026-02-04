import Companion from '../../objects/Companion';
import Obstacle from '../../objects/Obstacle';
import Player from '../../objects/Player';
import Ball from '../../objects/Ball';

import WhatIsAGameState from './States/0_WhatIsAGameState';
import IntroState from './States/1_IntroState';
import GetBallState from './States/2_GetBallState';
import BallKeyChoiceState from './States/3_BallKeyChoiceState';
import BallRightChoiceState from './States/4a_BallRightChoiceState';
import BallWrongChoiceState from './States/4b_BallWrongChoiceState';
import ThrowBallState from './States/5_ThrowBallState';
import AddBasketState from './States/6_AddBasketState';
import HindernisNotRandomState from './States/7_HindernisNotRandom';
import HindernisMitRandomState from './States/8_HindernisMitRandom';
import FeedbackState from './States/9_FeedbackState';
import WhatIsAGameQuiz from './States/10_WhatIsAGameQuiz';
import BlankState from './States/BlankState';
import PowerBar from '../../objects/PowerBar';
import Basket from '../../objects/Basket';
import Hindernis from '../../objects/Hindernis';
import BaseScene from '../BaseScene';
import SoundManager from '../../utils/SoundManager';
export default class WhatIsAGameScene extends BaseScene {
    public companion!: Companion;
    public player!: Player;
    public ball!: Ball;
    public ground!: Obstacle;
    public powerBar!: PowerBar;
    private actualState?: WhatIsAGameState;
    public playerId!: string;
    public answers: Record<string, string> = {};
    public hindernis?: Hindernis;
    public basket?: Basket;
    public water?: Obstacle;

    constructor() {
        super('WhatIsAGameScene');
    }

    create() {
        super.create();

        localStorage.setItem('last_level_scene', 'WhatIsAGameScene');

        if (!SoundManager.getInstance().isPlaying('level1_2_bgm')) {
            SoundManager.getInstance().play('level1_2_bgm');
        }
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            SoundManager.getInstance().stop('level1_2_bgm');
        });

        //Id für Fragebogen
        this.playerId = crypto.randomUUID();
        this.answers = {};

        const { width, height } = this.scale;

        // Companion
        this.companion = new Companion(this, 50, 50);
        this.companion.say('Willkommen in Level 2');

        // Boden
        this.ground = new Obstacle(this, width / 2, height - 32, {
            width: width,
            height: 50,
            colorOrTexture: 'brown'
        });
        // this.physics.add.existing(this.ground, true); // Obstacle constructor already does this

        // Player
        this.player = new Player(this, 100, 450, true);
        this.player.unlockAnimation('all');

        this.physics.add.collider(this.player, this.ground);

        // Power UI
        this.powerBar = new PowerBar(this, this.player.x, this.player.y - 60);

        // Ersten State starten
        this.switchState(new IntroState(this));

        // (Optional) Erstelle einen Ball falls dein Spiel einen Ball braucht
        // this.ball = new Ball(this, 8, 0xff6600, this.physics.world.gravity);

        // Kollisionen registrieren (nur hinzufügen, wenn Objekte existieren)
        if (this.hindernis) this.physics.add.collider(this.player, this.hindernis);
        if (this.ball && this.hindernis) this.physics.add.collider(this.ball, this.hindernis);
    }

    update() {
        this.actualState?.update();

        // PowerBar soll dem Player folgen
        this.powerBar.setPosition(this.player.x, this.player.y - 60);
    }

    switchState(newState: WhatIsAGameState) {
        this.actualState?.exit();
        this.actualState = newState;
        this.actualState.enter();

    }

    private getStateKey(state: WhatIsAGameState): string {
        if (state instanceof IntroState) return 'IntroState';
        if (state instanceof GetBallState) return 'GetBallState';
        if (state instanceof BallKeyChoiceState) return 'BallKeyChoiceState';
        if (state instanceof BallRightChoiceState) return 'BallRightChoiceState';
        if (state instanceof BallWrongChoiceState) return 'BallWrongChoiceState';
        if (state instanceof ThrowBallState) return 'ThrowBallState';
        if (state instanceof AddBasketState) return 'AddBasketState';
        if (state instanceof HindernisNotRandomState) return 'HindernisNotRandomState';
        if (state instanceof HindernisMitRandomState) return 'HindernisMitRandomState';
        if (state instanceof FeedbackState) return 'FeedbackState';
        if (state instanceof WhatIsAGameQuiz) return 'WhatIsAGameQuiz';
        if (state instanceof BlankState) return 'BlankState';
        return 'UnknownState';
    }

    private getStateFromKey(stateKey: string): WhatIsAGameState | undefined {
        switch (stateKey) {
            case 'IntroState':
                return new IntroState(this);
            case 'GetBallState':
                return new GetBallState(this);
            case 'BallKeyChoiceState':
                return new BallKeyChoiceState(this);
            case 'BallRightChoiceState':
                return new BallRightChoiceState(this);
            case 'BallWrongChoiceState':
                return new BallWrongChoiceState(this);
            case 'ThrowBallState':
                return new ThrowBallState(this);
            case 'AddBasketState':
                return new AddBasketState(this);
            case 'HindernisNotRandomState':
                return new HindernisNotRandomState(this);
            case 'HindernisMitRandomState':
                return new HindernisMitRandomState(this);
            case 'FeedbackState':
                return new FeedbackState(this);
            case 'WhatIsAGameQuiz':
                return new WhatIsAGameQuiz(this);
            case 'BlankState':
                return new BlankState(this);
            case 'MultipleChoiceState':
                return new WhatIsAGameQuiz(this);
            default:
                return undefined;
        }
    }
}
