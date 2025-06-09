// Credits go to Nik Danilov's Whisper Plugin: https://github.com/nikdanilov/whisper-obsidian-plugin


import {Observable} from "./Observable";
import ThoughtStream from "../main";
import {setIcon} from "obsidian";

export enum RecordingStatus {
	Idle = "idle",
	Recording = "recording",
	Processing = "processing",
}

export type StatusBarState = 'idle' | 'paused' | 'recording' | 'processing';

export class StatusBar {
	private plugin: ThoughtStream;
	private readonly statusBarIcon: HTMLElement | null = null;
	private readonly statusBarItem: HTMLElement | null = null;
	private readonly subscriptions = new Set<() => void>();
	public readonly $state: Observable<StatusBarState> = new Observable<StatusBarState>('idle');

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
		this.statusBarIcon = this.plugin.addStatusBarItem();
		this.statusBarIcon.addClass('thought-stream-status-bar-icon');
		this.statusBarItem = this.plugin.addStatusBarItem();
		this.statusBarIcon.onClickEvent(async () => {
			await this.plugin.controller.toggleRecording();
		});

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

		this.updateStatus();
	}

	updateStatus(status: StatusBarState = this.$state.value) {
		if (this.$state.value !== status) {
			this.$state.value = status;
		}
		if (this.statusBarItem && this.statusBarIcon) {
			switch (status) {
				case 'recording':
					this.statusBarItem.textContent = "Recording...";
					// this.statusBarItem.style.color = "red";
					this.statusBarIcon.style.color = "red";
					setIcon(this.statusBarIcon, "square");
					break;
				case 'processing':
					this.statusBarItem.textContent = "Processing audio...";
					// this.statusBarItem.style.color = "orange";
					this.statusBarIcon.style.color = "orange";
					setIcon(this.statusBarIcon, "sync");
					break;
				case 'paused':
					this.statusBarItem.textContent = "Paused...";
					// this.statusBarItem.style.color = "orange";
					this.statusBarIcon.style.color = "orange";
					setIcon(this.statusBarIcon, "play");
					break;
				case 'idle':
				default:
					this.statusBarItem.textContent = "GhostWhisper Idle";
					// this.statusBarItem.style.color = "green";
					this.statusBarIcon.style.color = "green";
					setIcon(this.statusBarIcon, "mic");
					break;
			}
		}
	}

	remove() {
		if (this.statusBarItem) {
			this.statusBarItem.remove();
		}

		if (this.statusBarIcon) {
			this.statusBarIcon.remove();
		}

		this.subscriptions.forEach((unsubscribe) => unsubscribe());
		this.subscriptions.clear();
	}
}
