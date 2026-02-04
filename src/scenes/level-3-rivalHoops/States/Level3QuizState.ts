import Phaser from "phaser";
import Obstacle from "../../../objects/Obstacle";
import Level3State from "./Level3State";

interface QuizQuestion {
  id: number;
  question: string;
  answerTop: string;
  answerBottom: string;
  correctAnswer: "top" | "bottom";
}

export default class Level3QuizState extends Level3State {
  private obstacles: Obstacle[] = [];
  private texts: Phaser.GameObjects.GameObject[] = [];
  private target?: Obstacle;

  private answeredQuestions: Set<number> = new Set();
  private correctAnswersCount = 0;

  private quizFinished = false;

  private startX = 100;
  private startY = 200;

  private questions: QuizQuestion[] = [
    {
      id: 1,
      question: "Warum machen NPC‑Gegner das Spiel spannender?",
      answerTop: "Sie erzeugen Konkurrenz und Interaktion",
      answerBottom: "Sie ersetzen die Steuerung des Spielers",
      correctAnswer: "top",
    },
    {
      id: 2,
      question: "Wann entsteht Spielspaß laut Level 3?",
      answerTop: "Wenn Frustration und Erfolg im Gleichgewicht sind",
      answerBottom: "Wenn alles immer sehr leicht ist",
      correctAnswer: "top",
    },
    {
      id: 3,
      question: "Wofür dienen Schwierigkeits‑Parameter beim NPC?",
      answerTop: "Sie steuern Verhalten und Herausforderung",
      answerBottom: "Sie ändern nur das Aussehen",
      correctAnswer: "top",
    },
    {
      id: 4,
      question: "Was passiert, wenn der NPC zu stark oder zu schwach ist?",
      answerTop: "Das Gleichgewicht aus Frust und Erfolg kippt",
      answerBottom: "Das Spiel wird automatisch spannender",
      correctAnswer: "top",
    },
  ];

  enter(): void {
    const { width, height } = this.scene.scale;

    this.scene.setMovementLocked(false);
    this.scene.powerBar.hide();
    this.scene.scoreUI.setScore(0, 0, 0);
    this.scene.scoreUI.hide();

    this.answeredQuestions.clear();
    this.correctAnswersCount = 0;

    this.disableCombatObjects();
    this.hideNonQuizObjects();

    // World bounds for quiz
    const levelWidth = width * (this.questions.length + 2);
    this.scene.physics.world.setBounds(0, 0, levelWidth, height);
    this.scene.cameras.main.setBounds(0, 0, levelWidth, height);

    // Player start
    this.startX = 100;
    this.startY = height - 600;
    this.scene.player.setPosition(this.startX, this.startY);
    this.scene.player.setControlsEnabled(true);
    this.scene.player.stopMovement();

    // Initial platform
    this.obstacles.push(
      new Obstacle(this.scene, 100, height - 500, {
        blocksX: 5,
        blocksY: 2,
        colorOrTexture: "brown",
      })
    );

    // Quiz segments
    let currentX = 500;
    this.questions.forEach((q, index) => {
      this.createQuestionSegment(currentX, height / 2, q);

      if (index < this.questions.length) {
        this.obstacles.push(
          new Obstacle(this.scene, currentX + 400, height / 2 + 50, {
            blocksX: 4,
            blocksY: 1,
            colorOrTexture: "brown",
          })
        );
      }

      currentX += 800;
    });

    const finalX = currentX;
    this.obstacles.push(
      new Obstacle(this.scene, finalX, height - 100, {
        blocksX: 5,
        blocksY: 2,
        colorOrTexture: "green",
      })
    );

    this.target = new Obstacle(this.scene, finalX + 100, height - 250, {
      width: 50,
      height: 50,
      solidColor: 0xffff00,
    });

    // Collisions
    this.obstacles.forEach((obstacle) => {
      this.scene.physics.add.collider(this.scene.player, obstacle);
    });

    if (this.target) {
      this.scene.physics.add.overlap(this.scene.player, this.target, this.finishLevel, undefined, this);
    }

    // Intro
    this.scene.companion.say(
      "Level 3 Quiz: Springe auf die Plattform mit der richtigen Antwort.",
      () => {}
    );

    // Camera follow
    this.scene.cameras.main.startFollow(this.scene.player, true, 0.05, 0.05);
    this.scene.cameras.main.setDeadzone(width * 0.2, height * 0.2);
  }

  update(): void {
    this.scene.player.update();

    if (this.scene.player.y > this.scene.scale.height + 100) {
      this.scene.player.setPosition(this.startX, this.startY);
    }
  }

  exit(): void {
    this.texts.forEach((obj) => obj.destroy());
    this.texts = [];

    this.obstacles.forEach((obj) => obj.destroy());
    this.obstacles = [];

    this.target?.destroy();
    this.target = undefined;

    this.restoreNonQuizObjects();
    this.scene.scoreUI.show();
  }

  private createQuestionSegment(x: number, centerY: number, question: QuizQuestion) {
    const questionText = this.scene.add.text(x, centerY - 250, question.question, {
      fontSize: "28px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 10, y: 10 },
      wordWrap: { width: 600 },
    }).setOrigin(0.5);
    this.texts.push(questionText);

    const topY = centerY - 50;
    const bottomY = centerY + 150;

    this.obstacles.push(
      new Obstacle(this.scene, x, topY, {
        blocksX: 4,
        blocksY: 1,
        colorOrTexture: "brown",
      })
    );

    this.obstacles.push(
      new Obstacle(this.scene, x, bottomY, {
        blocksX: 4,
        blocksY: 1,
        colorOrTexture: "brown",
      })
    );

    const topText = this.scene.add.text(x, topY - 50, question.answerTop, {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#000000aa",
      padding: { x: 5, y: 5 },
    }).setOrigin(0.5);

    const bottomText = this.scene.add.text(x, bottomY - 50, question.answerBottom, {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#000000aa",
      padding: { x: 5, y: 5 },
    }).setOrigin(0.5);

    this.texts.push(topText, bottomText);

    const zoneWidth = 50;
    const zoneHeight = 400;
    const zoneX = x + 128;

    const topZone = this.scene.add.zone(zoneX, topY - 100, zoneWidth, zoneHeight);
    this.scene.physics.add.existing(topZone);
    (topZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    const bottomZone = this.scene.add.zone(zoneX, bottomY - 100, zoneWidth, zoneHeight);
    this.scene.physics.add.existing(bottomZone);
    (bottomZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.texts.push(topZone, bottomZone);

    this.scene.physics.add.overlap(this.scene.player, topZone, () => this.handleAnswer(question, "top"), undefined, this);
    this.scene.physics.add.overlap(this.scene.player, bottomZone, () => this.handleAnswer(question, "bottom"), undefined, this);
  }

  private handleAnswer(question: QuizQuestion, selected: "top" | "bottom") {
    if (this.answeredQuestions.has(question.id)) return;

    this.answeredQuestions.add(question.id);

    if (selected === question.correctAnswer) {
      this.correctAnswersCount++;
      this.scene.companion.say("Das ist richtig!");
    } else {
      this.scene.companion.say("Das stimmt leider nicht!");
    }
  }

  private finishLevel() {
    if (this.quizFinished) return;
    this.quizFinished = true;

    this.scene.physics.pause();
    this.scene.player.setControlsEnabled(false);
    this.scene.player.stopMovement();

    this.saveKnowledge();
    localStorage.setItem("level", "3");

    const startQuizScene = () => {
      if (!this.scene.scene.isActive()) return;
      this.scene.scene.start("QuizScene", {
        playerId: this.scene.playerId,
        from: "Level3RivalHoopsScene",
        winner: this.scene.registry.get("level3_winner"),
      });
    };

    this.scene.companion.say(
      `Du hast ${this.correctAnswersCount} von ${this.questions.length} Fragen richtig beantwortet.`,
      () => startQuizScene()
    );

    this.scene.time.delayedCall(3000, () => startQuizScene());
  }

  private saveKnowledge(): void {
    const key = "gd_wissensspeicher_entries";
    const entry = {
      id: "level3",
      title: "Level 3: Rival Hoops",
      description: "NPC‑Gegner erhöhen Spannung und erfordern Balancing.",
      locked: false,
      subsections: [
        {
          title: "NPC‑Gegner",
          content: "NPCs sorgen für Konkurrenz und Interaktion, indem sie dem Spieler aktiv entgegenwirken.",
        },
        {
          title: "Frust vs. Erfolg",
          content: "Spielspaß entsteht, wenn Herausforderung und Erfolg im Gleichgewicht sind.",
        },
        {
          title: "Schwierigkeits‑Parameter",
          content: "Werte wie Geschwindigkeit, Sprungchance oder Wurfkraft bestimmen das Verhalten des NPCs.",
        },
      ],
    };

    let data: any[] = [];
    try {
      const raw = localStorage.getItem(key);
      data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) data = [];
    } catch {
      data = [];
    }

    const idx = data.findIndex((item) => item?.id === entry.id);
    if (idx >= 0) data[idx] = entry;
    else data.push(entry);

    localStorage.setItem(key, JSON.stringify(data));
  }

  private disableCombatObjects(): void {
    const ball = this.scene.ball as Phaser.GameObjects.Sprite | undefined;
    if (ball) {
      ball.setActive(false).setVisible(false);
      const body = ball.body as Phaser.Physics.Arcade.Body | undefined;
      if (body) body.enable = false;
    }

    const basket = this.scene.basket as Phaser.GameObjects.Sprite | undefined;
    if (basket) {
      basket.setActive(false).setVisible(false);
      const body = basket.body as Phaser.Physics.Arcade.Body | undefined;
      if (body) body.enable = false;
    }

    const npcs = [this.scene.npc, this.scene.npc1, this.scene.npc2, this.scene.npc3].filter(Boolean) as Phaser.GameObjects.Sprite[];
    npcs.forEach((npc) => {
      npc.setActive(false).setVisible(false);
      const body = npc.body as Phaser.Physics.Arcade.Body | undefined;
      if (body) body.enable = false;
    });
  }

  private hideNonQuizObjects(): void {
    if (this.scene.ground) {
      this.scene.ground.setVisible(false);
      const body = this.scene.ground.body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (body) body.enable = false;
    }

    this.scene.multiplayerPlatforms.forEach((platform) => {
      platform.setVisible(false);
      const body = platform.body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (body) body.enable = false;
    });

    this.scene.multiplayerHindernisse.forEach((hindernis) => {
      hindernis.setVisible(false);
      const body = hindernis.body as Phaser.Physics.Arcade.Body | undefined;
      if (body) body.enable = false;
    });
  }

  private restoreNonQuizObjects(): void {
    if (this.scene.ground) {
      this.scene.ground.setVisible(true);
      const body = this.scene.ground.body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (body) body.enable = true;
    }

    this.scene.multiplayerPlatforms.forEach((platform) => {
      platform.setVisible(true);
      const body = platform.body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (body) body.enable = true;
    });

    this.scene.multiplayerHindernisse.forEach((hindernis) => {
      hindernis.setVisible(true);
      const body = hindernis.body as Phaser.Physics.Arcade.Body | undefined;
      if (body) body.enable = true;
    });
  }
}
