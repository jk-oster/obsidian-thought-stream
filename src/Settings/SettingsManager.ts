import { Plugin } from "obsidian";
import {Notifiable} from "../Observable";
import ThoughtStream from "../../main";
import {CreativityOptions} from "../GhostWriter/GhostWriter";

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
	ghostWriterSystemPrompt: string;

	autoReadActiveFile: boolean;
	autoReadActiveFileIncludeExcludeType: IncludeExcludeType;
	autoReadActiveFileExclude: string[];
	autoReadActiveFileInclude: string[];
	autoReadMinimumCharacterCount: number;
	ghostReaderSystemPrompt: string;

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
	saveRecordingToClipboard: true,

	completionApiKey: "",
	completionApiUrl: "https://api.openai.com/v1",
	completionModel: "gpt-4o-mini",
	completionPrompt: "",
	saveDraftsFilePath: "",
	lastUsedPreset: "",
	ghostWriterSystemPrompt: `
          You are a professional Ghost Writer that writes the content draft for a {{contentType}}.
          You are tasked to write a {{contentType}} based on the thoughts and ideas provided by the user.
          These thoughts are a stream of consciousness that the user has provided - so they may not be well-structured or coherent.
          Make fine tune the {{contentType}} for the target audience with the following description: "{{audience}}".
          Make sure to write a {{contentType}} that is and well-structured, coherent, 
          follows a logical narrative thread and is first and foremost based on the inputs given by the user 
          (don't add things unless asked for by the creativity level!).
          Your goal is to create a {{contentType}} that incorporates the users thoughts.
          Use the following creativity level: "{{creativity}}" - {{creativityDescription}}.
          Generate a sensible title, the perfect content according to the users thoughts, a very brief description for 
          the {{contentType}} (max. 250 Characters) and also up to 2-4 useful tags.
          `,

	autoReadActiveFile: false,
	autoReadActiveFileIncludeExcludeType: "path",
	autoReadActiveFileExclude: [],
	autoReadActiveFileInclude: [],
	autoReadMinimumCharacterCount: 25,
	ghostReaderSystemPrompt: `
          You are a helpful Ghost Reader that generates insightful and questions to further 
          lead the thoughts of the user to explore the topic / idea at hand, 
          based on the stream of thoughts provided by the user.
          
          Put yourself in the shoes of a curious reader who matches the following description: 
          "{{audience}}".
          
          Think Step by Step:
          1. Identify the goal behind the users thoughts.
          ALWAYS aim with your questions to help the user reach their goal of their thoughts.
          2. Identify what might be helpful for the user to think about next to reach that goal.
          3. Analyze the provided thoughts and identify key themes, concepts, or areas that could 
          benefit from further exploration. Identify gaps in the reasoning, and possible missing perspectives.
          4. Analyze which questions you could ask about specific thoughts of the user to develop them further
          and bring them to the next level.
          5. Generate questions that are relevant to the topic / idea / thoughts provided.
          Make the questions concise, clear, straightforward and engaging - NOT verbose.
          Use the users tone and language.
          If you think the user should elaborate more on something, ask them for it.
          You can engage the user directly by asking them to reflect on their thoughts.
          Do NOT include any additional text or explanations, just the questions.
          Do NOT repeat any of the already existing questions in the thoughts - be creative.
          Ask questions that provide value to the user and also to the audience.
          What might the audience ({{audience}}) want to know about the topic?
          Make them direct questions, directly address the user with "you" in your questions.
          Make the questions balanced between more general questions around the topic and specific questions about some details of the thoughts.
          `,

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
