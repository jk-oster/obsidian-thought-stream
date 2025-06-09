// Credits go to Nik Danilov's Whisper Plugin: https://github.com/nikdanilov/whisper-obsidian-plugin


import {Observable} from "../Observable";

export class Timer {
	public readonly $elapsedTimeMs: Observable<number> = new Observable<number>(0);
	private intervalId: number | null = null;

	startInterval(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
		}
		this.intervalId = window.setInterval(() => {
			this.$elapsedTimeMs.value += 1000;
		}, 1000);
	}

	stopInterval(): void {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	start(): void {
		this.startInterval();
	}

	pause(): void {
		if (this.intervalId !== null) {
			this.stopInterval();
		} else {
			this.startInterval();
		}
	}

	reset(): void {
		this.stopInterval();
		this.$elapsedTimeMs.value = 0;
	}

	getFormattedTime(ms: number = this.$elapsedTimeMs.value): string {
		const seconds = Math.floor(ms / 1000) % 60;
		const minutes = Math.floor(ms / 1000 / 60) % 60;
		const hours = Math.floor(ms / 1000 / 60 / 60);

		const pad = (n: number) => (n < 10 ? "0" + n : n);

		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	}
}
