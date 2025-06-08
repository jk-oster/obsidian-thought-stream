import {App, ButtonComponent, Modal, PopoverSuggest, Scope, Setting, SuggestModal, TFile} from "obsidian";
import ThoughtStream from "../main";
import {Creativity, CreativityOptions, GhostWriterPreset} from "./GhostWriter";

export class GhostWriterModal extends Modal  {
	private plugin: ThoughtStream;

	constructor(plugin: ThoughtStream, config: Partial<GhostWriterPreset> = {}) {
		super(plugin.app);
		this.plugin = plugin;
		this.containerEl.addClass("create-content-modal", "thought-stream-modal");

		this.contentEl.createEl("h2", { text: "Ghost Writer" });
		const configContainer = this.contentEl.createEl('div', {cls: 'preset-config-container'});

		const contentType = new Setting(configContainer)
			.setName('Content Type')
			.setDesc('Select the type of content to generate')
			.addDropdown((dropdown) => {
				dropdown.addOption('article', 'Article');
				dropdown.addOption('newsletter', 'Newsletter');
				dropdown.addOption('blog-post', 'Blog Post');
				dropdown.addOption('personal journal', 'Personal Journal');
				dropdown.addOption('social-media', 'Social Media Post');
				dropdown.addOption('email', 'Email');
				dropdown.addOption('todo-list', 'Todo List');
				dropdown.addOption('report', 'Report');
				dropdown.setValue(config.contentType ?? 'personal journal')
					.onChange(async (value) => {
						config.contentType = value;
					});
			});

		// Add SuggestionSelect for selecting a preset
		const audience = new Setting(configContainer)
			.setName('Audience')
			.setDesc('Describe your target audience')
			.addTextArea(text => text
				.setPlaceholder('Describe your audience')
				.setValue(config.audience ?? '')
				.onChange(async (value) => {
					config.audience = value;
				}));

		const creativity = new Setting(configContainer)
			.setName('Creativity Level')
			.setDesc('Select the level of creativity for the content')
			.addDropdown((dropdown) => {
				Object.entries(CreativityOptions).forEach(([key, value]) => {
					dropdown.addOption(key, `(${key}) ${value}`);
				});
				dropdown.setValue(config.creativity ?? 'balanced')
					.onChange(async (value) => {
						config.creativity = value as Creativity;
					});
			});

		const additionalInstructions = new Setting(configContainer)
			.setName('Additional Instructions')
			.setDesc('Provide any additional instructions for the content generation')
			.addTextArea(text => text
				.setPlaceholder('Enter additional instructions')
				.setValue(config.information ?? '')
				.onChange(async (value) => {
					config.information = value;
				}));

		const createButton = new ButtonComponent(this.contentEl)
			.setCta()
			.setIcon('pencil')
			.setButtonText("Generate Content")
			.onClick(async () => {
				await this.plugin.ghostWriter.generateForActiveFile(config);
				this.close();
			});
	}
}
