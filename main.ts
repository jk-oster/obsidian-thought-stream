import {Plugin, WorkspaceLeaf} from "obsidian";
import { Timer } from "src/GhostWhisper/Timer";
import {RecorderModal} from "src/GhostWhisper/RecorderModal";
import {ThoughtStreamView, VIEW_TYPE_THOUGHT_STREAM_CONTROLS} from "src/ThoughtStreamView";
import { AudioHandler } from "src/GhostWhisper/AudioHandler";
import { SettingsTab } from "src/Settings/SettingsTab";
import { SettingsManager, ThoughtStreamSettings } from "src/Settings/SettingsManager";
import { NativeAudioRecorder } from "src/GhostWhisper/AudioRecorder";
import { RecordingStatus, StatusBar } from "src/StatusBar";
import {Notifiable} from "./src/Observable";
import {TranscriptionHandler} from "./src/GhostWhisper/TransriptionHandler";
import {AiClient} from "./src/AiClient";
import {GhostReader} from "./src/GhostReader/GhostReader";
import {GhostWriter} from "./src/GhostWriter/GhostWriter";
import {GhostWriterModal} from "./src/GhostWriter/GhostWriterModal";
import {Controller} from "./src/GhostWhisper/Controller";
import {CreatePresetModal} from "./src/GhostWriter/CreatePresetModal";
export default class ThoughtStream extends Plugin {
	settings: ThoughtStreamSettings;
	settingsManager: SettingsManager;
	aiClient: AiClient;
	ghostReader: GhostReader;
	ghostWriter: GhostWriter;
	timer: Timer;
	recorder: NativeAudioRecorder;
	audioHandler: AudioHandler;
	transcriptionHandler: TranscriptionHandler;
	recorderModal: RecorderModal | null = null;
	statusBar: StatusBar;
	controller: Controller;

	public getRecorderModal(): RecorderModal {
		if (!this.recorderModal) {
			this.recorderModal = new RecorderModal(this);
		}
		return this.recorderModal;
	}

	async onload() {
		this.settingsManager = new SettingsManager(this);
		this.settings = await this.settingsManager.loadSettings();
		this.aiClient = new AiClient(this);
		this.ghostWriter = new GhostWriter(this);
		this.ghostReader = new GhostReader(this);
		this.controller = new Controller(this);

		this.addRibbonIcon("mic", "Open recording controls modal", (evt) => {
			this.getRecorderModal().open();
			this.controller.startRecording();
		});

		this.registerView(
			VIEW_TYPE_THOUGHT_STREAM_CONTROLS,
			(leaf) => new ThoughtStreamView(leaf, this)
		);
		this.addRibbonIcon("ghost", "Open Thought Stream Ghosts View", (evt) => {
			this.activateControlsView().then(() => console.log('activated'));
		});

		const fileOpen = this.app.workspace.on('file-open', async (file) => {
			if (file) {
				await this.ghostReader.getQuestionsFromFrontmatter();
				await this.ghostReader.autoGenerateForActiveFile();
			}
		})
		const editorChange = this.app.workspace.on('editor-change', (editor, info) => {
			if (info.file) {
				console.log('editor change', info.file);
			}
		})
		this.registerEvent(fileOpen)
		this.registerEvent(editorChange)

		this.addSettingTab(new SettingsTab(this.app, this));

		this.timer = new Timer();
		this.recorder = new NativeAudioRecorder();
		this.audioHandler = new AudioHandler(this);
		this.transcriptionHandler = new TranscriptionHandler(this);
		this.statusBar = new StatusBar(this);

		this.addCommands();
	}

	onunload() {
		// Cleanup any subscriptions
		Object.keys(this).forEach((key) => {
			const value = (this as any)[key];
			if (value && value instanceof Notifiable) {
				value.clear();
			}
		});

		if (this.recorderModal) {
			this.recorderModal.close();
		}
		this.statusBar.remove();
	}

	addCommands() {
		this.addCommand({
			id: "start-stop-recording",
			name: "GhostWhisper - Start/stop recording",
			callback: async () => {
				if (this.statusBar.$state.value !== 'recording') {
					this.statusBar.updateStatus('recording');
					await this.recorder.startRecording();
					this.timer.start();
				} else {
					this.statusBar.updateStatus('processing');
					this.timer.reset();
					const audioBlob = await this.recorder.stopRecording();
					const extension = this.recorder
						.getMimeType()
						?.split("/")[1];
					const fileName = `${new Date()
						.toISOString()
						.replace(/[:.]/g, "-")}.${extension}`;
					// Use audioBlob to send or save the recorded audio as needed
					await this.audioHandler.fetchTranscription(audioBlob, fileName);
					this.statusBar.updateStatus('idle');
				}
			},
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: "Q",
				},
			],
		});

		this.addCommand({
			id: "upload-audio-file",
			name: "GhostListener - Upload audio file",
			callback: () => {
				// Create an input element for file selection
				const fileInput = document.createElement("input");
				fileInput.type = "file";
				fileInput.accept = "audio/*"; // Accept only audio files

				// Handle file selection
				fileInput.onchange = async (event) => {
					const files = (event.target as HTMLInputElement).files;
					if (files && files.length > 0) {
						const file = files[0];
						const fileName = file.name;
						const audioBlob = file.slice(0, file.size, file.type);
						// Use audioBlob to send or save the uploaded audio as needed
						await this.audioHandler.fetchTranscription(
							audioBlob,
							fileName
						);
					}
				};

				// Programmatically open the file dialog
				fileInput.click();
			},
		});

		this.addCommand({
			id: "create-content",
			name: "GhostWriter - Create Content",
			callback: () => {
				new GhostWriterModal(this).open();
			},
		});
		this.addCommand({
			id: "create-content-preset",
			name: "GhostWriter - Create Content Preset",
			callback: () => {
				new CreatePresetModal(this).open();
			},
		});
	}

	async activateControlsView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_THOUGHT_STREAM_CONTROLS);
		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: VIEW_TYPE_THOUGHT_STREAM_CONTROLS, active: true });
		}

		console.log(leaf)

		if (leaf) {
			// "Reveal" the leaf in case it is in a collapsed sidebar
			workspace.revealLeaf(leaf);
		}
	}
}
