import { Plugin } from "obsidian";
import {Observable} from "./Observable";
import ThoughtStream from "../main";

export enum RecordingStatus {
	Idle = "idle",
	Recording = "recording",
	Processing = "processing",
}

export type StatusBarState = 'idle' | 'paused' | 'recording' | 'processing';

export class StatusBar {
	private plugin: ThoughtStream;
	private readonly statusBarItem: HTMLElement | null = null;
	private readonly subscriptions = new Set<() => void>();
	public readonly $state: Observable<StatusBarState> = new Observable<StatusBarState>('idle');

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
		this.statusBarItem = this.plugin.addStatusBarItem();

		this.subscriptions.add(this.plugin.recorder.$state.subscribe((state) => {
			switch (state) {
				case 'inactive':
					this.updateStatus('idle');
					break;
				case 'recording':
					this.updateStatus('recording');
					break;
				case 'paused':
					this.updateStatus('paused');
					break;
				default:
					this.updateStatus('idle');
			}
		}));

		this.subscriptions.add(this.plugin.audioHandler.$state.subscribe((state) => {
			if (state === 'processing') {
				this.updateStatus('processing');
			} else if (state === 'idle') {
				this.updateStatus('idle');
			}
		}));
	}

	updateStatus(status: StatusBarState = this.$state.value) {
		if (this.$state.value !== status) {
			this.$state.value = status;
		}
		if (this.statusBarItem) {
			switch (status) {
				case 'recording':
					this.statusBarItem.textContent = "Recording...";
					this.statusBarItem.style.color = "red";
					break;
				case 'processing':
					this.statusBarItem.textContent = "Processing audio...";
					this.statusBarItem.style.color = "orange";
					break;
				case 'paused':
					this.statusBarItem.textContent = "Paused...";
					this.statusBarItem.style.color = "orange";
					break;
				case 'idle':
				default:
					this.statusBarItem.textContent = "GhostListener Idle";
					this.statusBarItem.style.color = "green";
					break;
			}
		}
	}

	remove() {
		if (this.statusBarItem) {
			this.statusBarItem.remove();
		}

		this.subscriptions.forEach((unsubscribe) => unsubscribe());
		this.subscriptions.clear();
	}
}
