import Phaser from "phaser";

type QuizInitData = {
  playerId: string;
  from?: string;      // z.B. "Level3RivalHoopsScene"
  winner?: string;    // z.B. "Du" / "Der NPC"
};

type Question = {
  id: string;
  text: string;
  choices: { id: string; text: string }[];
};

export default class QuizScene extends Phaser.Scene {
  private playerId!: string;
  private from?: string;
  private winner?: string;

  private index = 0;
  private questions: Question[] = [];

  private container!: Phaser.GameObjects.Container;
  private questionText!: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Container[] = [];

  // lokale Antworten dieser Session
  private answers: Record<string, string> = {};

  constructor() {
    super("QuizScene");
  }

  init(data: QuizInitData) {
    this.playerId = data?.playerId ?? crypto.randomUUID();
    this.from = data?.from;
    this.winner = data?.winner;
  }

  create() {
    const { width, height } = this.scale;

    // Hintergrund leicht abdunkeln (UI-Fokus)
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    // Beispiel-Fragen (Game Design)
    this.questions = this.buildQuestions();

    // UI Container (zentriert)
    this.container = this.add.container(width / 2, height / 2);

    // Panel (50% breiter als klassisch: wir nehmen 900 statt 600)
    const panelW = Math.min(1100, width * 0.75);
    const panelH = Math.min(700, height * 0.75);

    const panelBg = this.add
      .rectangle(0, 0, panelW, panelH, 0x111111, 0.92)
      .setStrokeStyle(4, 0xffffff, 0.4);

    this.container.add(panelBg);

    // Header
    const title = this.add
      .text(0, -panelH / 2 + 40, "Kurzfragebogen", {
        fontFamily: "monospace",
        fontSize: "34px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.container.add(title);

    // Subheader Kontext
    const sub = this.add
      .text(
        0,
        -panelH / 2 + 85,
        this.buildSubtitle(),
        {
          fontFamily: "monospace",
          fontSize: "18px",
          color: "#cccccc",
          align: "center",
          wordWrap: { width: panelW - 120 },
        }
      )
      .setOrigin(0.5);
    this.container.add(sub);

    // Frage-Text
    this.questionText = this.add
      .text(0, -panelH / 2 + 150, "", {
        fontFamily: "monospace",
        fontSize: "26px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: panelW - 120 },
      })
      .setOrigin(0.5, 0);

    this.container.add(this.questionText);

    // Erste Frage rendern
    this.showQuestion();

    // Hinweis unten
    const hint = this.add
      .text(0, panelH / 2 - 30, "Klicke eine Antwort an, um fortzufahren.", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);
    this.container.add(hint);
  }

  // -------------------------------------------------------
  // Rendering
  // -------------------------------------------------------

  private showQuestion() {
    // Buttons entfernen
    this.choiceButtons.forEach((c) => c.destroy());
    this.choiceButtons = [];

    const q = this.questions[this.index];
    if (!q) {
      this.finishQuiz();
      return;
    }

    this.questionText.setText(`${this.index + 1}/${this.questions.length}: ${q.text}`);

    // Layout
    const startY = -40;
    const spacing = 78;

    q.choices.forEach((choice, i) => {
      const btn = this.createChoiceButton(choice.text, 0, startY + i * spacing, () => {
        this.handleAnswer(q.id, choice.id);
      });

      this.container.add(btn);
      this.choiceButtons.push(btn);
    });
  }

  private createChoiceButton(label: string, x: number, y: number, onClick: () => void) {
    const buttonW = 800; // bewusst breit
    const buttonH = 56;

    const c = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, buttonW, buttonH, 0x222222, 1)
      .setStrokeStyle(2, 0xffffff, 0.15);

    const text = this.add
      .text(-buttonW / 2 + 18, 0, label, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);

    bg.setInteractive({ useHandCursor: true });

    bg.on("pointerover", () => bg.setFillStyle(0x2d2d2d, 1));
    bg.on("pointerout", () => bg.setFillStyle(0x222222, 1));
    bg.on("pointerdown", () => {
      // visuelles Feedback
      bg.setFillStyle(0x335533, 1);
      onClick();
    });

    c.add([bg, text]);
    return c;
  }

  // -------------------------------------------------------
  // Antwort speichern + nächste Frage
  // -------------------------------------------------------

  private handleAnswer(questionId: string, choiceId: string) {
    // 1) In-Memory
    this.answers[questionId] = choiceId;

    // 2) Persistent: pro playerId speichern
    this.saveAnswer(this.playerId, questionId, choiceId);

    // 3) Nächste Frage
    this.index++;

    // kleine Verzögerung für Feedback
    this.time.delayedCall(180, () => this.showQuestion());
  }

  private saveAnswer(playerId: string, questionId: string, choiceId: string) {
    const storageKey = this.getStorageKey(playerId);

    const raw = localStorage.getItem(storageKey);
    const data = raw ? (JSON.parse(raw) as any) : { meta: {}, answers: {} };

    data.meta = {
      ...(data.meta ?? {}),
      playerId,
      lastUpdated: new Date().toISOString(),
      from: this.from ?? data.meta?.from,
      winner: this.winner ?? data.meta?.winner,
    };

    data.answers = {
      ...(data.answers ?? {}),
      [questionId]: choiceId,
    };

    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  private finishQuiz() {
    // Optional: Alles nochmal als Paket speichern (falls du zusätzlich willst)
    const storageKey = this.getStorageKey(this.playerId);
    const raw = localStorage.getItem(storageKey);
    const data = raw ? (JSON.parse(raw) as any) : { meta: {}, answers: {} };

    data.meta = {
      ...(data.meta ?? {}),
      finishedAt: new Date().toISOString(),
      totalQuestions: this.questions.length,
    };

    localStorage.setItem(storageKey, JSON.stringify(data));

    // CSV Download ausgeben
    this.downloadCsv();

    // Abschlussanzeige
    this.showFinishScreen();
  }

  private showFinishScreen() {
    // UI leeren
    this.choiceButtons.forEach((c) => c.destroy());
    this.choiceButtons = [];

    this.questionText.setText("Danke! Du hast den Fragebogen abgeschlossen.\nZurück zum Hauptmenü...");

    this.time.delayedCall(1200, () => {
      this.scene.start("StartScene");
    });
  }

  private downloadCsv(): void {
    const rows: string[] = [];
    rows.push("playerId,questionId,questionText,choiceId,choiceText");

    const questionMap = new Map(this.questions.map((q) => [q.id, q]));

    Object.entries(this.answers).forEach(([questionId, choiceId]) => {
      const q = questionMap.get(questionId);
      const choice = q?.choices.find((c) => c.id === choiceId);

      const safe = (value: string) => `"${(value ?? "").replace(/"/g, '""')}"`;

      rows.push(
        [
          safe(this.playerId),
          safe(questionId),
          safe(q?.text ?? ""),
          safe(choiceId),
          safe(choice?.text ?? ""),
        ].join(",")
      );
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz_answers_${this.playerId}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private loadAnswers(playerId: string) {
    const raw = localStorage.getItem(this.getStorageKey(playerId));
    return raw ? JSON.parse(raw) : null;
  }

  private getStorageKey(playerId: string) {
    return `gd_quiz_answers_${playerId}`;
  }

  // -------------------------------------------------------
  // Fragen
  // -------------------------------------------------------

  private buildQuestions(): Question[] {
    return [
      {
        id: "q_feedback",
        text: "Wie klar waren die Anweisungen des Companion?",
        choices: [
          { id: "a1", text: "Sehr klar" },
          { id: "a2", text: "Eher klar" },
          { id: "a3", text: "Unklar" },
          { id: "a4", text: "Sehr unklar" },
        ],
      },
      {
        id: "q_challenge",
        text: "Wie passend war die Schwierigkeit der Level ?",
        choices: [
          { id: "a1", text: "Zu leicht" },
          { id: "a2", text: "Genau richtig" },
          { id: "a3", text: "Etwas zu schwer" },
          { id: "a4", text: "Viel zu schwer" },
        ],
      },
      {
        id: "q_controls",
        text: "Wie intuitiv waren die Mechaniken (Werfen, Steuerung, Sprung etc.)?",
        choices: [
          { id: "a1", text: "Sehr intuitiv" },
          { id: "a2", text: "Okay" },
          { id: "a3", text: "Eher verwirrend" },
          { id: "a4", text: "Sehr verwirrend" },
        ],
      },
      {
        id: "q_fun",
        text: "Wie viel hast du insgesamt gelernt ?",
        choices: [
          { id: "a1", text: "Sehr viel" },
          { id: "a2", text: "Ganz okay" },
          { id: "a3", text: "Wenig" },
          { id: "a4", text: "Gar nicht" },
        ],
      },
    ];
  }

  private buildSubtitle(): string {
    const parts: string[] = [];

    if (this.from) parts.push(`Kontext: ${this.from}`);
    if (this.winner) parts.push(`Gewinner: ${this.winner}`);

    parts.push(`Runden-ID: ${this.playerId}`);

    return parts.join("   •   ");
  }
}
