import Phaser from "phaser";
import Level3State from "./Level3State";
import Basket from "../../../objects/Basket";


export default class Level3MultiplayerState extends Level3State {
  private lastThrowBy: "player" | "npc1" | "npc2" | "npc3" | null = null;
  private scoreCooldownUntil = 0;
  private readonly SCORE_COOLDOWN_MS = 700;
  private hasScoredThisThrow = false;
  private onBasketHit = () => this.checkBasketScore(this.scene.time.now);

  // NPC Scores
  private npc1Score = 0;
  private npc2Score = 0;
  private npc3Score = 0;

  enter(): void {
    this.scene.setMovementLocked(true);
    this.scene.onPlayerThrow = () => {
      this.lastThrowBy = "player";
      this.scene.ball.setLastThrownBy("player");
      this.hasScoredThisThrow = false;
    };

    // Tutorial
    this.scene.companion.say(
      "Jetzt spielst du gegen 3 gegner gleichzeitig! " +
      "Jeder hat einen unterschiedlichen Schwierigkeitsgrad. " +
      "Versuche, sie alle zu besiegen und der beste Spieler zu sein!"+
      "Dabei gelten die gleichen Regeln wie zuvor: Du musst Körbe werfen, indem du den Ball aufhebst, Kraft lädst und wirfst. ",
      () =>
        this.scene.companion.say(
          "Dazu fügen wir noch all die Spiel-Mechaniken hinzu, die du bisher kennengelernt hast: "  + 
          "Hinderniss, Plattformen und einen NPC der gegen dich spielt! "+
          "Durch Kombination diser Bestandteile entsteht ein spannendes Erlebnis. ",

            () => 
            this.scene.companion.say(
              "Steuerung:\n" +
                "• [A/D] oder Pfeile: Laufen\n" +
                "• 1x [SPACE] nahe am Ball: Aufheben / klauen\n" +
                "• 2x [SPACE] halten: Kraft laden\n" +
                "• [SPACE] loslassen: Werfen\n\n" +
                "Viel Erfolg gegen 3 Gegner!",
            () => this.scene.startCountdown(3)
            )
        )
    );
      

    this.scene.scoreUI.setMultiplayerScore(
      this.scene.playerScore,
      this.npc1Score,
      this.npc2Score,
      this.npc3Score,
      this.scene.targetScore
    );
    this.scene.powerBar.hide();
    this.scene.events.on("basket:hit", this.onBasketHit);
  }

  exit(): void {
    this.scene.powerBar.hide();
    this.scene.events.off("basket:hit", this.onBasketHit);
  }

  update(time: number): void {
    if (this.scene.isMovementLocked || this.scene.isCountdownActive) return;
    // Player & Ball
    this.scene.player.update();
    this.scene.ball.update();

    // Update alle 3 NPCs
    if (this.scene.npc1) {
      this.scene.npc1.updateAI(time, this.scene.player, this.scene.ball, this.scene.basket, () => {
        this.lastThrowBy = "npc1";
        this.scene.ball.setLastThrownBy("npc1");
        this.hasScoredThisThrow = false;
      });
    }

    if (this.scene.npc2) {
      this.scene.npc2.updateAI(time, this.scene.player, this.scene.ball, this.scene.basket, () => {
        this.lastThrowBy = "npc2";
        this.scene.ball.setLastThrownBy("npc2");
        this.hasScoredThisThrow = false;
      });
    }

    if (this.scene.npc3) {
      this.scene.npc3.updateAI(time, this.scene.player, this.scene.ball, this.scene.basket, () => {
        this.lastThrowBy = "npc3";
        this.scene.ball.setLastThrownBy("npc3");
        this.hasScoredThisThrow = false;
      });
    }

    // Scoring handled via basket hit event
  }

  private checkBasketScore(timeMs: number): void {
    if (timeMs < this.scoreCooldownUntil) return;
    if (this.hasScoredThisThrow) return;

    const ball = this.scene.ball;
    const basket = this.scene.basket as Basket;

    if (ball.isHeld) return;

    const scorer = this.scene.ball.getLastThrownBy() ?? this.lastThrowBy;

    // Attribution
    if (scorer === "player") {
      this.scene.playerScore++;
    } else if (scorer === "npc1") {
      this.npc1Score++;
    } else if (scorer === "npc2") {
      this.npc2Score++;
    } else if (scorer === "npc3") {
      this.npc3Score++;
    } else {
      return;
    }

    this.scoreCooldownUntil = timeMs + this.SCORE_COOLDOWN_MS;
    this.hasScoredThisThrow = true;

    // UI Update mit allen 4 Scores
    this.scene.scoreUI.setMultiplayerScore(
      this.scene.playerScore,
      this.npc1Score,
      this.npc2Score,
      this.npc3Score,
      this.scene.targetScore
    );

    const who = scorer === "player" ? "Du" : scorer?.toUpperCase();
    this.scene.companion.say(`${who} hat getroffen!`);

    // Ball reset
    this.scene.resetBallToCenter();

    // Check ob jemand gewonnen hat
    const maxScore = Math.max(
      this.scene.playerScore,
      this.npc1Score,
      this.npc2Score,
      this.npc3Score
    );

    if (maxScore >= this.scene.targetScore) {
      let winner = "Unentschieden";
      if (this.scene.playerScore === maxScore) winner = "Du";
      else if (this.npc1Score === maxScore) winner = "NPC 1";
      else if (this.npc2Score === maxScore) winner = "NPC 2";
      else if (this.npc3Score === maxScore) winner = "NPC 3";

      this.scene.showResultBanner(winner === "Du" ? "win" : "lose");

      const playerWinLines = [
        "Stark! Du hast alle Gegner übertroffen.",
        "Mega! Du bist der Champion dieser Runde.",
        "Sauber gespielt – der Sieg gehört dir!"+
        " Weiter gehts mit dem nächsten Quiz!"
      ];

      const npcWinLines = [
        "Knapp! Einer der NPCs war heute stärker.",
        "Das war hart – versuch’s nochmal!",
        "Diesmal hat der NPC gewonnen. Nächstes Mal schaffst du es!",
      ];

      const endLine = winner === "Du"
        ? playerWinLines[Math.floor(Math.random() * playerWinLines.length)]
        : npcWinLines[Math.floor(Math.random() * npcWinLines.length)];

      this.scene.time.delayedCall(4000, () => {
        this.scene.companion.say(`${winner} hat ${this.scene.targetScore} Körbe getroffen! ${endLine}`, () => {
          this.scene.endLevelAndStartQuiz(winner);
        });
      });
    }
  }
}

