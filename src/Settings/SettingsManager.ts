import { Plugin } from "obsidian";
import {Notifiable} from "../Observable";
import ThoughtStream from "../../main";

export interface ThoughtStreamSettings {
	transcriptionApiKey: string;
	transcriptionApiUrl: string;
	transcriptionModel: string;
	transcriptionPrompt: string;
	language: string;
	saveAudioFile: boolean;
	saveAudioFilePath: string;
	createNewFileAfterRecording: boolean;
	createNewFileAfterRecordingPath: string;
	saveRecordingToClipboard: boolean;

	completionApiKey: string;
	completionModel: string;
	completionApiUrl: string;
	completionPrompt: string;
	saveDraftsFilePath: string;
	lastUsedPreset: string;

	autoReadActiveFile: boolean;
	autoReadActiveFileIncludeExcludeType: IncludeExcludeType;
	autoReadActiveFileExclude: string[];
	autoReadActiveFileInclude: string[];
	autoReadMinimumCharacterCount: number;

	debugMode: boolean;
}

type IncludeExcludeType = 'path' | 'tag';

export const DEFAULT_SETTINGS: ThoughtStreamSettings = {
	transcriptionApiKey: "",
	transcriptionApiUrl: "https://api.openai.com/v1/audio/transcriptions",
	transcriptionModel: "whisper-1",
	transcriptionPrompt: "",
	language: "en",
	saveAudioFile: true,
	saveAudioFilePath: "",
	createNewFileAfterRecording: true,
	createNewFileAfterRecordingPath: "",
	saveRecordingToClipboard: false,

	completionApiKey: "",
	completionApiUrl: "https://api.openai.com/v1",
	completionModel: "gpt-4o-mini",
	completionPrompt: "",
	saveDraftsFilePath: "",
	lastUsedPreset: "",

	autoReadActiveFile: false,
	autoReadActiveFileIncludeExcludeType: "path",
	autoReadActiveFileExclude: [],
	autoReadActiveFileInclude: [],
	autoReadMinimumCharacterCount: 25,

	debugMode: false,
};

export class SettingsManager {
	private plugin: ThoughtStream;
	public readonly $changedSettings = new Notifiable<ThoughtStreamSettings>();

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
	}

	async loadSettings(): Promise<ThoughtStreamSettings> {
		return Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.plugin.loadData()
		);
	}

	async saveSettings(settings: ThoughtStreamSettings): Promise<void> {
		await this.plugin.saveData(settings);
		this.$changedSettings.notify(settings);
	}
}
