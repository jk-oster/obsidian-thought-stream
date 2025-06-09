import ThoughtStream from "main";
import {BaseComponent, ButtonComponent, Component, ItemView, Modal, WorkspaceLeaf} from "obsidian";
import { RecordingStatus } from "../StatusBar";
import {RecorderState} from "./AudioRecorder";

export interface Controls {
	startRecording(): Promise<void>;
	pauseRecording(): Promise<void>;
	stopRecording(): Promise<void>;
}

export class RecorderModal extends Modal {
	private plugin: ThoughtStream;
	private startButton: ButtonComponent;
	private pauseButton: ButtonComponent;
	private stopButton: ButtonComponent;
	private timerDisplay: HTMLElement;
	private subscriptions = new Set<() => void>();
	private headlineEl: HTMLElement | null = null;

	constructor(plugin: ThoughtStream, heading?: string) {
		super(plugin.app);
		this.plugin = plugin;
		this.containerEl.addClass("recording-controls");

		// this.titleEl.setText(heading);
		if (heading) {
			this.headlineEl = this.contentEl.createEl('h3', {
				text: heading,
				cls: "heading"
			});
		}

		// Add elapsed time display
		this.timerDisplay = this.contentEl.createEl("div", { cls: "timer" });

		// Add a button group
		const buttonGroupEl = this.contentEl.createEl("div", {
			cls: "button-group",
		});

		// Add record button
		this.startButton = new ButtonComponent(buttonGroupEl);
		this.startButton
			.setButtonText(" Record")
			.setTooltip("Start recording audio")
			.setIcon("mic")
			.onClick(async () => {
				await this.plugin.controller.startRecording();
			})
			.setClass("button-component");

		// Add pause button
		this.pauseButton = new ButtonComponent(buttonGroupEl);
		this.pauseButton
			.setButtonText(" Pause")
			.setTooltip("Pause/Resume recording")
			.setDisabled(this.plugin.recorder.getRecordingState() === "inactive" || !this.plugin.recorder.getRecordingState())
			.setIcon("pause")
			.onClick(async () => {
				await this.plugin.controller.pauseRecording()
			})
			.setClass("button-component");

		// Add stop button
		this.stopButton = new ButtonComponent(buttonGroupEl);
		this.stopButton
			.setButtonText(" Stop")
			.setTooltip("Stop recording and process audio")
			.setDisabled(this.plugin.recorder.getRecordingState() === "inactive" || !this.plugin.recorder.getRecordingState())
			.setIcon("square")
			.onClick(async () => {
				await this.plugin.controller.stopRecording();
				this.close();
			})
			.setClass("button-component");
	}

	public async onOpen() {
		super.onOpen();
		// Update the UI display initially
		this.uiUpdateTimer();
		this.uiUpdateRecordingState();
		this.subscriptions.add(this.plugin.timer.$elapsedTimeMs.subscribe(() => {
			this.uiUpdateTimer();
		}));
		this.subscriptions.add(this.plugin.recorder.$state.subscribe((state: RecorderState) => {
			this.uiUpdateRecordingState(state);
		}));
	}

	public async onClose() {
		super.onClose();
		this.subscriptions.forEach((unsubscribe) => unsubscribe());
		this.subscriptions.clear();

		if (this.headlineEl) {
			this.headlineEl?.remove();
			this.headlineEl = null;
		}
	}

	public async openWithHeading(heading: string) {
		this.uiUpdateHeading(heading);
		this.open();
	}

	public uiUpdateHeading(heading: string) {
		if (!heading) {
			if (this.headlineEl) {
				this.headlineEl?.remove();
				this.headlineEl = null;
			}
			return;
		}

		if (this.headlineEl) {
			this.headlineEl.textContent = heading;
		} else {
			this.headlineEl = this.contentEl.createEl('h3', {
				text: heading,
				cls: "heading"
			});
		}
	}

	private uiUpdateTimer(formattedTime: string | null = null) {
		this.timerDisplay.textContent = formattedTime ?? this.plugin.timer.getFormattedTime();
	}

	private uiUpdateRecordingState(recordingState: RecorderState| null = null) {
		const recorderState = recordingState ?? this.plugin.recorder.getRecordingState();

		this.startButton.setDisabled(
			recorderState === "recording" || recorderState === "paused"
		);
		this.pauseButton.setDisabled(recorderState === "inactive");
		this.stopButton.setDisabled(recorderState === "inactive");

		this.pauseButton.setButtonText(
			recorderState === "paused" ? " Resume" : " Pause"
		);
		this.pauseButton.setIcon(
			recorderState === "paused" ? "play" : "pause"
		);
	}
}

