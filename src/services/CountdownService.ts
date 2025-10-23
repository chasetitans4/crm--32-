export class CountdownService {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  startCountdown(
    id: string,
    duration: number,
    onTick: (remaining: number) => void,
    onComplete: () => void
  ): void {
    // Clear existing timer if any
    this.stopCountdown(id);

    let remaining = duration;
    onTick(remaining);

    const timer = setInterval(() => {
      remaining -= 1000;
      
      if (remaining <= 0) {
        this.stopCountdown(id);
        onComplete();
      } else {
        onTick(remaining);
      }
    }, 1000);

    this.timers.set(id, timer);
  }

  stopCountdown(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  stopAllCountdowns(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
  }

  isRunning(id: string): boolean {
    return this.timers.has(id);
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const countdownService = new CountdownService();
