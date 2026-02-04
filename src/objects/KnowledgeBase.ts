import Phaser from 'phaser';

export default class KnowledgeBase extends Phaser.GameObjects.Container {
    private panel: HTMLDivElement | null = null;
    private isOpen: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // Book Icon (Simple shapes)
        const bookHeight = 40;

        // Left page
        const leftPage = scene.add.rectangle(-10, 0, 15, bookHeight, 0xffffff).setStrokeStyle(2, 0xaaaaaa);

        // Right page
        const rightPage = scene.add.rectangle(10, 0, 15, bookHeight, 0xffffff).setStrokeStyle(2, 0xaaaaaa);

        // Spine
        const spine = scene.add.rectangle(0, 0, 4, bookHeight, 0x555555);

        // Label
        const label = scene.add
            .text(-25, 0, 'Wissensspeicher', {
                fontSize: '14px',
                color: '#ffffff',
                fontFamily: 'monospace'
            })
            .setOrigin(1, 0.5);

        this.add([leftPage, rightPage, spine, label]);
        scene.add.existing(this);

        // Make interactive
        const hitArea = new Phaser.Geom.Rectangle(-150, -20, 150, 40);
        this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.on('pointerdown', () => this.togglePanel());
        this.on('pointerover', () => {
            leftPage.setFillStyle(0xffffcc);
            rightPage.setFillStyle(0xffffcc);
        });
        this.on('pointerout', () => {
            leftPage.setFillStyle(0xffffff);
            rightPage.setFillStyle(0xffffff);
        });
    }

    private togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    private openPanel() {
        if (this.panel) return;

        this.isOpen = true;

        // Create container for iframe
        this.panel = document.createElement('div');
        this.panel.style.cssText = `
            position: fixed;
            right: 0;
            top: 0;
            width: 400px;
            height: 100%;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
        `;

        // Add CSS animation
        if (!document.getElementById('knowledge-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'knowledge-panel-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }

        // Create iframe to load the HTML file
        const iframe = document.createElement('iframe');
        iframe.src = '/wissensspeicher.html';
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;

        this.panel.appendChild(iframe);
        document.body.appendChild(this.panel);

        // Listen for close message from iframe
        window.addEventListener('message', (event) => {
            if (event.data === 'closePanel') {
                this.closePanel();
            }
        });
    }

    private closePanel() {
        if (!this.panel) return;

        this.isOpen = false;

        // Animate out
        this.panel.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (this.panel) {
                this.panel.remove();
                this.panel = null;
            }
        }, 300);
    }

    destroy(fromScene?: boolean) {
        this.closePanel();
        super.destroy(fromScene);
    }
}
