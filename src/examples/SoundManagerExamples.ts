/**
 * Example: How to add and use new sounds in the game
 *
 * This file demonstrates various ways to integrate the SoundManager
 * into different parts of your game.
 */

import SoundManager from '../utils/SoundManager';
import Phaser from 'phaser';

// ============================================
// EXAMPLE 1: Play sound on correct answer
// ============================================
class QuizExample {
    checkAnswer(isCorrect: boolean) {
        if (isCorrect) {
            // Play success sound
            SoundManager.getInstance().play('success');
            console.log('Correct answer!');
        } else {
            // When you add an error sound, you can play it here:
            // SoundManager.getInstance().play('error');
            console.log('Wrong answer!');
        }
    }
}

// ============================================
// EXAMPLE 2: Play sound on player collision
// ============================================
class CollisionExample extends Phaser.Scene {
    create() {
        const player = this.physics.add.sprite(100, 100, 'player');
        const coin = this.physics.add.sprite(200, 100, 'coin');

        // Play sound when player collects coin
        this.physics.add.overlap(player, coin, () => {
            SoundManager.getInstance().play('success');
            coin.destroy();
        });
    }
}

// ============================================
// EXAMPLE 3: Play sound on button click
// ============================================
class ButtonExample extends Phaser.Scene {
    create() {
        const button = this.add
            .text(100, 100, 'Click Me', {
                fontSize: '32px',
                color: '#ffffff'
            })
            .setInteractive()
            .on('pointerdown', () => {
                // Play sound on click
                SoundManager.getInstance().play('success');
                console.log('Button clicked!');
            });
    }
}

// ============================================
// EXAMPLE 4: Background music with loop
// ============================================
class MusicExample extends Phaser.Scene {
    create() {
        // After adding background music to SoundManager config:
        // SoundManager.getInstance().play('background_music');

        // Toggle music on/off
        const toggleButton = this.add
            .text(100, 100, 'Toggle Music', {
                fontSize: '24px',
                color: '#ffffff'
            })
            .setInteractive()
            .on('pointerdown', () => {
                const isMuted = SoundManager.getInstance().isMuted();
                SoundManager.getInstance().setMute(!isMuted);
            });
    }
}

// ============================================
// EXAMPLE 5: Volume control slider
// ============================================
class VolumeControlExample extends Phaser.Scene {
    create() {
        // Simple volume control (you'd want to make this more interactive)
        const volumeText = this.add.text(100, 100, 'Volume: 100%', {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Decrease volume button
        this.add
            .text(100, 150, '- Volume', { fontSize: '20px', color: '#ffffff' })
            .setInteractive()
            .on('pointerdown', () => {
                SoundManager.getInstance().setGlobalVolume(0.5);
                volumeText.setText('Volume: 50%');
            });

        // Increase volume button
        this.add
            .text(250, 150, '+ Volume', { fontSize: '20px', color: '#ffffff' })
            .setInteractive()
            .on('pointerdown', () => {
                SoundManager.getInstance().setGlobalVolume(1.0);
                volumeText.setText('Volume: 100%');
            });
    }
}

// ============================================
// EXAMPLE 6: Play sound with custom volume
// ============================================
class CustomVolumeExample {
    playQuietSound() {
        // Play at 30% volume
        SoundManager.getInstance().play('success', 0.3);
    }

    playLoudSound() {
        // Play at 100% volume
        SoundManager.getInstance().play('success', 1.0);
    }
}

// ============================================
// EXAMPLE 7: Stop background music
// ============================================
class StopMusicExample extends Phaser.Scene {
    create() {
        // Start music
        // SoundManager.getInstance().play('background_music');

        // Stop music after 10 seconds
        this.time.delayedCall(10000, () => {
            // SoundManager.getInstance().stop('background_music');
            console.log('Music stopped');
        });
    }
}

// ============================================
// EXAMPLE 8: Sound on level completion
// ============================================
class LevelCompleteExample extends Phaser.Scene {
    completeLevel() {
        // Play success sound
        SoundManager.getInstance().play('success');

        // Show completion message
        this.add
            .text(400, 300, 'Level Complete!', {
                fontSize: '48px',
                color: '#00ff00'
            })
            .setOrigin(0.5);

        // Transition to next level after delay
        this.time.delayedCall(2000, () => {
            this.scene.start('NextLevel');
        });
    }
}

// ============================================
// HOW TO ADD NEW SOUNDS
// ============================================
/*
1. Add your sound file to: src/assets/sounds/your-sound.mp3

2. Update SoundManager.ts soundConfig:

private soundConfig = {
    success: {
        key: 'success1',
        path: 'assets/sounds/success1.mp3',
        volume: 0.7,
        loop: false
    },
    // Add your new sound:
    error: {
        key: 'error1',
        path: 'assets/sounds/error.mp3',
        volume: 0.5,
        loop: false
    },
    coin_collect: {
        key: 'coin',
        path: 'assets/sounds/coin.mp3',
        volume: 0.6,
        loop: false
    },
    background_music: {
        key: 'bg_music',
        path: 'assets/sounds/background.mp3',
        volume: 0.3,
        loop: true  // Loop for music
    }
};

3. Use it anywhere in your game:
   SoundManager.getInstance().play('error');
   SoundManager.getInstance().play('coin_collect');
   SoundManager.getInstance().play('background_music');
*/

export {
    QuizExample,
    CollisionExample,
    ButtonExample,
    MusicExample,
    VolumeControlExample,
    CustomVolumeExample,
    StopMusicExample,
    LevelCompleteExample
};
