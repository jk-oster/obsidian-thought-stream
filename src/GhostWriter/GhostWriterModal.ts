import {ButtonComponent, Modal, Notice, Setting} from "obsidian";
import ThoughtStream from "../../main";
import {Creativity, CreativityOptions, GhostWriterPreset} from "./GhostWriter";
import {FileSuggest, FileSuggestMode} from "../Settings/Suggest/FileSuggest";

export class GhostWriterModal extends Modal  {
	private readonly plugin: ThoughtStream;
	private config: Partial<GhostWriterPreset>;
	private configContainer: HTMLElement;
	private preset: Setting;
	private contentType: Setting;
	private audience: Setting;
	private creativity: Setting;
	private additionalInstructions: Setting;
	private example: Setting;

	constructor(plugin: ThoughtStream, config: Partial<GhostWriterPreset> = {}) {
		super(plugin.app);
		this.plugin = plugin;
		this.config = config;

		this.containerEl.addClass("create-content-modal", "thought-stream-modal");

		this.contentEl.createEl("h2", { text: "Ghost Writer" });
		this.configContainer = this.contentEl.createEl('div', {cls: 'preset-config-container'});
		this.createSettings(this.configContainer);


		const createButton = new ButtonComponent(this.contentEl)
			.setCta()
			.setIcon('pencil')
			.setButtonText("Generate Content")
			.onClick(async () => {
				await this.plugin.ghostWriter.generateForActiveFile(this.config);
				this.close();
			});
	}

	createSettings(configContainer: HTMLElement) {
		this.preset = new Setting(configContainer)
			.setName('Select Content Preset')
			// .setDesc('Select a preset for content generation')
			.addSearch((cb) => {
				new FileSuggest(cb.inputEl, this.plugin, FileSuggestMode.PresetFiles);
				cb.setPlaceholder("Example: folder/preset-name.md")
					.setValue(this.plugin.settings.lastUsedPreset)
					.onChange(async (new_file) => {
						// Trim file and Strip ending slash if there
						new_file = new_file.trim()
						new_file = new_file.replace(/\/$/, "");

						this.plugin.settings.lastUsedPreset = new_file;
						await this.plugin.settingsManager.saveSettings(
							this.plugin.settings
						);

						await this.updateConfig(new_file);
					});
				// @ts-ignore
				cb.containerEl.addClass("settings-search");
			})

		this.contentType = new Setting(configContainer)
			.setName('Content Type (e.g. newsletter, blog post)')
			.setDesc('Please be as specific as possible, and only mention the type of content you want to generate. For instance if your newsletter is called "The Weekly Digest", you should just write "newsletter" here.')
			.addText((component) => {
				component.setValue(this.config.contentType ?? '')
					.onChange(async (value) => {
						this.config.contentType = value;
					});
			});

		// Add SuggestionSelect for selecting a preset
		this.audience = new Setting(configContainer)
			.setName('Reader Profile')
			// .setDesc('Describe your target audience')
			.addTextArea(text => text
				.setPlaceholder('Describe what your reader is like, what they do for work, their hobbies and interests, aspirations, ...')
				.setValue(this.config.audience ?? '')
				.onChange(async (value) => {
					this.config.audience = value;
				}));

		this.creativity = new Setting(configContainer)
			.setName('Creativity Level')
			.setDesc(CreativityOptions[this.config.creativity ?? 'balanced' as Creativity])
			.addDropdown((dropdown) => {
				Object.entries(CreativityOptions).forEach(([key, value]) => {
					dropdown.addOption(key, key);
				});
				dropdown.setValue(this.config.creativity ?? 'balanced')
					.onChange(async (value) => {
						this.creativity.setDesc(CreativityOptions[value as Creativity]);
						this.config.creativity = value as Creativity;
					});
			});

		this.additionalInstructions = new Setting(configContainer)
			.setName('What else should we keep in mind?')
			// .setDesc('Provide any additional instructions for the content generation')
			.addTextArea(text => text
				.setPlaceholder('e.g. Bullet points only, one sentence per bullet point')
				.setValue(this.config.information ?? '')
				.onChange(async (value) => {
					this.config.information = value;
				}));

		this.example = new Setting(configContainer)
			.setName('Sample Content')
			.addTextArea(text => text
				.setPlaceholder('Provide an example of the content you want to generate. This will be used as a reference for the tone and style.')
				.setValue(this.config.example ?? '')
				.onChange(async (value) => {
					this.config.example = value;
				}));
	}

	async updateConfig(filePath: string) {
		const presetConfig = await this.plugin.ghostWriter.getConfigFromPreset(filePath);

		if (presetConfig && presetConfig.contentType) {
			this.config.contentType = presetConfig.contentType ?? this.config.contentType;
			this.config.audience = presetConfig.audience ?? this.config.audience;
			this.config.creativity = presetConfig.creativity ?? this.config.creativity;
			this.config.information = presetConfig.information ?? this.config.information;
			this.config.example = presetConfig.example ?? this.config.example;

			this.configContainer.empty();
			this.createSettings(this.configContainer);
		} else {
			new Notice(`Preset file ${filePath} does not contain valid front matter.`);
		}
	}

	async onOpen() {
		super.onOpen();
		if (this.plugin.settings.lastUsedPreset) {
			await this.updateConfig(this.plugin.settings.lastUsedPreset);
		}
	}

	async onClose() {
		super.onClose();
		this.config = {};
	}
}
