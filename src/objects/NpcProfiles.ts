import { NpcDifficulty } from "./NpcRival";
import { NpcSkinKey } from "./NPCSkins";

export type NpcProfileId = "easy" | "medium" | "hard" | "expert";

export type NpcProfile = {
  id: NpcProfileId;
  label: string;
  skin: NpcSkinKey;
  difficulty: NpcDifficulty;
};

export const NPC_PROFILES: Record<NpcProfileId, NpcProfile> = {
  easy: {
    id: "easy",
    label: "Easy Rival",
    skin: "npc_1",
    difficulty: {
      speed: 155,
      decisionMs: 230,
      decisionJitterMs: 90,
      pickupRadius: 60,

      jumpPower: 520,
      jumpChance: 0.22,
      jumpMinDxToHoop: 340,

      throwPower: 620,
      throwPowerJitter: 170,
      aimErrorPx: 130,
      aimErrorJitter: 70,
      throwCooldownMs: 1450,
      throwRangePx: 210,

      stealRadius: 55,
      stealCooldownMs: 1000,
      stealChance: 0.22,

      hesitateChance: 0.28,
      hesitateMs: 420
    }
  },

  medium: {
    id: "medium",
    label: "Medium Rival",
    skin: "npc_1",
    difficulty: {
      speed: 210,
      decisionMs: 150,
      decisionJitterMs: 45,
      pickupRadius: 75,

      jumpPower: 640,
      jumpChance: 0.38,
      jumpMinDxToHoop: 270,

      throwPower: 760,
      throwPowerJitter: 110,
      aimErrorPx: 75,
      aimErrorJitter: 35,
      throwCooldownMs: 1050,
      throwRangePx: 280,

      stealRadius: 80,
      stealCooldownMs: 1000,
      stealChance: 0.40,

      hesitateChance: 0.12,
      hesitateMs: 260
    }
  },

  hard: {
    id: "hard",
    label: "Hard Rival",
    skin: "npc_1",
    difficulty: {
      speed: 250,
      decisionMs: 95,
      decisionJitterMs: 25,
      pickupRadius: 95,

      jumpPower: 720,
      jumpChance: 0.52,
      jumpMinDxToHoop: 230,

      throwPower: 820,
      throwPowerJitter: 80,
      aimErrorPx: 45,
      aimErrorJitter: 20,
      throwCooldownMs: 820,
      throwRangePx: 320,

      stealRadius: 100,
      stealCooldownMs: 1000,
      stealChance: 0.58,

      hesitateChance: 0.07,
      hesitateMs: 180
    }
  },
  expert: {
    id: "hard",
    label: "Expert Rival",
    skin: "npc_1",
    difficulty: {
      speed: 270,
      decisionMs: 80,
      decisionJitterMs: 18,
      pickupRadius: 105,

      jumpPower: 760,
      jumpChance: 0.58,
      jumpMinDxToHoop: 220,

      throwPower: 860,
      throwPowerJitter: 60,
      aimErrorPx: 30,
      aimErrorJitter: 15,
      throwCooldownMs: 720,
      throwRangePx: 340,

      stealRadius: 110,
      stealCooldownMs: 1000,
      stealChance: 0.65,

      hesitateChance: 0.05,
      hesitateMs: 140
    }
  }
};
