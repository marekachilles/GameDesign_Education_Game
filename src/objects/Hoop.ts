import Phaser from "phaser";

export default class Hoop extends Phaser.GameObjects.Container {
  public rimZone!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    scene.add.existing(this);

    // Visuell: einfacher Ring (ohne Asset)
    const rim = scene.add.rectangle(0, 0, 140, 20, 0xff6f00);
    rim.setOrigin(0.5);

    const board = scene.add.rectangle(-70, -40, 20, 120, 0xffffff, 0.6);
    board.setOrigin(0.5);

    this.add([board, rim]);

    // Trefferzone (Sensor)
    this.rimZone = scene.add.rectangle(x, y + 35, 140, 110, 0x000000, 0);
    scene.physics.add.existing(this.rimZone, true); // STATIC BODY

    // Container selbst braucht keine physics-body
  }
}
