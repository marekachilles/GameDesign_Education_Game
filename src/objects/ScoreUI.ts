import Phaser from "phaser";

export default class ScoreUI {
  private container: Phaser.GameObjects.Container;
  private scoreText: Phaser.GameObjects.Text;
  private titleText: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Graphics;
  private sparkle: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    const { width } = scene.scale;

    const uiWidth = Math.min(720, width - 32);
    const uiHeight = 78;
    const x = width / 2;
    const y = 12;

    this.container = scene.add.container(x, y);

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xffd36b, 0.95);
    this.bg.lineStyle(4, 0xff6b6b, 1);
    this.bg.fillRoundedRect(-uiWidth / 2, 0, uiWidth, uiHeight, 18);
    this.bg.strokeRoundedRect(-uiWidth / 2, 0, uiWidth, uiHeight, 18);

    const inner = scene.add.graphics();
    inner.fillStyle(0xfff0b6, 0.9);
    inner.fillRoundedRect(-uiWidth / 2 + 8, 8, uiWidth - 16, uiHeight - 16, 14);

    this.sparkle = scene.add.graphics();
    this.sparkle.fillStyle(0xffffff, 0.8);
    this.sparkle.fillCircle(-uiWidth / 2 + 18, 18, 4);
    this.sparkle.fillCircle(uiWidth / 2 - 22, 18, 3);
    this.sparkle.fillCircle(uiWidth / 2 - 36, 30, 2);

    this.titleText = scene.add.text(0, 8, "🏆 TURNIER", {
      fontSize: "18px",
      color: "#7a2f00",
      fontStyle: "bold",
      fontFamily: "Trebuchet MS, Arial",
    }).setOrigin(0.5, 0);

    this.scoreText = scene.add.text(0, 36, "", {
      fontSize: "26px",
      color: "#3b1f00",
      fontStyle: "bold",
      fontFamily: "Trebuchet MS, Arial",
    }).setOrigin(0.5, 0);

    this.container.add([this.bg, inner, this.sparkle, this.titleText, this.scoreText]);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
  }

  setScore(player: number, npc: number, target: number) {
    this.scoreText.setText(`🧍 ${player}/${target}   ⚔️   🤖 ${npc}/${target}`);
    this.pop();
  }

  setMultiplayerScore(player: number, npc1: number, npc2: number, npc3: number, target: number) {
    this.scoreText.setText(
      `🧍 ${player}/${target}   🤖1 ${npc1}/${target}   🤖2 ${npc2}/${target}   🤖3 ${npc3}/${target}`
    );
    this.pop();
  }

  private pop() {
    this.container.setScale(1);
    this.container.scene.tweens.add({
      targets: this.container,
      scale: 1.04,
      duration: 120,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  setVisible(visible: boolean) {
    this.container.setVisible(visible);
  }

  show() {
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }

  destroy() {
    this.container.destroy(true);
  }
}

