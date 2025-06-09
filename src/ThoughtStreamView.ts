import {ButtonComponent, ItemView, WorkspaceLeaf} from "obsidian";
import ThoughtStream from "../main";
import {RecorderState} from "./GhostWhisper/AudioRecorder";
import {GhostWriterModal} from "./GhostWriter/GhostWriterModal";
import {AnswerModal} from "./GhostReader/AnswerModal";

export const VIEW_TYPE_THOUGHT_STREAM_CONTROLS = 'thought-stream-recorder-view';

export class ThoughtStreamView extends ItemView {
	private plugin: ThoughtStream;
	private startButton: ButtonComponent;
	private pauseButton: ButtonComponent;
	private stopButton: ButtonComponent;
	private generateButton: ButtonComponent;
	private generateQuestionsButton: ButtonComponent;
	private questionsContainer: HTMLElement;
	private timerDisplay: HTMLElement;
	private subscriptions = new Set<CallableFunction>();

	constructor(leaf: WorkspaceLeaf, plugin: ThoughtStream) {
		super(leaf);
		this.plugin = plugin;
	}

	getIcon() {
		return 'ghost';
	}

	getViewType() {
		return VIEW_TYPE_THOUGHT_STREAM_CONTROLS;
	}

	getDisplayText() {
		return 'ThoughStream Ghosts View';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		this.containerEl.addClass("recording-controls");

		// Add elapsed time display
		this.timerDisplay = this.contentEl.createEl("div", { cls: "timer" });

		// Add a button group
		const buttonGroupEl = this.contentEl.createEl("div", {
			cls: "button-group",
		});

		// Add a button group
		const buttonGroupEl2 = this.contentEl.createEl("div", {
			cls: "button-group",
		});

		this.questionsContainer = this.contentEl.createEl("div", {
			cls: "questions-container",
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
				await this.plugin.controller.pauseRecording();
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
			})
			.setClass("button-component");

		this.generateButton = new ButtonComponent(buttonGroupEl2);
		this.generateButton
			.setButtonText(" GhostWriter")
			.setTooltip("GhostWriter. Generate content from currently active file.")
			.setIcon("wand")
			.onClick(async () => {
				new GhostWriterModal(this.plugin).open();
			})
			.setClass("button-component");

		this.generateQuestionsButton = new ButtonComponent(buttonGroupEl2);
		this.generateQuestionsButton
			.setButtonText(" GhostReader")
			.setTooltip("GhostReader: Read currently active file an (re-)generate questions.")
			.setIcon("glasses")
			.onClick(async () => {
				await this.plugin.ghostReader.generateForActiveFile();
			})
			.setClass("button-component");

		// Update the UI display initially
		await this.plugin.ghostReader.getQuestionsFromFrontmatter();
		this.updateTimer();
		this.updateRecordingState();
		this.renderQuestions(this.plugin.ghostReader.$questions.value);
		this.subscriptions.add(this.plugin.timer.$elapsedTimeMs.subscribe(() => {
			this.updateTimer();
			console.log('passed time updated');
		}));
		this.subscriptions.add(this.plugin.ghostReader.$questions.subscribe((questions) => {
			this.renderQuestions(questions);
		}));
		this.subscriptions.add(this.plugin.recorder.$state.subscribe(() => {
			this.updateRecordingState();
		}))
		this.subscriptions.add(this.plugin.audioHandler.$state.subscribe(() => {
			this.updateRecordingState();
		}));
	}

	async onClose() {
		this.containerEl.empty();
		this.subscriptions.forEach((unsubscribe) => unsubscribe());
		this.subscriptions.clear();
	}

	private updateTimer(formattedTime: string | null = null) {
		this.timerDisplay.textContent = formattedTime ?? this.plugin.timer.getFormattedTime();
	}

	private updateRecordingState(recordingState: RecorderState| null = null) {
		const recorderState = recordingState ?? this.plugin.recorder.getRecordingState();

		this.startButton.setDisabled(
			recorderState === "recording" || recorderState === "paused"
		);
		this.pauseButton.setDisabled(recorderState === "inactive");
		this.stopButton.setDisabled(recorderState === "inactive");

		this.pauseButton.setButtonText(
			recorderState === "paused" ? " Resume" : " Pause"
		);this.pauseButton.setIcon(
			recorderState === "paused" ? "play" : "pause"
		);
	}

	private renderQuestions(questions: string[]) {
		this.questionsContainer.empty();
		const questionsList = this.questionsContainer.createEl("ul", {
			cls: "questions-list"
		});
		questions.forEach(question => {
			const questionItem = questionsList.createEl("li", {
				cls: "question-item",
			});

			const questionText = questionItem.createEl("div", {
				cls: "question-text",
				text: question,
			});

			const buttonGroupEl = questionItem.createEl("div", {
				cls: "question-controls",
			});

			const insertButton = new ButtonComponent(buttonGroupEl)
				.setIcon("plus")
				.setTooltip("Insert Question")
				.setClass("insert-question-button")
				.onClick(() => {
					// this.plugin.ghostReader.insertQuestion(question);
					new AnswerModal(this.plugin).openWithQuestion(question);
				})
				.buttonEl.addClass("button-component");

			const deleteButton = new ButtonComponent(buttonGroupEl)
				.setIcon("trash")
				.setTooltip("Delete Question")
				.setClass("delete-question-button")
				.onClick(() => {
					this.plugin.ghostReader.deleteQuestion(question);
				})
				.buttonEl.addClass("button-component");

			const recordButton = new ButtonComponent(buttonGroupEl)
				.setIcon('mic')
				.setTooltip("Record Answer")
				.setClass("record-answer-button")
				.onClick(() => {
					this.plugin.ghostReader.recordAnswer(question);
				})
				.buttonEl.addClass("button-component");
		});
	}
}
