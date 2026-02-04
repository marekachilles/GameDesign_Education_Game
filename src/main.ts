import Phaser from 'phaser';
import Level1Part1 from './scenes/level-1-agency/Level1Part1';
import Level1Part2 from './scenes/level-1-agency/Level1Part2';
import Level1Part3 from './scenes/level-1-agency/Level1Part3';
import Level1Quiz from './scenes/level-1-agency/Level1Quiz';
import WhatIsAGameScene from './scenes/level-2-whatIsAGame/WhatIsAGameScene';
import Level3RivalHoopsScene from './scenes/level-3-rivalHoops/Level3RivalHoopsScene';
import StartScene from './scenes/StartScene';
import PauseMenuManager from './utils/PauseMenuManager';
import SoundManager from './utils/SoundManager';
import QuizScene from './scenes/QuizScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT
    },
    parent: 'app',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900, x: 0 },
            debug: false,
            fps: 360, // mehr Steps
            timeScale: 1
        }
    },
    scene: [
        StartScene,
        Level1Part1,
        Level1Part2,
        Level1Part3,
        Level1Quiz,
        WhatIsAGameScene,
        Level3RivalHoopsScene,
        QuizScene
    ]
};
console.log('[BOOT] main.ts loaded');

window.game = new Phaser.Game(config);

// Initialize PauseMenuManager
PauseMenuManager.getInstance().init(window.game);

// Initialize SoundManager
SoundManager.getInstance().init(window.game);
