export interface SceneSaveSnapshot<T = Record<string, unknown>> {
    sceneKey: string;
    stateKey: string;
    data: T;
    timestamp: number;
}

type SaveStore = Record<string, SceneSaveSnapshot>;

export default class SaveManager {
    private static STORAGE_KEY = 'game_save_state';

    private static loadStore(): SaveStore {
        try {
            const raw = localStorage.getItem(SaveManager.STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw) as SaveStore;
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }

    private static writeStore(store: SaveStore): void {
        try {
            localStorage.setItem(SaveManager.STORAGE_KEY, JSON.stringify(store));
        } catch {
            // ignore storage errors (quota/private mode)
        }
    }

    static save<T extends Record<string, unknown>>(
        sceneKey: string,
        stateKey: string,
        data: T
    ): void {
        const store = SaveManager.loadStore();
        store[sceneKey] = {
            sceneKey,
            stateKey,
            data,
            timestamp: Date.now()
        };
        SaveManager.writeStore(store);
    }

    static load(sceneKey: string): SceneSaveSnapshot | null {
        const store = SaveManager.loadStore();
        return store[sceneKey] ?? null;
    }

    static clear(sceneKey: string): void {
        const store = SaveManager.loadStore();
        if (store[sceneKey]) {
            delete store[sceneKey];
            SaveManager.writeStore(store);
        }
    }

    static clearAll(): void {
        SaveManager.writeStore({});
    }
}
