/** requestAnimationFrame-based main game loop. */
export class GameLoop {
    private rafId: number | null = null;
    private lastTick = 0;
    private running = false;

    start(onTick: (deltaMs: number) => void): void {
        if (this.running) return;
        this.running = true;
        this.lastTick = performance.now();

        const loop = (now: number) => {
            if (!this.running) return;
            const deltaMs = now - this.lastTick;
            this.lastTick = now;
            onTick(deltaMs);
            this.rafId = requestAnimationFrame(loop);
        };

        this.rafId = requestAnimationFrame(loop);
    }

    stop(): void {
        this.running = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    isRunning(): boolean {
        return this.running;
    }
}
