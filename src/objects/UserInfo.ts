import Phaser from 'phaser';

export default class UserInfo extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // Avatar (Simple circle for now)
        const avatarRadius = 25;
        const avatar = scene.add.circle(0, 0, avatarRadius, 0x555555).setStrokeStyle(2, 0xffffff);

        // Avatar Icon (Placeholder "head")
        const head = scene.add.circle(0, -5, 8, 0xffffff);
        const body = scene.add.arc(0, 15, 12, 180, 360, false, 0xffffff);

        // Username
        const usernameText = scene.add
            .text(-avatarRadius - 10, -10, 'username', {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'monospace'
            })
            .setOrigin(1, 0.5);

        // Level
        const levelText = scene.add
            .text(-avatarRadius - 10, 10, 'LVL 1', {
                fontSize: '12px',
                color: '#aaaaaa',
                fontFamily: 'monospace'
            })
            .setOrigin(1, 0.5);

        this.add([avatar, head, body, usernameText, levelText]);
        scene.add.existing(this);
    }
}
