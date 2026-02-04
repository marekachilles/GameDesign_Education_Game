export default class Confetti extends Phaser.GameObjects.Particles.ParticleEmitter {
    constructor(scene: Phaser.Scene) {
        const texture = scene.textures.createCanvas('particleTexture', 10, 10)!;
        const context = texture.getContext();
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 10, 10);
        texture.refresh();

        super(scene, 0, 0, 'particleTexture', {
            emitZone: { type: 'random', quantity: 1, source: new Phaser.Geom.Rectangle(0, 0, 1920, 1) },
            speedY: { min: 200, max: 300 },
            speedX: { min: -100, max: 100 },
            accelerationY: { min: 50, max: 100 },
            lifespan: { min: 2000, max: 3000 },
            scaleX: {
                onUpdate: (_particle, _key, t) => {
                    return Math.sin(t * Math.PI * 10);
                }
            },
            blendMode: 'ADD',
            rotate: { min: -180, max: 180 },
            frequency: 50,
            quantity: 2,
            tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
        });

        scene.add.existing(this);
    }
}
