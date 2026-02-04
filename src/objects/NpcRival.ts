import Phaser from "phaser";
import Ball from "./Ball";
import Basket from "./Basket";
import Player from "./Player";
import { NPC_SKINS, NpcSkinKey, EnemySetKey } from "./NPCSkins";

export type NpcDifficulty = {
  speed: number;
  decisionMs: number;
  decisionJitterMs: number;

  pickupRadius: number;

  // jump
  jumpPower: number;
  jumpChance: number;
  jumpMinDxToHoop: number;

  // throw
  throwPower: number;
  throwPowerJitter: number;
  aimErrorPx: number;
  aimErrorJitter: number;
  throwCooldownMs: number;
  throwRangePx: number;

  // steal
  stealRadius: number;
  stealCooldownMs: number;
  stealChance: number;

  // hesitate
  hesitateChance: number;
  hesitateMs: number;
};

export default class NpcRival extends Phaser.GameObjects.Sprite {
  public hasBall = false;
  public readonly isNpcRival = true;

  private cfg: NpcDifficulty;

  private nextDecisionAt = 0;
  private nextThrowAt = 0;
  private nextStealAt = 0;
  private hesitateUntil = 0;

  private skinKey: NpcSkinKey;
  private moveTargetX: number | null = null;
  private lastAnimKey: string | null = null;
  private lastAnimSwitchAt = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cfg: NpcDifficulty,
    skinKey: NpcSkinKey = "npc_1"
  ) {
    const def = NPC_SKINS[skinKey];
    super(scene, x, y, `${def.idleSet}_1`);

    this.cfg = cfg;
    this.skinKey = skinKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(200, 600);

    body.useDamping = true;
    body.setDragX(1200);

    this.ensureAnimationsForSkin(this.skinKey);
    this.syncBodyToSkin(this.skinKey);
    this.anims.timeScale = 0.8;
    this.playIdle();
  }

  public setSkin(skinKey: NpcSkinKey) {
    this.skinKey = skinKey;

    this.ensureAnimationsForSkin(this.skinKey);

    const def = NPC_SKINS[this.skinKey];
    this.setTexture(`${def.idleSet}_1`);

    this.syncBodyToSkin(this.skinKey);
    this.playIdle();
  }

  public setDifficulty(cfg: NpcDifficulty) {
    this.cfg = cfg;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocity(Math.max(200, this.cfg.speed * 1.25), 1200);
  }

  public getDifficulty(): NpcDifficulty {
    return this.cfg;
  }

  public updateAI(
    timeMs: number,
    player: Player,
    ball: Ball,
    basket: Basket,
    onThrow?: () => void
  ) {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (timeMs < this.hesitateUntil) {
      body.setAccelerationX(0);
      this.playIdle();
      return;
    }

    if (timeMs < this.nextDecisionAt) {
      this.updateAnimFromMovement();
      return;
    }

    this.nextDecisionAt =
      timeMs +
      this.cfg.decisionMs +
      Phaser.Math.Between(-this.cfg.decisionJitterMs, this.cfg.decisionJitterMs);

    if (Math.random() < this.cfg.hesitateChance) {
      this.hesitateUntil = timeMs + this.cfg.hesitateMs + Phaser.Math.Between(0, 200);
      body.setAccelerationX(0);
      this.playIdle();
      return;
    }

    // Steal from player (wenn Player Ball wirklich hält)
    if (
      timeMs >= this.nextStealAt &&
      player.hasBall &&
      (ball as any).isHeldBy?.(player as any) &&
      (ball as any).canSteal?.(timeMs)
    ) {
      const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

      if (distToPlayer <= this.cfg.stealRadius && Math.random() < this.cfg.stealChance) {
        this.nextStealAt = timeMs + this.cfg.stealCooldownMs;

        player.releaseBall();
        this.hasBall = true;
        ball.attach(this);
        (ball as any).lockStealFor?.(this.cfg.stealCooldownMs, timeMs);

        body.setAccelerationX(0);

        if (body.blocked.down && Math.random() < 0.35) {
          body.setVelocityY(-this.cfg.jumpPower * 0.8);
        }

        this.playIdle();
        return;
      }
    }

    // Get ball if not holding
    if (!this.hasBall) {
      // ball free -> chase it
      if (!ball.isHeld) {
        this.moveTargetX = ball.x;
        this.moveTowardX(this.moveTargetX);

        const dist = Phaser.Math.Distance.Between(this.x, this.y, ball.x, ball.y);
        if (dist <= this.cfg.pickupRadius) {
          this.hasBall = true;
          ball.attach(this);
          body.setAccelerationX(0);
          this.playIdle();
        } else {
          this.tryJumpIfTargetAbove(ball.y, 1.1);
          this.updateAnimFromMovement();
        }
        return;
      }

      // ball held -> chase player
      this.moveTargetX = player.x;
      this.moveTowardX(this.moveTargetX);

      this.tryJumpIfTargetAbove(player.y, 0.9);

      this.updateAnimFromMovement();
      return;
    }

    // Holding ball -> move into throw range
    const targetX = basket.x;
    const dxToHoop = targetX - this.x;
    const absDx = Math.abs(dxToHoop);

    if (absDx > this.cfg.throwRangePx) {
      this.moveTargetX = targetX;
      this.moveTowardX(this.moveTargetX);

      if (absDx > this.cfg.jumpMinDxToHoop) {
        this.tryJumpIfTargetAbove(basket.y, 1.0);
      }

      this.updateAnimFromMovement();
      return;
    }

    // in range -> stop
    body.setAccelerationX(0);
    this.playIdle();

    // Höhere Sprungchance wenn in Wurfposition
    if (body.blocked.down && Math.random() < this.cfg.jumpChance) {
      body.setVelocityY(-this.cfg.jumpPower);
    }

    // throw cooldown
    if (timeMs < this.nextThrowAt) return;
    this.nextThrowAt = timeMs + this.cfg.throwCooldownMs + Phaser.Math.Between(0, 150);

    // Antizipation: Ziele nicht direkt auf den Korb, sondern antizipiere die Spieler-Position
    const anticipatedBasketX = this.anticipateTargetPosition(basket.x, player);
    
    const aimErr =
      this.cfg.aimErrorPx + Phaser.Math.Between(-this.cfg.aimErrorJitter, this.cfg.aimErrorJitter);

    const power = Phaser.Math.Clamp(
      this.cfg.throwPower + Phaser.Math.Between(-this.cfg.throwPowerJitter, this.cfg.throwPowerJitter),
      380,
      950
    );

    const direction = (anticipatedBasketX + Phaser.Math.Between(-aimErr, aimErr)) - this.x < 0 ? -1 : 1;

    // ✅ WICHTIG: Attribution zuerst setzen, dann werfen
    onThrow?.();

    ball.throw(power, direction);

    this.hasBall = false;
  }

  private anticipateTargetPosition(basketX: number, player: Player): number {
    // Einfache Antizipations-Logik: Berechne wo der Ball sein wird basierend auf Spieler-Bewegung
    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const playerVelocity = playerBody.velocity.x;
    
    // Antizipiere 300-500ms in die Zukunft
    const anticipationTime = 0.4; // 400ms in Sekunden
    const predictedPlayerX = player.x + playerVelocity * anticipationTime;
    
    // Ziele etwas zwischen Korb und antizipierter Spieler-Position
    // Das macht es schwerer für den Spieler zu blocken
    const mix = 0.3; // 30% Richtung Spieler, 70% Richtung Korb
    return basketX + (predictedPlayerX - basketX) * mix;
  }

  private moveTowardX(targetX: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dx = targetX - this.x;

    const deadZone = 10;
    if (Math.abs(dx) <= deadZone) {
      body.setAccelerationX(0);
      body.setVelocityX(body.velocity.x * 0.85);
      return;
    }

    const dir = Math.sign(dx);
    const accel = Math.max(400, this.cfg.speed * 8);

    body.setAccelerationX(dir * accel);
    this.setFlipX(dir < 0);
  }

  private tryJumpIfTargetAbove(targetY: number, chanceMultiplier = 1) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const verticalGap = this.y - targetY;

    if (body.blocked.down && verticalGap > 40) {
      if (Math.random() < this.cfg.jumpChance * chanceMultiplier) {
        body.setVelocityY(-this.cfg.jumpPower);
      }
    }
  }

  private animKeyIdle(skin: NpcSkinKey) { return `npc:${skin}:idle`; }
  private animKeyMove(skin: NpcSkinKey) { return `npc:${skin}:move`; }
  private animKeyAir(skin: NpcSkinKey)  { return `npc:${skin}:air`; }

  private ensureAnimationsForSkin(skin: NpcSkinKey) {
    const anims = this.scene.anims;
    const def = NPC_SKINS[skin];

    const makeFrames = (set: EnemySetKey) => {
      const frames: Phaser.Types.Animations.AnimationFrame[] = [];
      for (let i = 1; i <= def.frameCount; i++) {
        frames.push({ key: `${set}_${i}` });
      }
      return frames;
    };

    const idleKey = this.animKeyIdle(skin);
    if (!anims.exists(idleKey)) {
      anims.create({
        key: idleKey,
        frames: makeFrames(def.idleSet),
        frameRate: 4,
        repeat: -1,
      });
    }

    const moveKey = this.animKeyMove(skin);
    if (!anims.exists(moveKey)) {
      anims.create({
        key: moveKey,
        frames: makeFrames(def.moveSet),
        frameRate: 6,
        repeat: -1,
      });
    }

    const airKey = this.animKeyAir(skin);
    if (!anims.exists(airKey)) {
      anims.create({
        key: airKey,
        frames: makeFrames(def.airSet),
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  private playIdle() {
    const key = this.animKeyIdle(this.skinKey);
    if (this.anims.currentAnim?.key !== key) this.anims.play(key, true);
  }

  private updateAnimFromMovement() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const now = this.scene.time.now;
    const minSwitchMs = 140;
    if (now - this.lastAnimSwitchAt < minSwitchMs) return;

    if (!body.blocked.down) {
      const airKey = this.animKeyAir(this.skinKey);
      if (this.lastAnimKey !== airKey) {
        this.anims.play(airKey, true);
        this.lastAnimKey = airKey;
        this.lastAnimSwitchAt = now;
      }
      return;
    }

    const vx = Math.abs(body.velocity.x);
    const moveKey = this.animKeyMove(this.skinKey);
    const idleKey = this.animKeyIdle(this.skinKey);

    if (vx > 25) {
      if (this.lastAnimKey !== moveKey) {
        this.anims.play(moveKey, true);
        this.lastAnimKey = moveKey;
        this.lastAnimSwitchAt = now;
      }
    } else if (vx < 10) {
      if (this.lastAnimKey !== idleKey) {
        this.anims.play(idleKey, true);
        this.lastAnimKey = idleKey;
        this.lastAnimSwitchAt = now;
      }
    }
  }

  private syncBodyToSkin(skin: NpcSkinKey) {
    const def = NPC_SKINS[skin];
    const body = this.body as Phaser.Physics.Arcade.Body;

    const w = this.width;
    const h = this.height;

    const bw = Math.max(10, Math.floor(w * def.bodyWidthPct * 1.2));
    const bh = Math.max(10, Math.floor(h * def.bodyHeightPct * 1.2));

    body.setSize(bw, bh, false);
    
    // Body-Origin auf Sprite-Origin ausrichten: (0.5, 1) = unten Mitte
    // Damit wird der Body richtig relativ zur Sprite-Position berechnet
    const offsetX = (w - bw) / 2;
    const offsetY = h - bh;
    body.setOffset(offsetX, offsetY);

    // Debug
    console.log(`[NpcRival] Skin: ${skin}, Sprite: ${w}x${h}, Body: ${bw}x${bh}, Offset: (${offsetX}, ${offsetY})`);
  }
}
