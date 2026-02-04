export type EnemySetKey =
  | "enemyWalking"
  | "enemyFlying"
  | "enemyFlyingAlt"
  | "enemyFloating"
  | "enemySpikey"
  | "enemySwimming";

export type NpcSkinKey = "npc_1" | "npc_2" | "npc_3" | "npc_4";

export type NpcSkinDef = {
  key: NpcSkinKey;

  // Welche Enemy-Frame-Serie wird wann genutzt?
  idleSet: EnemySetKey;
  moveSet: EnemySetKey;
  airSet: EnemySetKey;

  // optionales Tuning für Collider (pro Skin)
  bodyWidthPct: number;   // 0..1
  bodyHeightPct: number;  // 0..1
  frameCount: number;     // hier 4
};

export const NPC_SKINS: Record<NpcSkinKey, NpcSkinDef> = {
  // NPC 1: "Walker" – läuft/rennt per enemyWalking, in der Luft enemyFlying, idle enemyFloating
  npc_1: {
    key: "npc_1",
    idleSet: "enemyWalking",
    moveSet: "enemyWalking",
    airSet: "enemyWalking",
    bodyWidthPct: 0.55,
    bodyHeightPct: 0.80,
    frameCount: 7,
  },

  // NPC 2: "Flyer" – bewegt sich per enemyFlying, in der Luft enemyFlyingAlt, idle enemyFloating
  npc_2: {
    key: "npc_2",
    idleSet: "enemyFloating",
    moveSet: "enemyFlying",
    airSet: "enemyFlyingAlt",
    bodyWidthPct: 0.55,
    bodyHeightPct: 0.80,
    frameCount: 7,
  },

  // NPC 3: "Swimmer" – move/idle per enemySwimming, air per enemyFloating
  npc_3: {
    key: "npc_3",
    idleSet: "enemySwimming",
    moveSet: "enemySwimming",
    airSet: "enemyFloating",
    bodyWidthPct: 0.55,
    bodyHeightPct: 0.80,
    frameCount: 7,
  },

  // NPC 4: "Spikey" – move/idle/air per enemySpikey (Platzhalter, wirkt “stachelig/roboterhaft”)
  npc_4: {
    key: "npc_4",
    idleSet: "enemySpikey",
    moveSet: "enemySpikey",
    airSet: "enemySpikey",
    bodyWidthPct: 0.55,
    bodyHeightPct: 0.80,
    frameCount: 7,
  },
};
