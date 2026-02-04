import Phaser from "phaser";
import Level3State from "./Level3State";

import Basket from "../../../objects/Basket";
import Level3CustomDifficultyState from "./Level3CustomDifficultyState";

export default class PlayRivalHoopsState extends Level3State {
  private lastThrowBy: "player" | "npc" | null = null;
  private scoreCooldownUntil = 0;
  private readonly SCORE_COOLDOWN_MS = 700;
  private onBasketHit = () => this.checkBasketScore(this.scene.time.now);

  enter(): void {
    this.scene.setMovementLocked(true);

    this.scene.onPlayerThrow = () => {
      this.lastThrowBy = "player";
      this.scene.ball.setLastThrownBy("player");
    };
    this.scene.onNpcThrow = () => {
      this.lastThrowBy = "npc";
      this.scene.ball.setLastThrownBy("npc");
    };

    // Tutorial
    this.scene.companion.say(
      "Level 3: Um in einen Spiel noch mehr Spannung zu erzeugen, werden oft NPC-Spieler eingesetzt die mit dem Spieler auf irgendeine Art und Weise interagieren!"+
      "Dieser NPC hier ist darauf programmiert gegen dich Ball zu spielen: Er versucht den Ball zu klauen, aufzuheben und Körbe zu werfen. "+
      "Gleichzeitig versucht er dich daran zu hindern, selbst Körbe zu werfen. " +
      "Lass dich nicht entmutigen, wenn du am Anfang verlierst – Übung macht in jedem guten Spiel den Meister!",
      () =>
        this.scene.companion.say(
          "Steuerung:\n" +
            "• [A/D] oder Pfeile: Laufen\n" +
            "• 1x [SPACE] nahe am Ball: Aufheben / klauen\n" +
            "• 2x [SPACE] halten: Kraft laden\n" +
            "• [SPACE] loslassen: Werfen\n\n" +
            "Der NPC versucht dasselbe. Viel Erfolg!",
            () => this.scene.startCountdown(3)
        )
    );

    this.scene.scoreUI.setScore(this.scene.playerScore, this.scene.npcScore, this.scene.targetScore);
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

    // NPC AI
    this.scene.npc.updateAI(time, this.scene.player, this.scene.ball, this.scene.basket, this.scene.onNpcThrow);

    // Scoring handled via basket hit event
  }

  private checkBasketScore(timeMs: number): void {
    if (timeMs < this.scoreCooldownUntil) return;

    const ball = this.scene.ball;
    const basket = this.scene.basket as Basket;

    if (ball.isHeld) return;

    const scorer = this.scene.ball.getLastThrownBy() ?? this.lastThrowBy;

    // Attribution
    if (scorer === "player") {
      this.scene.playerScore++;
    } else if (scorer === "npc") {
      this.scene.npcScore++;
    } else {
      return;
    }

    console.log(`[Score] Player: ${this.scene.playerScore}, NPC: ${this.scene.npcScore}, LastThrow: ${this.lastThrowBy}`);

    this.scoreCooldownUntil = timeMs + this.SCORE_COOLDOWN_MS;

    // UI sofort aktualisieren
    this.scene.scoreUI.setScore(this.scene.playerScore, this.scene.npcScore, this.scene.targetScore);

    // Ball sofort resetten
    this.scene.resetBallToCenter();

    const who = scorer === "player" ? "Du" : "Der NPC";
    
    // Prüfe auf Gewinn VOR Companion Message
    if (this.scene.playerScore >= this.scene.targetScore || this.scene.npcScore >= this.scene.targetScore) {
      const playerWon = this.scene.playerScore >= this.scene.targetScore;

      this.scene.showResultBanner(playerWon ? "win" : "lose");

      const winMessages = {
        playerWon: [
          "Fantastisch! Du hast gewonnen! 🎉",
          "Großartig! Deine Würfe waren unaufhaltbar! 🏀",
          "Du bist ein Champion! Der NPC hatte keine Chance! 🥇",
          "Sensationell! Du hast es geschafft! 🌟"
        ],
        npcWon: [
          "Der NPC war zu stark! Versuche es nochmal! 💪",
          "Knapp verloren! Der NPC war heute besser. Nächstes Mal! 🎯",
          "Du hattest eine gute Leistung, aber der NPC war unschlagbar! 🏆",
          "Der NPC dominiert! Aber gib nicht auf, versuch es erneut! 🔥"
        ]
      };

      const messages = playerWon ? winMessages.playerWon : winMessages.npcWon;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      this.scene.time.delayedCall(4000, () => {
        this.scene.companion.say(randomMessage, () => {
          if (playerWon) {
            // Player gewinnt -> Custom Difficulty State
            this.scene.switchState(new Level3CustomDifficultyState(this.scene));
          } else {
            // NPC gewinnt -> Neustart
            this.scene.registry.set("level3_multiplayer", false);
            this.scene.playerScore = 0;
            this.scene.npcScore = 0;
            this.scene.scene.restart();
          }
        });
      });
    } else {
      // Nur Punkt-Nachricht wenn nicht gewonnen
      this.scene.companion.say(`${who} hat getroffen!`);
    }
  }
}