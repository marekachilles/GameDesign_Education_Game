import Phaser from 'phaser';
import Obstacle from '../../objects/Obstacle';
import Player from '../../objects/Player';
import Companion from '../../objects/Companion';
import SoundManager from '../../utils/SoundManager';

interface QuizQuestion {
    id: number;
    question: string;
    answerTop: string;
    answerBottom: string;
    correctAnswer: 'top' | 'bottom';
}

export default class Level1Quiz extends Phaser.Scene {
    private player!: Player;
    private obstacles: Obstacle[] = [];
    private companion!: Companion;
    private target!: Obstacle;

    // Quiz State
    private questions: QuizQuestion[] = [
        {
            id: 1,
            question: 'Was ist das wichtigste Ziel von Game Design?',
            answerTop: 'Eine gute Spielerfahrung',
            answerBottom: 'Möglichst viel Geld verdienen',
            correctAnswer: 'top'
        },
        {
            id: 2,
            question: "Was bedeutet 'Agency' in Spielen?",
            answerTop: 'Handlungsfähigkeit des Spielers',
            answerBottom: 'Eine Agentur für Spieleentwicklung',
            correctAnswer: 'top'
        },
        {
            id: 3,
            question: 'Was sind typische Tasten, um sich zu bewegen',
            answerTop: 'L, R, O, U',
            answerBottom: 'W, A, S, D',
            correctAnswer: 'bottom'
        }
    ];

    private answeredQuestions: Set<number> = new Set();
    private correctAnswersCount: number = 0;

    constructor() {
        super('Level1Quiz');
    }

    preload() {
        // Brown platforms
        this.load.image('brown_platform_top_left', '/src/assets/environment/brown/brown_platform_top_left.png');
        this.load.image('brown_platform_top_middle', '/src/assets/environment/brown/brown_platform_top_middle.png');
        this.load.image('brown_platform_top_right', '/src/assets/environment/brown/brown_platform_top_right.png');
        this.load.image('brown_platform_fill', '/src/assets/environment/brown/brown_platform_middle.png');
        // Green platforms
        this.load.image('green_platform_top_start', '/src/assets/environment/green/green_platform_top_start.png');
        this.load.image('green_platform_top_middle', '/src/assets/environment/green/green_platform_top_middle.png');
        this.load.image('green_platform_top_end', '/src/assets/environment/green/green_platform_top_end.png');
        this.load.image('green_platform_fill', '/src/assets/environment/green/green_platform_middle.png');
    }

    create() {
        const { width, height } = this.scale;

        // Reset State
        this.answeredQuestions.clear();
        this.correctAnswersCount = 0;

        localStorage.setItem('last_level_scene', 'Level1Part1');

        if (!SoundManager.getInstance().isPlaying('level1_2_bgm')) {
            SoundManager.getInstance().play('level1_2_bgm');
        }

        // Setup World Bounds (Long enough for all questions)
        const levelWidth = width * (this.questions.length + 2);
        this.physics.world.setBounds(0, 0, levelWidth, height);
        this.cameras.main.setBounds(0, 0, levelWidth, height);

        // Player
        this.player = new Player(this, 100, height - 750);

        // Companion
        this.companion = new Companion(this);
        this.companion.setScrollFactor(0);

        // Initial Platform
        this.obstacles.push(
            new Obstacle(this, 100, height - 500, {
                blocksX: 5,
                blocksY: 2,
                colorOrTexture: 'brown'
            })
        );

        // Generate Quiz Segments
        let currentX = 500;
        this.questions.forEach((q, index) => {
            this.createQuestionSegment(currentX, height / 2, q);

            // Add intermediate platform between questions (but not after the last one yet)
            if (index < this.questions.length) {
                this.obstacles.push(
                    new Obstacle(this, currentX + 400, height / 2 + 50, {
                        blocksX: 4,
                        blocksY: 1,
                        colorOrTexture: 'brown'
                    })
                );
            }

            currentX += 750; // Distance between questions
        });

        // Final Platform & Target
        const finalX = currentX;

        this.obstacles.push(
            new Obstacle(this, finalX, height - 100, {
                blocksX: 5,
                blocksY: 2,
                colorOrTexture: 'green'
            })
        );

        this.target = new Obstacle(this, finalX + 100, height - 250, {
            width: 32,
            height: 30,
            colorOrTexture: 'crystal'
        });

        // Collisions
        this.obstacles.forEach((obstacle) => {
            this.physics.add.collider(this.player, obstacle);
        });
        this.physics.add.overlap(this.player, this.target, this.finishLevel, undefined, this);

        // Intro Dialogue
        this.companion.say('Willkommen zum Quiz! Springe auf die Plattform mit der richtigen Antwort.', () => {
            // Ready to go
        });

        // Camera Follow
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setDeadzone(width * 0.2, height * 0.2);
    }

    update() {
        this.player.update();

        // Simple fall check to reset player if they fall
        if (this.player.y > this.scale.height + 100) {
            this.player.resetPosition();
        }
    }

    private createQuestionSegment(x: number, centerY: number, question: QuizQuestion) {
        // 1. Question Text
        this.add
            .text(x, centerY - 250, question.question, {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#00000088',
                padding: { x: 10, y: 10 },
                wordWrap: { width: 600 }
            })
            .setOrigin(0.5);

        // 2. Platforms
        const topY = centerY - 50;
        const bottomY = centerY + 150;

        // Top Platform
        this.obstacles.push(
            new Obstacle(this, x, topY, {
                blocksX: 3,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        // Bottom Platform
        this.obstacles.push(
            new Obstacle(this, x, bottomY, {
                blocksX: 4,
                blocksY: 1,
                colorOrTexture: 'brown'
            })
        );

        // 3. Answer Text
        this.add
            .text(x, topY - 50, question.answerTop, {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 5, y: 5 }
            })
            .setOrigin(0.5);

        this.add
            .text(x, bottomY - 50, question.answerBottom, {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#000000aa',
                padding: { x: 5, y: 5 }
            })
            .setOrigin(0.5);

        // 4. Trigger Zones (Invisible)
        // Placed at the end of the platforms
        const zoneWidth = 50;
        const zoneHeight = 400; // Increased height to catch jumps
        const zoneX = x + 128; // At the edge of the platform (blocksX: 4 -> width 256 -> half 128)

        const topZone = this.add.zone(zoneX, topY - 100, zoneWidth, zoneHeight); // Offset upwards to catch jumps
        this.physics.add.existing(topZone);
        (topZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        const bottomZone = this.add.zone(zoneX, bottomY - 100, zoneWidth, zoneHeight); // Offset upwards
        this.physics.add.existing(bottomZone);
        (bottomZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Overlaps
        this.physics.add.overlap(this.player, topZone, () => this.handleAnswer(question, 'top'), undefined, this);
        this.physics.add.overlap(this.player, bottomZone, () => this.handleAnswer(question, 'bottom'), undefined, this);
    }

    private handleAnswer(question: QuizQuestion, selected: 'top' | 'bottom') {
        if (this.answeredQuestions.has(question.id)) return;

        this.answeredQuestions.add(question.id);

        if (selected === question.correctAnswer) {
            this.correctAnswersCount++;
            this.companion.say(`Das ist richtig!`);
        } else {
            this.companion.say(`Das stimmt leider nicht!`);
        }
    }

    private finishLevel() {
        this.physics.pause(); // Stop physics
        this.player.setControlsEnabled(false);
        this.player.stopMovement();
        //this.player.anims.play('idle', true);
        localStorage.setItem('level', '1');

        // Play success sound
        SoundManager.getInstance().play('success');

        this.companion.say(
            `Du hast ${this.correctAnswersCount} von ${this.questions.length} Fragen richtig beantwortet. 
            Wenn du möchtest, kannst du dir jetzt im Pausenmenü den Wissensspeicher anschauen, um noch mehr über Agency zu lernen!`,
            () => {
                this.scene.start('WhatIsAGameScene');
            }
        );
    }
}
