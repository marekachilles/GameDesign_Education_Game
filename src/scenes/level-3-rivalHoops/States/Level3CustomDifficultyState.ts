import Phaser from "phaser";
import Level3State from "./Level3State";
import NpcRival, { NpcDifficulty } from "../../../objects/NpcRival";
import Basket from "../../../objects/Basket";
import { NPC_PROFILES } from "../../../objects/NpcProfiles";

export default class Level3CustomDifficultyState extends Level3State {
  private lastThrowBy: "player" | "npc" | null = null;
  private scoreCooldownUntil = 0;
  private readonly SCORE_COOLDOWN_MS = 700;
  private hasScoredThisThrow = false;
  private onBasketHit = () => this.checkBasketScore(this.scene.time.now);

  private hasCompletedFirstRound = false;

  private uiRoot?: HTMLDivElement;
  private sliderInputs: Record<keyof NpcDifficulty, HTMLInputElement> = {} as any;

  enter(): void {
    this.scene.setMovementLocked(true);
    this.scene.onPlayerThrow = () => {
      this.lastThrowBy = "player";
      this.scene.ball.setLastThrownBy("player");
      this.hasScoredThisThrow = false;
    };
    this.scene.onNpcThrow = () => {
      this.lastThrowBy = "npc";
      this.scene.ball.setLastThrownBy("npc");
      this.hasScoredThisThrow = false;
    };

    this.scene.playerScore = 0;
    this.scene.npcScore = 0;
    this.scene.targetScore = 1;

    this.scene.scoreUI.setScore(this.scene.playerScore, this.scene.npcScore, this.scene.targetScore);
    this.scene.powerBar.hide();
    this.scene.resetBallToCenter();

    this.scene.events.on("basket:hit", this.onBasketHit);

    if (this.scene.npc) {
      this.scene.npc.destroy();
    }

    this.scene.companion.say(
      "Die letzte Runde war sehr einfach. Spaß entsteht oft erst dann, wenn Frustration und Erfolg in Waage gehalten werden.",
      () => {
        this.scene.companion.say(
          "Stell die Schwierigkeit jetzt selbst ein.",
          () => this.openDifficultyUI()
        );
      }
    );
  }

  exit(): void {
    this.cleanupUI();
    this.scene.powerBar.hide();
    this.scene.events.off("basket:hit", this.onBasketHit);
  }

  update(time: number): void {
    if (this.scene.isMovementLocked || this.scene.isCountdownActive) return;
    if (!this.scene.npc) return;

    this.scene.player.update();
    this.scene.ball.update();

    this.scene.npc.updateAI(time, this.scene.player, this.scene.ball, this.scene.basket, this.scene.onNpcThrow);

    // Scoring handled via basket hit event
  }

  private checkBasketScore(timeMs: number): void {
    if (timeMs < this.scoreCooldownUntil) return;
    if (this.hasScoredThisThrow) return;

    const ball = this.scene.ball;
    const basket = this.scene.basket as Basket;

    if (ball.isHeld) return;

    const scorer = this.scene.ball.getLastThrownBy() ?? this.lastThrowBy;

    if (scorer === "player") {
      this.scene.playerScore++;
    } else if (scorer === "npc") {
      this.scene.npcScore++;
    } else {
      return;
    }

    this.scoreCooldownUntil = timeMs + this.SCORE_COOLDOWN_MS;
    this.hasScoredThisThrow = true;

    this.scene.scoreUI.setScore(this.scene.playerScore, this.scene.npcScore, this.scene.targetScore);
    this.scene.resetBallToCenter();

    const who = scorer === "player" ? "Du" : "Der NPC";

    if (this.scene.playerScore >= this.scene.targetScore || this.scene.npcScore >= this.scene.targetScore) {
      const playerWon = this.scene.playerScore >= this.scene.targetScore;
      this.scene.showResultBanner(playerWon ? "win" : "lose");

      if (!this.hasCompletedFirstRound) {
        this.hasCompletedFirstRound = true;
        this.scene.time.delayedCall(4000, () => {
          this.scene.companion.say(
            "Hmm, ob das so richtig war? Versuche nochmal die Schwierigkeit zu optimieren.",
            () => {
              this.scene.playerScore = 0;
              this.scene.npcScore = 0;
              this.scene.targetScore = 1;
              this.scene.resetBallToCenter();

              if (this.scene.npc) {
                this.scene.npc.destroy();
                this.scene.npc = undefined as any;
              }

              this.openDifficultyUI();
            }
          );
        });
        return;
      }

      this.scene.time.delayedCall(4000, () => {
        this.scene.companion.say(`${who} hat getroffen!`, () => {
          this.scene.startMultiplayerMode();
        });
      });
    } else {
      this.scene.companion.say(`${who} hat getroffen!`);
    }
  }

  private openDifficultyUI(): void {
    this.cleanupUI();

    const base = NPC_PROFILES.medium.difficulty;

    const root = document.createElement("div");
    root.style.position = "absolute";
    root.style.left = "50%";
    root.style.top = "50%";
    root.style.transform = "translate(-50%, -50%)";
    root.style.width = "560px";
    root.style.maxHeight = "70vh";
    root.style.overflow = "auto";
    root.style.padding = "16px";
    root.style.background = "#ffd36b";
    root.style.border = "4px solid #ff6b6b";
    root.style.borderRadius = "18px";
    root.style.fontFamily = "Trebuchet MS, Arial";
    root.style.color = "#3b1f00";
    root.style.zIndex = "9999";
    root.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";

    const title = document.createElement("div");
    title.textContent = "Gegner-Schwierigkeit";
    title.style.fontSize = "22px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "8px";

    const subtitle = document.createElement("div");
    subtitle.textContent = "Passe die Werte an und starte die Runde.";
    subtitle.style.fontSize = "14px";
    subtitle.style.marginBottom = "12px";

    root.appendChild(title);
    root.appendChild(subtitle);

    const slidersWrap = document.createElement("div");
    slidersWrap.style.display = "grid";
    slidersWrap.style.gridTemplateColumns = "1fr";
    slidersWrap.style.rowGap = "10px";

    const addSlider = (
      key: keyof NpcDifficulty,
      label: string,
      min: number,
      max: number,
      step: number,
      value: number
    ) => {
      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "1fr 160px 60px";
      row.style.columnGap = "10px";
      row.style.alignItems = "center";

      const lab = document.createElement("div");
      lab.textContent = label;
      lab.style.fontSize = "14px";
      lab.style.fontWeight = "bold";

      const input = document.createElement("input");
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(value);
      input.style.width = "100%";

      const out = document.createElement("div");
      out.textContent = String(value);
      out.style.fontSize = "13px";
      out.style.textAlign = "right";

      input.addEventListener("input", () => {
        out.textContent = input.value;
      });

      row.appendChild(lab);
      row.appendChild(input);
      row.appendChild(out);

      slidersWrap.appendChild(row);
      this.sliderInputs[key] = input;
    };

    addSlider("speed", "Geschwindigkeit", 120, 360, 10, base.speed);
    addSlider("decisionMs", "Entscheidungszeit", 40, 250, 5, base.decisionMs);
    addSlider("pickupRadius", "Aufnahme-Radius", 40, 140, 5, base.pickupRadius);
    addSlider("throwPower", "Wurfkraft", 500, 1000, 10, base.throwPower);
    addSlider("aimErrorPx", "Ziel-Fehler", 0, 160, 5, base.aimErrorPx);
    addSlider("throwCooldownMs", "Wurf-Abklingzeit", 400, 1600, 20, base.throwCooldownMs);

    root.appendChild(slidersWrap);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.justifyContent = "center";
    actions.style.marginTop = "14px";

    const startBtn = document.createElement("button");
    startBtn.textContent = "Runde starten";
    startBtn.style.padding = "10px 16px";
    startBtn.style.borderRadius = "12px";
    startBtn.style.border = "2px solid #ff6b6b";
    startBtn.style.background = "#fff0b6";
    startBtn.style.fontWeight = "bold";
    startBtn.style.cursor = "pointer";

    startBtn.addEventListener("click", () => this.startRoundWithSelectedDifficulty());

    actions.appendChild(startBtn);
    root.appendChild(actions);

    document.body.appendChild(root);
    this.uiRoot = root;
  }

  private startRoundWithSelectedDifficulty(): void {
    const read = (key: keyof NpcDifficulty) => Number(this.sliderInputs[key]?.value ?? 0);
    const base = NPC_PROFILES.medium.difficulty;

    const difficulty: NpcDifficulty = {
      speed: read("speed"),
      decisionMs: read("decisionMs"),
      decisionJitterMs: base.decisionJitterMs,
      pickupRadius: read("pickupRadius"),
      jumpPower: base.jumpPower,
      jumpChance: base.jumpChance,
      jumpMinDxToHoop: base.jumpMinDxToHoop,
      throwPower: read("throwPower"),
      throwPowerJitter: base.throwPowerJitter,
      aimErrorPx: read("aimErrorPx"),
      aimErrorJitter: base.aimErrorJitter,
      throwCooldownMs: read("throwCooldownMs"),
      throwRangePx: base.throwRangePx,
      stealRadius: base.stealRadius,
      stealCooldownMs: base.stealCooldownMs,
      stealChance: base.stealChance,
      hesitateChance: base.hesitateChance,
      hesitateMs: base.hesitateMs,
    };

    this.cleanupUI();

    const centerX = this.scene.scale.width / 2;
    const spawnOffsetX = 360;
    this.scene.npc = new NpcRival(this.scene, centerX + spawnOffsetX, this.scene.basket.y, difficulty, "npc_1");
    this.scene.npc.setDifficulty(difficulty);
    this.scene.npc.y = this.scene.basket.y - this.scene.npc.displayHeight / 2;

    this.scene.physics.add.collider(this.scene.npc, this.scene.ground);
    this.scene.physics.add.overlap(this.scene.ball, this.scene.npc);

    this.scene.startCountdown(3);
  }

  private cleanupUI(): void {
    if (this.uiRoot) {
      this.uiRoot.remove();
      this.uiRoot = undefined;
    }
  }
}
