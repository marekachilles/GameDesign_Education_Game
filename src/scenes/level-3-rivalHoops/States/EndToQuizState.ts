import Level3State from "./Level3State";

export default class EndToQuizState extends Level3State {
  update(): void {
    throw new Error("Method not implemented.");
  }
  enter(): void {
    const winner = this.scene.playerScore >= 3 ? "Du" : "Der NPC";

    localStorage.setItem("level", "3");

    this.scene.companion.say(`${winner} hast 3 Körbe getroffen!`, () => {
      const quizPlayerId = crypto.randomUUID();
      this.scene.scene.start("QuizScene", { playerId: quizPlayerId });
    });
  }
}
