import Phaser from "phaser";

export default class PowerBar extends Phaser.GameObjects.Container {

    private bg: Phaser.GameObjects.Rectangle;
    private fill: Phaser.GameObjects.Rectangle;
    private frame: Phaser.GameObjects.Graphics;
    private label: Phaser.GameObjects.Text;

    private readonly barWidth = 90;
    private readonly barHeight = 10;

    private sceneRef: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.sceneRef = scene;
        scene.add.existing(this);

        // Hintergrund (warmes Braun)
        this.bg = scene.add.rectangle(0, 0, this.barWidth, this.barHeight, 0x4b2b1a)
            .setOrigin(0.5)
            .setAlpha(0.9);

        // Füllung beginnt links
        this.fill = scene.add.rectangle(
            -this.barWidth / 2,
            0,
            0,
            this.barHeight,
            0x00ff00
        ).setOrigin(0, 0.5);

        // Rahmen im Cartoon-Stil
        this.frame = scene.add.graphics();
        this.frame.lineStyle(2, 0xfff1a8, 1);
        this.frame.strokeRoundedRect(
            -this.barWidth / 2 - 4,
            -this.barHeight / 2 - 4,
            this.barWidth + 8,
            this.barHeight + 8,
            6
        );

        this.label = scene.add.text(0, -16, "POWER", {
            fontSize: "10px",
            color: "#fff1a8",
            fontStyle: "bold",
            fontFamily: "Trebuchet MS, Arial"
        }).setOrigin(0.5, 0.5);

        this.add(this.bg);
        this.add(this.fill);
        this.add(this.frame);
        this.add(this.label);

        this.setVisible(false);
    }

    /**
     * Setzt Power (0-max), mit:
     * - Smooth Tween
     * - Farbverlauf Grün → Gelb → Rot
     * - Bounce bei Max
     */
    setPower(power: number, maxPower: number) {
        const pct = Phaser.Math.Clamp(power / maxPower, 0, 1);

        // Farbverlauf
        const color = this.getColorForPercent(pct);
        this.fill.setFillStyle(color);

        // Smooth-Animation des Füllbalkens
        this.sceneRef.tweens.add({
            targets: this.fill,
            width: this.barWidth * pct,
            duration: 90,
            ease: "Quad.easeOut"
        });

        // Bounce-Effekt wenn max erreicht
        if (pct >= 1) {
            this.maxBounce();
        }
    }

    /** Zeige die Bar */
    show() {
        this.setScale(1);
        this.setVisible(true);
        this.setDepth(1000);
    }

    /** Verstecke die Bar */
    hide() {
        this.setScale(1);
        this.setVisible(false);
    }

    private getColorForPercent(pct: number): number {
    // Richtige Phaser Color-Objekte erzeugen
    const green = new Phaser.Display.Color(0, 255, 0);
    const yellow = new Phaser.Display.Color(255, 255, 0);
    const red = new Phaser.Display.Color(255, 0, 0);

    // 0% → 50% (Grün → Gelb)
    if (pct < 0.5) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(
            green,
            yellow,
            100,
            pct * 200
        );
        return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
    }

    // 50% → 100% (Gelb → Rot)
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        yellow,
        red,
        100,
        (pct - 0.5) * 200
    );

    return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
}



    /** Kleiner Bounce-Effekt bei maximaler Power */
    private maxBounce() {
        this.sceneRef.tweens.add({
            targets: this,
            scale: 1.2,
            duration: 60,
            yoyo: true,
            ease: "Back.easeOut"
        });
    }
}
