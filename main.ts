import {Plugin, WorkspaceLeaf} from "obsidian";
import { Timer } from "src/GhostWhisper/Timer";
import {RecorderModal} from "src/GhostWhisper/RecorderModal";
import {GhostReaderView, VIEW_TYPE_GHOST_READER} from "src/GhostReader/GhostReaderView";
import { GhostWhisper } from "src/GhostWhisper/GhostWhisper";
import { SettingsTab } from "src/Settings/SettingsTab";
import { SettingsManager, WhisperBuddySettings } from "src/Settings/SettingsManager";
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
export default class WhisperBuddy extends Plugin {
	settings: WhisperBuddySettings;
	settingsManager: SettingsManager;
	aiClient: AiClient;
	ghostReader: GhostReader;
	ghostWriter: GhostWriter;
	timer: Timer;
	recorder: NativeAudioRecorder;
	audioHandler: GhostWhisper;
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

		this.addRibbonIcon("mic", "Start recording and open recorder controls", (evt) => {
			this.getRecorderModal().open();
			this.controller.startRecording();
		});

		this.registerView(
			VIEW_TYPE_GHOST_READER,
			(leaf) => new GhostReaderView(leaf, this)
		);
		this.addRibbonIcon("ghost", "Open Ghost-Reader View", (evt) => {
			this.activateControlsView().then(() => console.log('activated'));
		});

		const fileOpen = this.app.workspace.on('file-open', async (file) => {
			if (file) {
				await this.ghostReader.getQuestionsFromFrontmatter();
				await this.ghostReader.autoGenerateForActiveFile();
			}
		})
		const editorChange = this.app.workspace.on('editor-change', async (editor, info) => {
			if (info.file) {
				// await this.ghostReader.autoReadActiveFileOnEditorChange();
				console.log('editor change', info.file);
			}
		})
		this.registerEvent(fileOpen)
		this.registerEvent(editorChange)

		this.addSettingTab(new SettingsTab(this.app, this));

		this.timer = new Timer();
		this.recorder = new NativeAudioRecorder();
		this.audioHandler = new GhostWhisper(this);
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
			icon: 'activity',
			name: "Start/stop recording",
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
					this.statusBar.updateStatus('inactive');
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
			id: "recording-controls",
			icon: "mic",
			name: "Start recording and open recorder controls",
			callback: async () => {
				if (this.recorder.getRecordingState() === 'inactive' || !this.recorder.getRecordingState()) {
					this.controller.startRecording();
				}
				this.getRecorderModal().open();
			},
			hotkeys: [
				{
					modifiers: ["Ctrl"],
					key: "Q",
				},
			],
		});

		this.addCommand({
			id: "upload-audio-file",
			icon: 'file-audio',
			name: "Upload audio file and transcribe",
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
			hotkeys: [
				{
					modifiers: ["Ctrl", "Shift"],
					key: "Q",
				},
			],
		});

		this.addCommand({
			id: "create-content",
			icon: "wand-sparkles",
			name: "Create/generate content based on active file",
			callback: () => {
				new GhostWriterModal(this).open();
			},
		});
		this.addCommand({
			id: "create-content-preset",
			name: "Create content preset",
			callback: () => {
				new CreatePresetModal(this).open();
			},
		});
		this.addCommand({
			id: "open-ghost-reader-view",
			name: "Open Whisper Buddy Ghosts view",
			callback: () => {
				new CreatePresetModal(this).open();
			},
		});
	}

	async activateControlsView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_GHOST_READER);
		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: VIEW_TYPE_GHOST_READER, active: true });
		}

		if (this.settings.debugMode) {
			console.log(leaf)
		}

		if (leaf) {
			// "Reveal" the leaf in case it is in a collapsed sidebar
			workspace.revealLeaf(leaf);
		}
	}
}
