// Credits go to Nik Danilov's Whisper Plugin: https://github.com/nikdanilov/whisper-obsidian-plugin


import {Observable} from "./Observable";
import ThoughtStream from "../main";
import {setIcon} from "obsidian";
import {RecorderState} from "./GhostWhisper/AudioRecorder";

export enum RecordingStatus {
	Idle = "idle",
	Recording = "recording",
	Processing = "processing",
}

export type StatusBarState = RecorderState | 'processing';

export class StatusBar {
	private plugin: ThoughtStream;
	private readonly statusBarIcon: HTMLElement | null = null;
	private statusBarPauseIcon: HTMLElement | null = null;
	private readonly statusBarItem: HTMLElement | null = null;
	private readonly subscriptions = new Set<() => void>();
	public readonly $state: Observable<StatusBarState> = new Observable<StatusBarState>('inactive');

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
		this.statusBarItem = this.plugin.addStatusBarItem();

		this.statusBarIcon = this.plugin.addStatusBarItem();
		this.statusBarIcon.addClass('thought-stream-status-bar-icon');
		this.statusBarIcon.onClickEvent(async () => {
			await this.plugin.controller.toggleRecording();
		});

		this.subscriptions.add(this.plugin.recorder.$state.subscribe((state) => {
			this.updateStatus(state);
		}));

		this.subscriptions.add(this.plugin.audioHandler.$state.subscribe((state) => {
			if (state === 'processing') {
				this.updateStatus('processing');
			} else if (state === 'idle') {
				this.updateStatus('inactive');
			}
		}));

		this.updateStatus();
		this.updatePauseIcon();
	}

	updateStatus(status: StatusBarState = this.$state.value) {
		if (this.$state.value !== status) {
			this.$state.value = status;
		}
		this.updatePauseIcon(status);

		if (this.statusBarItem && this.statusBarIcon) {
			switch (status) {
				case 'recording':
					this.statusBarItem.textContent = "GhostWhisper recording...";
					this.statusBarIcon.style.color = "red";
					setIcon(this.statusBarIcon, "square");
					this.updatePauseIcon();
					break;
				case 'processing':
					this.statusBarItem.textContent = "GhostWhisper processing audio...";
					this.statusBarIcon.style.color = "orange";
					setIcon(this.statusBarIcon, "sync");
					break;
				case 'paused':
					this.statusBarItem.textContent = "GhostWhisper paused";
					this.statusBarIcon.style.color = "green";
					setIcon(this.statusBarIcon, "play");
					break;
				case 'inactive':
				default:
					this.statusBarItem.textContent = "GhostWhisper idle";
					this.statusBarIcon.style.color = "green";
					setIcon(this.statusBarIcon, "mic");
					break;
			}
		}
	}

	updatePauseIcon(state: StatusBarState = this.$state.value) {
		this.statusBarPauseIcon?.remove();
		this.statusBarPauseIcon = null;
		if (state === 'recording') {
			this.statusBarPauseIcon = this.plugin.addStatusBarItem();
			this.statusBarPauseIcon.addClass('thought-stream-status-bar-icon');
			this.statusBarPauseIcon.style.color = "orange";
			setIcon(this.statusBarPauseIcon, "pause");
			this.statusBarPauseIcon.onClickEvent(async () => {
				await this.plugin.controller.pauseRecording();
			}, {
				once: true,
			});
		}
	}

	remove() {
		if (this.statusBarItem) {
			this.statusBarItem.remove();
		}

		if (this.statusBarIcon) {
			this.statusBarIcon.remove();
		}

		if (this.statusBarPauseIcon) {
			this.statusBarPauseIcon.remove();
		}

		this.subscriptions.forEach((unsubscribe) => unsubscribe());
		this.subscriptions.clear();
	}
}
