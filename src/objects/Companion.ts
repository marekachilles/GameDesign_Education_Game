import Phaser from 'phaser';
import SoundManager from '../utils/SoundManager';

export default class Companion extends Phaser.GameObjects.Container {
    private speechBubble: Phaser.GameObjects.Container;
    private bubbleText: Phaser.GameObjects.Text;
    private bubbleBackground: Phaser.GameObjects.Graphics;
    private onCompleteCallback?: () => void;
    private indicatorText: Phaser.GameObjects.Text;
    private fontSize: string = '24px';
    private isTyping: boolean = false;
    private fullText: string = '';
    private typingTimer?: Phaser.Time.TimerEvent;
    private currentCharIndex: number = 0;

    constructor(scene: Phaser.Scene, x: number = 100, y: number = 100) {
        super(scene, x, y);

        // Companion Body (Yellow Box)
        const body = scene.add.sprite(0, 0, 'companion_idle').setScale(1.3);

        // Speech Bubble Container
        this.speechBubble = scene.add.container(40, -40);
        //this.speechBubble.setVisible(false);

        // Bubble Background (Graphics for dynamic sizing/shape)
        this.bubbleBackground = scene.add.graphics();
        this.speechBubble.add(this.bubbleBackground);

        // Bubble Text
        this.bubbleText = scene.add
            .text(10, 10, '', {
                fontSize: this.fontSize,
                color: '#000000',
                // backgroundColor: '#ffffff', // Remove background color from text to avoid confusion
                padding: { x: 5, top: 5, bottom: 25 },
                wordWrap: { width: 400 },
                lineSpacing: 10
            })
            .setOrigin(0);

        // Indicator Text (Press Enter / Click)
        this.indicatorText = scene.add
            .text(0, 0, 'Weiter (Enter)', {
                fontSize: '14px',
                color: '#555555',
                padding: { x: 10, y: 10 }
            })
            .setOrigin(1, 1);
        this.indicatorText.setVisible(false);

        // We add text to container, but we'll redraw graphics based on text size
        this.speechBubble.add(this.bubbleText);
        this.speechBubble.add(this.indicatorText);

        this.add([body, this.speechBubble]);
        scene.add.existing(this);

        this.refreshBubble();

        // Input Handling
        if (scene.input.keyboard) {
            scene.input.keyboard.on('keydown-ENTER', () => {
                this.handleInteraction();
            });
        }

        // Make speech bubble interactive for clicking
        // We need a hit area for the container, or we can add an interactive zone
        // For simplicity, let's make the background interactive after drawing
    }

    say(text: string, onComplete?: () => void) {
        this.fullText = text;
        this.onCompleteCallback = onComplete;
        this.speechBubble.setVisible(true);
        this.isTyping = true;
        this.currentCharIndex = 0;
        this.bubbleText.setText('');
        this.indicatorText.setVisible(false);

        // Start typing animation
        this.startTyping();
    }

    private startTyping() {
        // Stop any existing timer
        if (this.typingTimer) {
            this.typingTimer.destroy();
        }

        // Create a timer that adds one character every 30ms
        this.typingTimer = this.scene.time.addEvent({
            delay: 29,
            callback: () => {
                if (this.currentCharIndex < this.fullText.length) {
                    this.currentCharIndex++;
                    this.bubbleText.setText(this.fullText.substring(0, this.currentCharIndex));
                    this.refreshBubble();
                } else {
                    // Typing complete
                    this.isTyping = false;
                    if (this.onCompleteCallback) {
                        this.indicatorText.setVisible(true);
                        this.refreshBubble();
                    }
                    if (this.typingTimer) {
                        this.typingTimer.destroy();
                    }
                }
            },
            loop: true
        });
    }

    private handleInteraction() {
        if (!this.speechBubble.visible) return;

        if (this.isTyping) {
            // Skip typing animation - show full text
            SoundManager.getInstance().play('click');

            this.isTyping = false;
            if (this.typingTimer) {
                this.typingTimer.destroy();
                this.typingTimer = undefined;
            }
            this.currentCharIndex = this.fullText.length;
            this.bubbleText.setText(this.fullText);
            if (this.onCompleteCallback) {
                this.indicatorText.setVisible(true);
            }
            this.refreshBubble();
        } else if (this.onCompleteCallback) {
            SoundManager.getInstance().play('click');

            // Dismiss message
            const callback = this.onCompleteCallback;
            this.onCompleteCallback = undefined; // Clear callback to prevent double trigger
            this.indicatorText.setVisible(false); // Hide indicator
            callback();
        }
    }

    private refreshBubble() {
        // Redraw background to fit text
        const x = this.bubbleText.x;
        const y = this.bubbleText.y;
        const width = this.bubbleText.width;
        const height = this.bubbleText.height;

        const padding = 10;
        const radius = 20;

        // Update indicator position (bottom right of bubble)
        this.indicatorText.setPosition(x + width + padding - 5, y + height + padding - 2);

        this.bubbleBackground.clear();
        this.bubbleBackground.fillStyle(0xffffff, 1);
        this.bubbleBackground.lineStyle(2, 0x000000, 1);

        // Draw rounded rectangle
        this.bubbleBackground.fillRoundedRect(
            x - padding,
            y - padding,
            width + padding * 2,
            height + padding * 2,
            radius
        );
        this.bubbleBackground.strokeRoundedRect(
            x - padding,
            y - padding,
            width + padding * 2,
            height + padding * 2,
            radius
        );

        // Make interactive for click (only set up once)
        if (!this.speechBubble.input) {
            this.speechBubble.setInteractive(
                new Phaser.Geom.Rectangle(x - padding, y - padding, width + padding * 2, height + padding * 2),
                Phaser.Geom.Rectangle.Contains
            );
            this.speechBubble.on('pointerdown', () => {
                this.handleInteraction();
            });
        } else {
            // Update hit area for existing interactive object
            this.speechBubble.input.hitArea = new Phaser.Geom.Rectangle(
                x - padding,
                y - padding,
                width + padding * 2,
                height + padding * 2
            );
        }
    }

    hide() {
        this.speechBubble.setVisible(false);
    }
}
