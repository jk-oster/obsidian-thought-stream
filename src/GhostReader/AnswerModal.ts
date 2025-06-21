import {App, ButtonComponent, Modal, PopoverSuggest, Scope, Setting, SuggestModal, TFile} from "obsidian";
import WhisperBuddy from "../../main";
import {Creativity, CreativityOptions, GhostWriterPreset} from "../GhostWriter/GhostWriter";

export class AnswerModal extends Modal  {
	private plugin: WhisperBuddy;
	private answer: string = '';
	private question: string = '';
	private readonly questionEl: HTMLElement | null = null;

	constructor(plugin: WhisperBuddy) {
		super(plugin.app);
		this.plugin = plugin;
		this.containerEl.addClass("answer-modal", "whisper-buddy-modal");

		this.questionEl = this.contentEl.createEl("h3", { text: this.question });

		// Add SuggestionSelect for selecting a preset
		const answer = new Setting(this.contentEl)
			.addTextArea(text => text
				.setPlaceholder('Add thought')
				.setValue(this.answer ?? '')
				.onChange(async (value) => {
					this.answer = value;
				}));

		const createButton = new ButtonComponent(this.contentEl)
			.setCta()
			.setIcon('pencil')
			.setButtonText("Save Answer")
			.onClick(async () => {
				this.plugin.ghostReader.appendToActiveFile(`## ${this.question}\n${this.answer}`);
				this.plugin.ghostReader.deleteQuestion(this.question);
				this.close();
			});
	}

	public setQuestion(question: string): void {
		this.question = question;
		if (this.questionEl) {
			this.questionEl.setText(this.question);
		}
	}

	onClose() {
		super.onClose();
		this.answer = '';
	}

	onOpen() {
		super.onOpen();
		if (this.questionEl) {
			this.questionEl.setText(this.question);
		}
	}

	public openWithQuestion(question: string): void {
		this.setQuestion(question);
		this.open();
	}
}
