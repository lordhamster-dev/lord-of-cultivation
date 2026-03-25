import type { GameState } from '../core/types';
import { migrate } from './Migration';

const SAVE_KEY = 'lord_of_cultivation_save_v1';

export class SaveManager {
  /** Persist game state to localStorage. */
  static save(data: GameState): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[SaveManager] Failed to save:', e);
    }
  }

  /** Load and migrate game state from localStorage. */
  static load(): GameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<GameState>;
      return migrate(parsed);
    } catch (e) {
      console.error('[SaveManager] Failed to load:', e);
      return null;
    }
  }

  /** Export save as a downloadable JSON file. */
  static exportJSON(data: GameState): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lord_of_cultivation_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Import save from a JSON File object. */
  static importJSON(file: File): Promise<GameState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string) as Partial<GameState>;
          resolve(migrate(parsed));
        } catch {
          reject(new Error('无效的存档文件'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }

  /** Export save as a Base64-encoded string. */
  static exportBase64(data: GameState): string {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ));
  }

  /** Import save from a Base64-encoded string. */
  static importBase64(str: string): GameState {
    try {
      const json = decodeURIComponent(
        Array.from(atob(str))
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const parsed = JSON.parse(json) as Partial<GameState>;
      return migrate(parsed);
    } catch {
      throw new Error('无效的 Base64 存档字符串');
    }
  }

  /** Delete the save from localStorage. */
  static deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}
