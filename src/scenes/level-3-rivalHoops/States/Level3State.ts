import Level3RivalHoopsScene from "../Level3RivalHoopsScene";

export default abstract class Level3State {
  protected scene: Level3RivalHoopsScene;

  constructor(scene: Level3RivalHoopsScene) {
    this.scene = scene;
  }

  abstract enter(): void;
  abstract update(time: number, delta: number): void;

  exit(): void {
    
  }
}
