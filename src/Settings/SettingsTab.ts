import ThoughtStream from "main";
import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import { SettingsManager } from "./SettingsManager";
import {Notifiable} from "../Observable";
import {openURL} from "../utils";
import {FolderSuggest} from "./Suggest/FolderSuggest";

export class SettingsTab extends PluginSettingTab {
	private plugin: ThoughtStream;
	private settingsManager: SettingsManager;
	private createNewFileInput: Setting;
	private saveAudioFileInput: Setting;

	constructor(app: App, plugin: ThoughtStream) {
		super(app, plugin);
		this.plugin = plugin;
		this.settingsManager = plugin.settingsManager;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.createHeader('Thought Stream Settings', 'h1');
		this.createQuickAccess();

		this.createHeader('Ghost Whisper');
		this.createApiKeySetting();
		this.createApiUrlSetting();
		this.createModelSetting();
		this.createTranscriptionPromptSetting();
		this.createLanguageSetting();
		this.createSaveAudioFileToggleSetting();
		this.createSaveAudioFilePathSetting();
		this.createNewFileToggleSetting();
		this.createNewFilePathSetting();
		this.copyRecordingToClipboardToggleSetting();

		this.createHeader('Ghost Writer');
		this.createCompletionApiKeySetting();
		this.createCompletionApiUrlSetting();
		this.createCompletionModelSetting();
		this.saveDraftsFilePathSetting();
		this.ghostWriterSystemPromptSetting();

		this.createHeader('Ghost Reader');
		this.autoReadActiveFileToggleSetting();
		this.createAutoReadActiveFileIncludeSetting();
		this.createAutoReadActiveFileExcludeSetting();
		this.createMinimumCharacterCountSetting();
		this.ghostReaderSystemPromptSetting();

		this.createHeader('Development');
		this.createDebugModeToggleSetting();
	}

	private getUniqueFolders(): TFolder[] {
		const files = this.app.vault.getMarkdownFiles();
		const folderSet = new Set<TFolder>();

		for (const file of files) {
			const parentFolder = file.parent;
			if (parentFolder && parentFolder instanceof TFolder) {
				folderSet.add(parentFolder);
			}
		}

		return Array.from(folderSet);
	}

	private createHeader(text: string, tag: keyof HTMLElementTagNameMap = 'h2'): void {
		this.containerEl.createEl(tag, { text });
	}

	private createQuickAccess() {
		new Setting(this.containerEl)
			.setName('Quick access')
			.addButton(cb => {
				cb.setCta();
				cb.setButtonText('Docs');
				cb.onClick(() => {
					openURL('https://jk-oster.github.io/obsidian-thought-stream/');
				});
			})
			.addButton(cb => {
				cb.setButtonText('Open FAQ');
				cb.onClick(() => {
					openURL('https://jk-oster.github.io/obsidian-thought-stream/faq.html');
				});
			})
			.addButton(cb => {
				cb.setButtonText('Report issue');
				cb.onClick(() => {
					openURL('https://github.com/jk-oster/obsidian-thought-stream/issues');
				});
			})
			.addButton(cb => {
				cb.setButtonText('Open Ghost-Reader');
				cb.setTooltip('Open Ghost-Reader View');
				cb.setIcon('ghost');
				cb.onClick(() => {
					this.plugin.activateControlsView();
				});
			});
	}

	private createTextSetting(
		name: string,
		desc: string,
		placeholder: string,
		value: string,
		onChange: (value: string) => Promise<void>
	): void {
		new Setting(this.containerEl)
			.setName(name)
			.setDesc(desc)
			.addText((text) =>
				text
					.setPlaceholder(placeholder)
					.setValue(value)
					.onChange(async (value) => await onChange(value))
			);
	}

	private createApiKeySetting(): void {
		this.createTextSetting(
			"API Key",
			"Enter your OpenAI API key",
			"sk-...xxxx",
			this.plugin.settings.transcriptionApiKey,
			async (value) => {
				this.plugin.settings.transcriptionApiKey = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private createApiUrlSetting(): void {
		this.createTextSetting(
			"API URL",
			"Specify the endpoint that will be used to make requests to",
			"https://api.your-custom-url.com",
			this.plugin.settings.transcriptionApiUrl,
			async (value) => {
				this.plugin.settings.transcriptionApiUrl = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private createModelSetting(): void {
		this.createTextSetting(
			"Model",
			"Specify the machine learning model to use for generating text",
			"whisper-1",
			this.plugin.settings.transcriptionModel,
			async (value) => {
				this.plugin.settings.transcriptionModel = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private createTranscriptionPromptSetting(): void {
		// this.createTextSetting(
		// 	"Prompt",
		// 	"Optional: Add words with their correct spellings to help with transcription. Make sure it matches the chosen language.",
		// 	"Example: ZyntriQix, Digique Plus, CynapseFive",
		// 	this.plugin.settings.transcriptionPrompt,
		// 	async (value) => {
		// 		this.plugin.settings.transcriptionPrompt = value;
		// 		await this.settingsManager.saveSettings(this.plugin.settings);
		// 	}
		// );

		new Setting(this.containerEl)
			.setClass('setting-item-textarea-full-width')
			.setName("Transcription Prompt")
			.setDesc(
				"Optional: Add words with their correct spellings to help with transcription. Make sure it matches the chosen language."
			)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example: ZyntriQix, Digique Plus, CynapseFive")
					.setValue(this.plugin.settings.transcriptionPrompt)
					.onChange(async (value) => {
						this.plugin.settings.transcriptionPrompt = value;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private createLanguageSetting(): void {
		this.createTextSetting(
			"Language",
			"Specify the language of the message being whispered",
			"en",
			this.plugin.settings.language,
			async (value) => {
				this.plugin.settings.language = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private createSaveAudioFileToggleSetting(): void {
		new Setting(this.containerEl)
			.setName("Save recording")
			.setDesc(
				"Turn on to save the audio file after sending it to the Whisper API"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.saveAudioFile)
					.onChange(async (value) => {
						this.plugin.settings.saveAudioFile = value;
						if (!value) {
							this.plugin.settings.saveAudioFilePath = "";
						}
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
						this.saveAudioFileInput.setDisabled(!value);
					})
			);
	}

	private createSaveAudioFilePathSetting(): void {
		this.saveAudioFileInput = new Setting(this.containerEl)
			.setName("Recordings folder")
			.setDesc(
				"Specify the path in the vault where to save the audio files"
			)
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder/audio")
					.setValue(this.plugin.settings.saveAudioFilePath)
					.onChange(async (new_folder) => {
						// Trim folder and Strip ending slash if there
						new_folder = new_folder.trim()
						new_folder = new_folder.replace(/\/$/, "");

						this.plugin.settings.saveAudioFilePath = new_folder;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
				// @ts-ignore
				cb.containerEl.addClass("settings-search");
			})
			.setDisabled(!this.plugin.settings.saveAudioFile);
	}

	private createNewFileToggleSetting(): void {
		new Setting(this.containerEl)
			.setName("Save transcription")
			.setDesc(
				"Turn on to create a new file for each recording, or leave off to add transcriptions at your cursor and "
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.createNewFileAfterRecording)
					.onChange(async (value) => {
						this.plugin.settings.createNewFileAfterRecording =
							value;
						if (!value) {
							this.plugin.settings.createNewFileAfterRecordingPath =
								"";
						}
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
						this.createNewFileInput.setDisabled(!value);
					});
			});
	}

	private copyRecordingToClipboardToggleSetting(): void {
		new Setting(this.containerEl)
			.setName("Copy recording to clipboard")
			.setDesc(
				"Turn on to copy the transcription to the clipboard after saving it."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.saveRecordingToClipboard)
					.onChange(async (value) => {
						this.plugin.settings.saveRecordingToClipboard = value;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private createNewFilePathSetting(): void {
		this.createNewFileInput = new Setting(this.containerEl)
			.setName("Transcriptions folder")
			.setDesc(
				"Specify the path in the vault where to save the transcription files"
			)
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder/note")
					.setValue(this.plugin.settings.createNewFileAfterRecordingPath)
					.onChange(async (new_folder) => {
						// Trim folder and Strip ending slash if there
						new_folder = new_folder.trim()
						new_folder = new_folder.replace(/\/$/, "");

						this.plugin.settings.createNewFileAfterRecordingPath = new_folder;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
				// @ts-ignore
				cb.containerEl.addClass("settings-search");
			})
			.setDisabled(!this.plugin.settings.createNewFileAfterRecording);
	}


	private saveDraftsFilePathSetting(): void {
		new Setting(this.containerEl)
			.setName("Drafts folder for Content Generation")
			.setDesc(
				"Specify the path in the vault where to save the drafts files"
			)
			.addSearch((cb) => {
				new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder/drafts")
					.setValue(this.plugin.settings.saveDraftsFilePath)
					.onChange(async (new_folder) => {
						// Trim folder and Strip ending slash if there
						new_folder = new_folder.trim()
						new_folder = new_folder.replace(/\/$/, "");

						this.plugin.settings.saveDraftsFilePath = new_folder;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
				// @ts-ignore
				cb.containerEl.addClass("settings-search");
			});
	}

	private createCompletionApiKeySetting(): void {
		this.createTextSetting(
			"API Key",
			"Enter your OpenAI API key for content generation",
			"sk-...xxxx",
			this.plugin.settings.completionApiKey || this.plugin.settings.transcriptionApiKey,
			async (value) => {
				this.plugin.settings.completionApiKey = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private createCompletionApiUrlSetting(): void {
		this.createTextSetting(
			"API URL",
			"Specify the endpoint that will be used to make requests to for content generation",
			"https://api.your-custom-url.com",
			this.plugin.settings.completionApiUrl,
			async (value) => {
				this.plugin.settings.completionApiUrl = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private createCompletionModelSetting(): void {
		this.createTextSetting(
			"Model",
			"Specify the machine learning model to use for content generation",
			"gpt-4o-mini",
			this.plugin.settings.completionModel,
			async (value) => {
				this.plugin.settings.completionModel = value;
				await this.settingsManager.saveSettings(this.plugin.settings);
			}
		);
	}

	private ghostWriterSystemPromptSetting(): void {
		new Setting(this.containerEl)
			.setClass('setting-item-textarea-full-width')
			.setName("Ghost Writer System Prompt")
			.setDesc(
				"Customize the system prompt for the Ghost Writer. Use {{<frontmatter-property-name>}} to insert file meta data. Addidionally, you can use {{contentType}}, {{audience}}, {{creativity}}, and {{creativityDescription}} to insert the content type, target audience, and creativity level respectively."
			)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example: You are a professional Ghost Writer...")
					.setValue(this.plugin.settings.ghostWriterSystemPrompt)
					.onChange(async (value) => {
						this.plugin.settings.ghostWriterSystemPrompt = value;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private createAutoReadActiveFileExcludeSetting(): void {
		new Setting(this.containerEl)
			.setName("Exclude folders from auto-read")
			.setDesc(
				"Specify folders to exclude from auto-reading. Separate multiple folders with commas."
			)
			.addText((text) => {
				text
					.setPlaceholder("Example: folder1, folder2")
					.setValue(this.plugin.settings.autoReadActiveFileExclude.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.autoReadActiveFileExclude = value
							.split(",")
							.map((folder) => folder.trim());
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private createAutoReadActiveFileIncludeSetting(): void {
		new Setting(this.containerEl)
			.setName("Include folders for auto-read")
			.setDesc(
				"Specify folders to include for auto-reading. Separate multiple folders with commas."
			)
			.addText((text) => {
				text
					.setPlaceholder("Example: folder1, folder2")
					.setValue(this.plugin.settings.autoReadActiveFileInclude.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.autoReadActiveFileInclude = value
							.split(",")
							.map((folder) => folder.trim());
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private autoReadActiveFileToggleSetting(): void {
		new Setting(this.containerEl)
			.setName("Auto-read active file")
			.setDesc(
				"Turn on to automatically read the content of the active file and create questions for it."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoReadActiveFile)
					.onChange(async (value) => {
						this.plugin.settings.autoReadActiveFile = value;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private createMinimumCharacterCountSetting(): void {
		new Setting(this.containerEl)
			.setName("Minimum character count")
			.setDesc(
				"Set the minimum number of characters in the active file to trigger auto-reading."
			)
			.addText((text) => {
				text
					.setPlaceholder("Example: 100")
					.setValue(
						this.plugin.settings.autoReadMinimumCharacterCount.toString()
					)
					.onChange(async (value) => {
						const count = parseInt(value, 10);
						if (!isNaN(count)) {
							this.plugin.settings.autoReadMinimumCharacterCount = count;
							await this.settingsManager.saveSettings(
								this.plugin.settings
							);
						}
					});
			});
	}

	private ghostReaderSystemPromptSetting(): void {
		new Setting(this.containerEl)
			.setClass('setting-item-textarea-full-width')
			.setName("Ghost Reader System Prompt")
			.setDesc(
				"Customize the system prompt for the Ghost Reader. Use {{<frontmatter-property-name>}} to insert file meta data."
			)
			.addTextArea((text) => {
				text
					.setPlaceholder("Example: You are a helpful Ghost Reader...")
					.setValue(this.plugin.settings.ghostReaderSystemPrompt)
					.onChange(async (value) => {
						this.plugin.settings.ghostReaderSystemPrompt = value;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}

	private createDebugModeToggleSetting(): void {
		new Setting(this.containerEl)
			.setName("Debug Mode")
			.setDesc(
				"Turn on to increase the plugin's verbosity for troubleshooting."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.debugMode)
					.onChange(async (value) => {
						this.plugin.settings.debugMode = value;
						await this.settingsManager.saveSettings(
							this.plugin.settings
						);
					});
			});
	}
}
