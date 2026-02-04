import Phaser from "phaser";
import BaseScene from "../BaseScene";

import Player from "../../objects/Player";
import Ball from "../../objects/Ball";
import Basket from "../../objects/Basket";
import NpcRival from "../../objects/NpcRival";
import ScoreUI from "../../objects/ScoreUI";
import Companion from "../../objects/Companion";
import PowerBar from "../../objects/PowerBar";
import Obstacle from "../../objects/Obstacle";
import Hindernis from "../../objects/Hindernis";

import Level3State from "./States/Level3State";
import PlayRivalHoopsState from "./States/PlayRivalHoopsState";
import Level3CustomDifficultyState from "./States/Level3CustomDifficultyState";
import Level3MultiplayerState from "./States/Level3MultiplayerState";
import Level3QuizState from "./States/Level3QuizState";
import { NPC_PROFILES, NpcProfileId } from "../../objects/NpcProfiles";
import SoundManager from "../../utils/SoundManager";

export default class Level3RivalHoopsScene extends BaseScene {
  public companion!: Companion;

  public player!: Player;
  public npc!: NpcRival;
  public npc1?: NpcRival;
  public npc2?: NpcRival;
  public npc3?: NpcRival;
  public ball!: Ball;
  public basket!: Basket;

  public scoreUI!: ScoreUI;
  public powerBar!: PowerBar;

  public actualState?: Level3State;

  public playerScore = 0;
  public npcScore = 0;
  public targetScore = 3;

  public onPlayerThrow?: () => void;
  public onNpcThrow?: () => void;

  public playerId: string = Phaser.Utils.String.UUID();

  public ground!: Obstacle;
  public multiplayerPlatforms: Obstacle[] = [];
  public multiplayerHindernisse: Hindernis[] = [];

  public isCountdownActive = false;
  public isMovementLocked = false;
  private countdownContainer?: Phaser.GameObjects.Container;
  private countdownText?: Phaser.GameObjects.Text;

  private resultContainer?: Phaser.GameObjects.Container;
  private resultText?: Phaser.GameObjects.Text;

  private profileOrder: NpcProfileId[] = ["easy", "medium", "hard"];
  private profileIndex = 0;
  
  public isMultiplayer = false;
  private forceFreshStart = false;
  private groundTopY = 0;
  private forceMultiplayerStart = false;

  constructor() {
    super("Level3RivalHoopsScene");
  }

  init(data?: { forceFresh?: boolean; startMultiplayer?: boolean }) {
    this.forceFreshStart = data?.forceFresh === true;
    this.forceMultiplayerStart = data?.startMultiplayer === true;
  }

  preload() {
    super.preload();
  }

  create() {
    super.create();

    localStorage.setItem("last_level_scene", "Level3RivalHoopsScene");

    SoundManager.getInstance().play("level3_bgm");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      SoundManager.getInstance().stop("level3_bgm");
    });

    if (this.forceFreshStart) {
      this.registry.set("level3_multiplayer", false);
      this.registry.set("level3_winner", null);
      this.playerScore = 0;
      this.npcScore = 0;
      this.targetScore = 3;
      this.profileIndex = 0;
      this.isMultiplayer = false;
    }

    if (this.forceMultiplayerStart) {
      this.registry.set("level3_multiplayer", true);
      this.isMultiplayer = true;
    }

    this.targetScore = 3;

    if (this.countdownContainer) {
      this.countdownContainer.destroy(true);
    }
    this.countdownContainer = undefined;
    this.countdownText = undefined;
    this.isCountdownActive = false;
    this.isMovementLocked = false;
    this.resultContainer = undefined;
    this.resultText = undefined;
    this.multiplayerPlatforms = [];
    this.multiplayerHindernisse = [];

    this.playerScore = 0;
    this.npcScore = 0;
    this.targetScore = 3;
    this.profileIndex = 0;
    this.playerId = Phaser.Utils.String.UUID();


    const { width, height } = this.scale;

    // -----------------------------------------
    // 1) World / Ground
    // -----------------------------------------
    const tileSize = 64;
    const groundBlocksY = 3;
    const groundBlocksX = Math.ceil(width / tileSize);
    // const groundHeight = groundBlocksY * tileSize;
    
    // Boden etwa 80% nach unten positionieren
    const groundY = height - 40; // Näher nach oben, damit Sprites auf dem Boden stehen können

    this.ground = new Obstacle(this, width / 2, groundY, {
      blocksX: groundBlocksX,
      blocksY: groundBlocksY,
      colorOrTexture: "green",
    });
    const groundTopY = groundY - (groundBlocksY * tileSize) / 2;
    this.groundTopY = groundTopY;

    // -----------------------------------------
    // 2) UI / Companion
    // -----------------------------------------
    this.companion = new Companion(this, 50, 50);

    this.scoreUI = new ScoreUI(this);
    this.scoreUI.setScore(this.playerScore, this.npcScore, this.targetScore);

    this.powerBar = new PowerBar(this, 0, 0);
    this.powerBar.hide();

    // -----------------------------------------
    // 3) Player
    // -----------------------------------------
    const centerX = width / 2;
    const spawnOffsetX = 360;

    this.player = new Player(this, centerX - spawnOffsetX, 0, true);
    this.player.y = groundTopY - this.player.displayHeight / 2;
    this.player.unlockAnimation("all");

    // -----------------------------------------
    // 4) NPC (Profile + Skin)
    // -----------------------------------------
    const profileId = this.profileOrder[this.profileIndex];
    const profile = NPC_PROFILES[profileId];
    
    const selectedSkin = "npc_1";
    
    this.npc = new NpcRival(this, centerX + spawnOffsetX, 1000, profile.difficulty, selectedSkin);
    this.npc.y = groundTopY - this.npc.displayHeight / 2;

    this.ball = new Ball(this, this.player, this.powerBar, 320, groundTopY - 160);

    this.basket = new Basket(
      this,
      centerX,
      this.registry.get("level3_multiplayer") ? height - 700 : height - 500,
      this.ball,
      this.player,
      () => {
        this.events.emit("basket:hit");
      },
      "blue_basket",
      2.2
    );

    this.ball.setPosition(centerX, this.basket.y + 140);
    
    
    this.physics.add.collider(this.ball, this.ground);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.npc, this.ground);
    this.physics.add.collider(this.ground, this.npc);
    this.physics.add.collider(this.ball, this.ground);

    this.physics.add.overlap(this.ball, this.player, () => {
    });

    this.physics.add.overlap(this.ball, this.npc, () => {
      
    });

    
    this.physics.add.collider(this.ball, this.basket);

    const shouldMultiplayer = this.registry.get("level3_multiplayer") === true;

    // Check ob Multiplayer Mode
    if (shouldMultiplayer) {
      this.setupMultiplayer(groundTopY);
    }

    if (shouldMultiplayer) {
      this.switchState(new Level3MultiplayerState(this));
    } else {
      this.switchState(new PlayRivalHoopsState(this));
    }
  }

  private setupMultiplayer(groundTopY: number): void {
    this.isMultiplayer = true;

    const { width } = this.scale;
    const centerX = width / 2;

    // Zerstöre den alten Single-NPC
    if (this.npc) {
      this.npc.destroy();
    }

    const profiles = ["easy", "medium", "hard"] as NpcProfileId[];
    const skins: Array<"npc_1"> = ["npc_1", "npc_1", "npc_1"];

    // Erstelle Sprung-Obstacles
    this.createJumpObstacles(groundTopY);

    this.multiplayerPlatforms.forEach((platform) => {
      platform.setVisible(true);
      const body = platform.body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (body) body.enable = true;
    });

    // Zufällige Reihenfolge der Profile und Skins
    const shuffledProfiles = [...profiles].sort(() => Math.random() - 0.5);
    const shuffledSkins = [...skins];

    const npcOffsetX = 360;

    // NPC 1
    this.npc1 = new NpcRival(
      this,
      centerX + npcOffsetX,
      1000,
      NPC_PROFILES[shuffledProfiles[0]].difficulty,
      shuffledSkins[0]
    );
    this.npc1.y = groundTopY - this.npc1.displayHeight / 2;
    this.physics.add.collider(this.npc1, this.ground);
    this.physics.add.overlap(this.ball, this.npc1);

    // NPC 2
    this.npc2 = new NpcRival(
      this,
      centerX + npcOffsetX + 220,
      1000,
      NPC_PROFILES[shuffledProfiles[1]].difficulty,
      shuffledSkins[1]
    );
    this.npc2.y = groundTopY - this.npc2.displayHeight / 2;
    this.physics.add.collider(this.npc2, this.ground);
    this.physics.add.overlap(this.ball, this.npc2);

    // NPC 3
    this.npc3 = new NpcRival(
      this,
      centerX + npcOffsetX + 440,
      1000,
      NPC_PROFILES[shuffledProfiles[2]].difficulty,
      shuffledSkins[2]
    );
    this.npc3.y = groundTopY - this.npc3.displayHeight / 2;
    this.physics.add.collider(this.npc3, this.ground);
    this.physics.add.overlap(this.ball, this.npc3);

    this.attachNpcPlatformColliders();
  }

  public startMultiplayerMode(): void {
    this.registry.set("level3_multiplayer", true);
    this.scene.restart({ startMultiplayer: true });
  }

  private attachNpcPlatformColliders(): void {
    if (!this.multiplayerPlatforms.length) return;

    this.multiplayerPlatforms.forEach((platform) => {
      if (this.npc1) this.physics.add.collider(this.npc1, platform);
      if (this.npc2) this.physics.add.collider(this.npc2, platform);
      if (this.npc3) this.physics.add.collider(this.npc3, platform);
      this.physics.add.collider(this.ball, platform);
    });
  }

  update(time: number, delta: number) {
    this.actualState?.update(time, delta);

    if (this.powerBar && this.player) {
      this.powerBar.setPosition(this.player.x, this.player.y - 90);
    }
  }

  public switchState(newState: Level3State) {
    this.actualState?.exit();
    this.actualState = newState;
    this.actualState.enter();
  }

  private getStateFromKey(stateKey: string): Level3State | undefined {
    switch (stateKey) {
      case "PlayRivalHoopsState":
        return new PlayRivalHoopsState(this);
      case "Level3CustomDifficultyState":
        return new Level3CustomDifficultyState(this);
      case "Level3MultiplayerState":
        return new Level3MultiplayerState(this);
      case "Level3QuizState":
        return new Level3QuizState(this);
      default:
        return undefined;
    }
  }

  public resetBallToCenter() {
  const { width } = this.scale;
  const body = this.ball.body as Phaser.Physics.Arcade.Body;

  // ownership sauber lösen
  this.ball.detach();
  this.player.releaseBall();
  if (this.npc) this.npc.hasBall = false;
  if (this.npc1) this.npc1.hasBall = false;
  if (this.npc2) this.npc2.hasBall = false;
  if (this.npc3) this.npc3.hasBall = false;

  body.setVelocity(0, 0);
  body.setAllowGravity(true);

  this.ball.setLastThrownBy(null);

  this.ball.setPosition(width / 2, this.basket.y + 140);
  this.powerBar?.hide();
}

  public setMovementLocked(locked: boolean): void {
    this.isMovementLocked = locked;
    this.player?.setControlsEnabled(!locked);

    if (locked) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
  }

  public startCountdown(seconds: number = 3): void {
    if (this.isCountdownActive) return;

    if (this.countdownContainer && !this.countdownContainer.active) {
      this.countdownContainer.destroy(true);
      this.countdownContainer = undefined;
      this.countdownText = undefined;
    }

    this.isCountdownActive = true;
    this.setMovementLocked(true);
    this.powerBar?.hide();

    const { width, height } = this.scale;

    if (!this.countdownContainer) {
      const uiWidth = 260;
      const uiHeight = 140;

      const bg = this.add.graphics();
      bg.fillStyle(0xffd36b, 0.96);
      bg.lineStyle(4, 0xff6b6b, 1);
      bg.fillRoundedRect(-uiWidth / 2, -uiHeight / 2, uiWidth, uiHeight, 18);
      bg.strokeRoundedRect(-uiWidth / 2, -uiHeight / 2, uiWidth, uiHeight, 18);

      const inner = this.add.graphics();
      inner.fillStyle(0xfff0b6, 0.9);
      inner.fillRoundedRect(-uiWidth / 2 + 8, -uiHeight / 2 + 8, uiWidth - 16, uiHeight - 16, 14);

      const label = this.add.text(0, -uiHeight / 2 + 18, "START", {
        fontSize: "18px",
        color: "#7a2f00",
        fontStyle: "bold",
        fontFamily: "Trebuchet MS, Arial",
      }).setOrigin(0.5, 0);

      this.countdownText = this.add.text(0, 0, "3", {
        fontSize: "72px",
        color: "#3b1f00",
        fontStyle: "bold",
        fontFamily: "Trebuchet MS, Arial",
      }).setOrigin(0.5, 0.5);

      this.countdownContainer = this.add.container(width / 2, height / 2, [
        bg,
        inner,
        label,
        this.countdownText
      ]);
      this.countdownContainer.setScrollFactor(0);
      this.countdownContainer.setDepth(1200);
    }

    this.countdownContainer.setVisible(true);

    let remaining = seconds;
    this.countdownText?.setText(String(remaining));
    this.countdownContainer.setScale(1);

    this.tweens.add({
      targets: this.countdownContainer,
      scale: 1.08,
      duration: 140,
      yoyo: true,
      ease: "Back.easeOut",
    });

    const timer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        remaining -= 1;
        if (remaining <= 0) {
          timer.remove(false);
          this.countdownText?.setText("LOS!");
          this.countdownContainer?.setScale(1);
          this.tweens.add({
            targets: this.countdownContainer,
            scale: 1.12,
            duration: 140,
            yoyo: true,
            ease: "Back.easeOut",
          });

          this.time.delayedCall(450, () => {
            this.countdownContainer?.setVisible(false);
            this.isCountdownActive = false;
            this.setMovementLocked(false);
          });
          return;
        }

        this.countdownText?.setText(String(remaining));
        this.countdownContainer?.setScale(1);
        this.tweens.add({
          targets: this.countdownContainer,
          scale: 1.08,
          duration: 140,
          yoyo: true,
          ease: "Back.easeOut",
        });
      }
    });
  }

  public showResultBanner(type: "win" | "lose"): void {
    const { width, height } = this.scale;
    const uiWidth = 360;
    const uiHeight = 120;

    const wasLocked = this.isMovementLocked;
    const wasBallEnabled = this.ball?.isEnabled ?? true;
    this.setMovementLocked(true);
    if (this.ball) {
      this.ball.isEnabled = false;
    }
    this.resetBallToCenter();

    if (!this.resultContainer) {
      const bg = this.add.graphics();
      bg.fillStyle(0xffd36b, 0.96);
      bg.lineStyle(4, 0xff6b6b, 1);
      bg.fillRoundedRect(-uiWidth / 2, -uiHeight / 2, uiWidth, uiHeight, 18);
      bg.strokeRoundedRect(-uiWidth / 2, -uiHeight / 2, uiWidth, uiHeight, 18);

      const inner = this.add.graphics();
      inner.fillStyle(0xfff0b6, 0.9);
      inner.fillRoundedRect(-uiWidth / 2 + 8, -uiHeight / 2 + 8, uiWidth - 16, uiHeight - 16, 14);

      this.resultText = this.add.text(0, 0, "", {
        fontSize: "34px",
        color: "#3b1f00",
        fontStyle: "bold",
        fontFamily: "Trebuchet MS, Arial",
      }).setOrigin(0.5, 0.5);

      this.resultContainer = this.add.container(width / 2, height / 2 - 80, [
        bg,
        inner,
        this.resultText
      ]);
      this.resultContainer.setScrollFactor(0);
      this.resultContainer.setDepth(1200);
    }

    const text = type === "win" ? "GEWONNEN!" : "VERLOREN";
    this.resultText?.setText(text);
    this.resultContainer.setVisible(true);
    this.resultContainer.setScale(1);

    this.tweens.add({
      targets: this.resultContainer,
      scale: 1.08,
      duration: 160,
      yoyo: true,
      ease: "Back.easeOut",
    });

    this.time.delayedCall(4000, () => {
      this.resultContainer?.setVisible(false);
      if (!wasLocked) {
        this.setMovementLocked(false);
      }
      if (this.ball) {
        this.ball.isEnabled = wasBallEnabled;
      }
    });
  }


  public endLevelAndStartQuiz(winner: string): void {
    // neue ID pro Runde
    this.playerId = Phaser.Utils.String.UUID();

    this.registry.set("level3_winner", winner);
    this.registry.set("playerId", this.playerId);

    // Wenn nicht Multiplayer, gehe zu Multiplayer
    if (!this.isMultiplayer) {
      this.registry.set("level3_multiplayer", true);
      this.playerScore = 0;
      this.npcScore = 0;
      this.scene.restart();
    } else {
      // Wenn Multiplayer fertig, gehe zu Quiz
      localStorage.setItem("level", "3");
      this.switchState(new Level3QuizState(this));
    }
  }

  private createJumpObstacles(groundTopY: number): void {
    const { width } = this.scale;
    const centerX = width / 2;

    this.multiplayerPlatforms.forEach((platform) => platform.destroy());
    this.multiplayerPlatforms = [];

    this.multiplayerHindernisse.forEach((hindernis) => hindernis.destroy());
    this.multiplayerHindernisse = [];

    const platformPositions = [
      { x: centerX - 720, y: groundTopY - 140 },
      { x: centerX - 380, y: groundTopY - 260 },
      { x: centerX + 380, y: groundTopY - 260 },
      { x: centerX + 720, y: groundTopY - 140 },
    ];

    platformPositions.forEach((pos) => {
      const platform = new Obstacle(this, pos.x, pos.y, {
        blocksX: 3,
        blocksY: 1,
        colorOrTexture: "green",
      });

      this.multiplayerPlatforms.push(platform);

      this.physics.add.collider(this.player, platform);
      this.physics.add.collider(this.npc1 || this.npc, platform);
      if (this.npc2) this.physics.add.collider(this.npc2, platform);
      if (this.npc3) this.physics.add.collider(this.npc3, platform);
      this.physics.add.collider(this.ball, platform);
    });

    const hindernisY = groundTopY - 260;
    const leftHindernis = new Hindernis(
      this,
      this.player,
      this.ball,
      centerX - 940,
      hindernisY,
      140,
      "hindernisMitRandom",
      3
    );
    leftHindernis.setAngle(180);

    const rightHindernis = new Hindernis(
      this,
      this.player,
      this.ball,
      centerX + 940,
      hindernisY,
      140,
      "hindernisMitRandom",
      3
    );

    this.multiplayerHindernisse.push(leftHindernis, rightHindernis);

    this.multiplayerHindernisse.forEach((hindernis) => {
      this.physics.add.collider(this.player, hindernis);
      if (this.npc1) this.physics.add.collider(this.npc1, hindernis);
      if (this.npc2) this.physics.add.collider(this.npc2, hindernis);
      if (this.npc3) this.physics.add.collider(this.npc3, hindernis);
      this.physics.add.collider(this.ball, hindernis);
    });
  }
}
