// src/objects/Player.ts
import Phaser from "phaser";
import PlayerControls from "../input/PlayerControls";
import type { ControlName } from "../input/PlayerControls";
import Ball from "./Ball";


export default class Player extends Phaser.GameObjects.Sprite {
  private controls: PlayerControls;

  private startX: number;
  private startY: number;

  private controlsEnabled: boolean = true;

  private spriteKeyBase: string;
  private unlockedAnimations: string[] = [];

  // BALL-FELDER
  public hasBall: boolean = false;
  // private heldBall: Ball | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, worldBounds: boolean = false) {
    const selectedPlayer = scene.registry.get("selectedPlayer") ?? "player_red";
    super(scene, x, y, selectedPlayer + "_stand");

    this.spriteKeyBase = selectedPlayer;

    this.startX = x;
    this.startY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(worldBounds);

    this.controls = new PlayerControls(scene);

    // Load unlocked animations from registry
    const storedAnimations = scene.registry.get('unlockedAnimations');
    if (storedAnimations) {
      this.unlockedAnimations = storedAnimations;
    }

    this.createAnimations();
    this.anims.play("stand");
  }

  update() {
    this.updateMovement();
    this.updateAnimations();
    this.checkOutOfBounds();
  }

  private updateMovement() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = this.controls.isSprinting ? 300 : 160;

    if (!this.controlsEnabled) {
      body.setVelocityX(0);
      return;
    }

    if (this.controls.xAxis < 0) body.setVelocityX(-speed);
    else if (this.controls.xAxis > 0) body.setVelocityX(speed);
    else body.setVelocityX(0);

    if (this.controls.isJumping && body.touching.down) {
      body.setVelocityY(-600);
    }

    if (this.controls.isFastFalling && !body.touching.down) {
      body.setVelocityY(900);
    }
  }

  private updateAnimations() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const absVelocity = Math.abs(body.velocity.x);

    // flip by velocity
    this.setFlipX(body.velocity.x < 0);

    // if jump animation is playing, do not override
    if (this.anims.isPlaying && this.anims.currentAnim?.key === "jump") return;

    // jump
    if (this.controls.isJumping && body.touching.down && this.isAnimationUnlocked("jump")) {
      this.anims.play("jump", true);
      return;
    }

    // fast fall
    if (!body.touching.down && this.controls.isFastFalling && this.isAnimationUnlocked("fast_fall")) {
      this.anims.play("fast_fall", true);
      return;
    }

    // slow fall
    if (!body.touching.down && absVelocity > 0 && this.isAnimationUnlocked("fall")) {
      this.anims.play("fall", true);
      return;
    }

    // run
    if (body.touching.down && absVelocity >= 300 && this.isAnimationUnlocked("sprint")) {
      this.anims.play("sprint", true);
      return;
    }

    // walk
    if (body.touching.down && absVelocity >= 160 && this.isAnimationUnlocked("walk")) {
      this.anims.play("walk", true);
      return;
    }

    // idle
    this.anims.play("stand", true);
  }

  // -----------------------------------------------------
  // BALL
  // -----------------------------------------------------
  pickUpBall(ball: Ball) {
    this.hasBall = true;
    // this.heldBall = ball;

    const body = ball.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);

    // Ball selbst "heften" (Ball-Logik)
    ball.attach(this);
  }

  releaseBall() {
    this.hasBall = false;
    // this.heldBall = null;
  }

  get isLookingLeft(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return body.velocity.x < 0;
  }

  // -----------------------------------------------------
  // CONTROLS API (wird von Level1 genutzt)
  // -----------------------------------------------------
  public setControlKey(control: ControlName, keyCode: number) {
    this.controls.setKey(control, keyCode);
  }

  public resetControlKeysToDefault() {
    this.controls.resetToDefault();
  }

  public stopMovement() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  public setControlsEnabled(enabled: boolean) {
    this.controlsEnabled = enabled;
    if (!enabled) this.stopMovement();
  }
  //Sprite und Animationen
  public setSprite(spriteKey: string) {
    this.scene.registry.set("selectedPlayer", spriteKey);
    this.spriteKeyBase = spriteKey;
    this.setTexture(spriteKey + "_stand");
    this.createAnimations();
  }

  public unlockAnimation(key: string) {
    if (!this.unlockedAnimations.includes(key)) {
      this.unlockedAnimations.push(key);
      this.scene.registry.set('unlockedAnimations', this.unlockedAnimations);
    }
  }

  private isAnimationUnlocked(key: string): boolean {
    return this.unlockedAnimations.includes(key) || this.unlockedAnimations.includes("all");
  }

  private createAnimations() {
    // Defensive: remove if exists
    ["stand", "walk", "sprint", "jump", "fast_fall", "fall"].forEach((k) => {
      if (this.anims.exists(k)) this.anims.remove(k);
    });

    this.anims.create({
      key: "stand",
      frames: [{ key: this.spriteKeyBase + "_stand", frame: 0 }],
      frameRate: 1,
      repeat: 0
    });

    this.anims.create({
      key: "walk",
      frames: [
        { key: this.spriteKeyBase + "_walk1", frame: 0 },
        { key: this.spriteKeyBase + "_walk2", frame: 0 },
        { key: this.spriteKeyBase + "_walk3", frame: 0 },
        { key: this.spriteKeyBase + "_walk4", frame: 0 },
        { key: this.spriteKeyBase + "_walk5", frame: 0 }
      ],
      frameRate: 15,
      yoyo: true
    });

    this.anims.create({
      key: "sprint",
      frames: [
        { key: this.spriteKeyBase + "_walk1", frame: 0 },
        { key: this.spriteKeyBase + "_walk2", frame: 0 },
        { key: this.spriteKeyBase + "_walk3", frame: 0 },
        { key: this.spriteKeyBase + "_walk4", frame: 0 },
        { key: this.spriteKeyBase + "_walk5", frame: 0 }
      ],
      frameRate: 20,
      yoyo: true
    });

    this.anims.create({
      key: "jump",
      frames: [
        { key: this.spriteKeyBase + "_up1", frame: 0 },
        { key: this.spriteKeyBase + "_up2", frame: 0 },
        { key: this.spriteKeyBase + "_up3", frame: 0 }
      ],
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: "fast_fall",
      frames: [{ key: this.spriteKeyBase + "_fall", frame: 0 }],
      frameRate: 1
    });

    this.anims.create({
      key: "fall",
      frames: [
        { key: this.spriteKeyBase + "_swim1", frame: 0 },
        { key: this.spriteKeyBase + "_swim2", frame: 0 }
      ],
      frameRate: 5
    });
  }

  private checkOutOfBounds() {
    if (this.y > this.scene.scale.height + 200) {
      this.resetPosition();
    }
  }

  public resetPosition() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.setPosition(this.startX, this.startY);
  }
}
