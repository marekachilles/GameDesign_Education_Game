// src/input/PlayerControls.ts
import Phaser from "phaser";

export type ControlName = "left" | "right" | "up" | "down" | "sprint";

export default class PlayerControls {
  private scene: Phaser.Scene;

  /**
   * Pro Control mehrere Keys erlaubt (z.B. A + LEFT)
   */
  private keys: Record<ControlName, Phaser.Input.Keyboard.Key[]> = {
    left: [],
    right: [],
    up: [],
    down: [],
    sprint: []
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.resetToDefault();
  }

  /** Überschreibt das Mapping für ein Control mit genau EINEM Key */
  public setKey(control: ControlName, keyCode: number) {
    const kb = this.scene.input.keyboard;
    if (!kb) return;
    this.keys[control] = [kb.addKey(keyCode)];
  }

  /** Default: WASD + Pfeile + Shift */
  public resetToDefault() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.keys.left = [kb.addKey(Phaser.Input.Keyboard.KeyCodes.A), kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)];
    this.keys.right = [kb.addKey(Phaser.Input.Keyboard.KeyCodes.D), kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)];
    this.keys.up = [kb.addKey(Phaser.Input.Keyboard.KeyCodes.W), kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP)];
    this.keys.down = [kb.addKey(Phaser.Input.Keyboard.KeyCodes.S), kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)];
    this.keys.sprint = [kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)];
  }

  private anyDown(arr: Phaser.Input.Keyboard.Key[]) {
    return arr.some((k) => k.isDown);
  }

  public get xAxis(): number {
    const left = this.anyDown(this.keys.left);
    const right = this.anyDown(this.keys.right);
    if (left && !right) return -1;
    if (right && !left) return 1;
    return 0;
  }

  public get isJumping(): boolean {
    return this.anyDown(this.keys.up);
  }

  public get isFastFalling(): boolean {
    return this.anyDown(this.keys.down);
  }

  public get isSprinting(): boolean {
    return this.anyDown(this.keys.sprint);
  }
}
