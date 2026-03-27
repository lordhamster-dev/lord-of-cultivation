/** Simple typed event bus for game events. */
export class EventBus<TEventMap extends Record<string, unknown>> {
    private listeners = new Map<keyof TEventMap, Set<(payload: TEventMap[keyof TEventMap]) => void>>();

    on<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        const set = this.listeners.get(event)!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set.add(listener as any);
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set.delete(listener as any);
        };
    }

    emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
        const set = this.listeners.get(event);
        if (!set) return;
        for (const listener of set) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (listener as any)(payload);
        }
    }

    off<K extends keyof TEventMap>(event: K, listener: (payload: TEventMap[K]) => void): void {
        const set = this.listeners.get(event);
        if (!set) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set.delete(listener as any);
    }

    clear(): void {
        this.listeners.clear();
    }
}
