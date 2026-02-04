import WhatIsAGameState from './0_WhatIsAGameState';

export default class BlankState extends WhatIsAGameState {
    enter(): void {
        // wird einmal aufgerufen
    }

    update(): void {
        // wiederholt sich
        this.scene.player.update();
        this.scene.ball?.update();
    }

    // optional muss nicht implementiert werden:
    override exit() {}
}
