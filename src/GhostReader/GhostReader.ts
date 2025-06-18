import ThoughtStream from "../../main";
import {Observable} from "../Observable";
import {zodResponseFormat} from "openai/helpers/zod";
import {z} from "zod";
import {getActiveFile, getFrontMatterByFile, parsePromptTemplate} from "../utils";
import {MarkdownView, Notice, TFile} from "obsidian";

export type GhostReaderState = 'loading' | 'idle' | 'error';

export type GhostReaderConfig = {
	maxQuestions: number,
	model: string,
	temperature: number,
	audience?: string,
};

const defaultConfig: GhostReaderConfig = {
	maxQuestions: 10,
	model: "gpt-4o-mini",
	temperature: 0.7,
}

const QuestionsObject = z.object({
	questions: z.array(z.string()),
})

export class GhostReader {
	private readonly plugin: ThoughtStream;

	public readonly $state = new Observable<GhostReaderState>('idle');
	public readonly $error = new Observable<string | null>(null);
	public readonly $questions = new Observable<string[]>([]);
	private readonly $headings = new Observable<string[]>([]);

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
	}

	private async removeQuestionFromFrontmatter(question: string): Promise<void> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to remove question from frontmatter.");
			return;
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		if (frontmatter && frontmatter['ghostreader-questions']) {
			const questions: string[] = frontmatter['ghostreader-questions'];
			const index = questions.indexOf(question);
			if (index > -1) {
				questions.splice(index, 1);
				await this.plugin.app.fileManager.processFrontMatter(activeFile, (fm) => {
					fm['ghostreader-questions'] = questions;
					return fm;
				});
				new Notice(`Removed question from frontmatter: "${question}"`);
			} else {
				new Notice(`Question not found in frontmatter: "${question}"`);
			}
		}
	}

	private async setQuestionsInFrontmatter(questions: string[]): Promise<void> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to set questions in frontmatter.");
			return;
		}

		await this.plugin.app.fileManager.processFrontMatter(activeFile, (fm) => {
			fm['ghostreader-questions'] = questions;
			return fm;
		});

		if (this.plugin.settings.debugMode) {
			console.log(`Set questions in frontmatter for file: ${activeFile.path}`, questions);
			new Notice(`Set questions in frontmatter`);
		}
	}

	private async hasQuestionInFrontmatter(question: string): Promise<boolean> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to check question in frontmatter.");
			return false;
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		if (frontmatter && frontmatter['ghostreader-questions']) {
			const questions: string[] = frontmatter['ghostreader-questions'];
			return questions.includes(question);
		}
		return false;
	}

	private async hasQuestionsInFrontmatter(): Promise<boolean> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to check question in frontmatter.");
			return false;
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		return !!(frontmatter &&
			frontmatter['ghostreader-questions'] &&
			Array.isArray(frontmatter['ghostreader-questions']) &&
			frontmatter['ghostreader-questions'].length > 0);

	}

	async getQuestionsFromFrontmatter(): Promise<string[]> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to get questions from frontmatter.");
			return [];
		}

		const frontmatter = this.plugin.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		if (frontmatter && frontmatter['ghostreader-questions']) {
			const questions: string[] = frontmatter['ghostreader-questions'];
			this.$questions.value = questions;
			if (this.plugin.settings.debugMode) {
				console.log(`Retrieved questions from frontmatter for file: ${activeFile.path}`, questions);
			}
			return questions;
		} else {
			if (this.plugin.settings.debugMode) {
				new Notice("No questions found in frontmatter.");
				console.log(`No questions found in frontmatter for file: ${activeFile.path}`);
			}
			this.$questions.value = [];
			return [];
		}
	}

	deleteQuestion(question: string): void {
		const index = this.$questions.value.indexOf(question);
		if (index > -1) {
			this.$questions.value = this.$questions.value.filter(q => q !== question);
		} else {
			new Notice(`Question not found: "${question}"`);
		}
		if (this.plugin.settings.debugMode) {
			console.log(`Current questions: ${this.$questions.value}`);
		}

		const activeFile = getActiveFile(this.plugin.app);
		if (activeFile) {
			this.removeQuestionFromFrontmatter(question);
			if (this.plugin.settings.debugMode) {
				new Notice(`Updated cache for file: ${activeFile.path}`);
			}
		} else {
			new Notice("No active file found to update cache.");
		}
	}

	async insertQuestion(question: string): Promise<void> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to insert question into.");
			return;
		}

		await this.plugin.app.vault.process(activeFile, (data) => {
			return data + `\n## ${question}\n`;
		});

		// refresh the active file to reflect changes
		const markdownView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		console.log(markdownView);
		if (markdownView instanceof MarkdownView && markdownView.editor) {
			markdownView?.editor?.refresh();
			markdownView?.editor?.focus();
		}

		this.deleteQuestion(question);
	}

	async recordAnswer(question: string): Promise<void> {
		await this.insertQuestion(question);
		this.plugin.getRecorderModal().uiUpdateHeading(question);
		this.plugin.getRecorderModal().open()
		await this.plugin.controller.startRecording();
	}

	async autoGenerateForActiveFile(config: Partial<GhostReaderConfig> = defaultConfig): Promise<void> {
		const file = getActiveFile(this.plugin.app);
		if (!file) {
			new Notice("No active file found to auto-generate questions for.");
			return;
		}
		if (await this.hasQuestionsInFrontmatter()) {
			if (this.plugin.settings.debugMode) {
				new Notice(`Using cached questions for file: ${file.path}`);
			}
			return;
		}

		if (!this.allowAutoReadFile(file)) {
			return;
		}

		if (this.plugin.settings.debugMode) {
			new Notice(`Auto-generating questions for file: ${file.path}`);
		}

		await this.getQuestions(file, config);
	}

	allowAutoReadFile(file: TFile): boolean {
		const autoReadActiveFile = this.plugin.settings.autoReadActiveFile;
		const autoReadActiveFileExclude = this.plugin.settings.autoReadActiveFileExclude;
		const autoReadActiveFileInclude = this.plugin.settings.autoReadActiveFileInclude;

		if (!autoReadActiveFile) {
			if (this.plugin.settings.debugMode) {
				new Notice("Auto-read active file is disabled in settings.");
			}
			return false;
		}

		if (file.stat.size < this.plugin.settings.autoReadMinimumCharacterCount) {
			if (this.plugin.settings.debugMode) {
				new Notice(`File is too short for auto-generation: ${file.stat.size} characters.`);
			}
			return false;
		}

		if (autoReadActiveFileExclude.length > 0 && autoReadActiveFileExclude.some(excludePath => file.path.includes(excludePath))) {
			if (this.plugin.settings.debugMode) {
				new Notice(`Skipping auto-generation for file: ${file.path} due to exclusion pattern.`);
			}
			return false;
		}
		if (autoReadActiveFileInclude.length > 0 && autoReadActiveFileInclude.some(includePath => !file.path.includes(includePath))) {
			if (this.plugin.settings.debugMode) {
				new Notice(`Skipping auto-generation for file: ${file.path} due to inclusion pattern.`);
			}
			return false;
		}

		return true;
	}

	async autoReadActiveFileOnEditorChange(config: Partial<GhostReaderConfig> = defaultConfig): Promise<void> {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to auto-read on editor change.");
			return;
		}

		if (!this.allowAutoReadFile(activeFile)) {
			return;
		}

		const content = await this.plugin.app.vault.read(activeFile);
		const headings = content.match(/^(#{1,6})\s(.+)$/gm);
		const oldHeadings = this.$headings.value;

		if (headings) {
			this.$headings.value = headings.map(h => h.replace(/^(#{1,6})\s/, '').trim());
		} else {
			this.$headings.value = [];
			if (this.plugin.settings.debugMode) {
				new Notice(`No headings found in file: ${activeFile.path}`);
			}
		}

		if (this.$headings.value.length === oldHeadings.length) {
			if (this.plugin.settings.debugMode) {
				new Notice(`No new headings found in file: ${activeFile.path} - skipping auto-generation.`);
			}
			return;
		}

		if (this.plugin.settings.debugMode) {
			new Notice(`Auto-reading active file on editor change: ${activeFile.path}`);
		}

		await this.generateForActiveFile(config);
	}

	async generateForActiveFile(config: Partial<GhostReaderConfig> = defaultConfig): Promise<void> {
		const file = getActiveFile(this.plugin.app);
		if (!file) {
			new Notice("No active file found to generate questions for.");
			return;
		}

		if (this.plugin.settings.debugMode) {
			new Notice(`Generating questions for file: ${file.path}`);
		}

		await this.getQuestions(file);
	}

	async getQuestions(src: string|TFile, config: Partial<GhostReaderConfig> = defaultConfig): Promise<string[]> {
		this.$state.set('loading')
		this.$error.set(null);
		let data: Record<string, any> = config;

		let thoughtsContent = '';
		if (src instanceof TFile) {
			thoughtsContent = await this.plugin.app.vault.read(src);
			const frontmatter = await getFrontMatterByFile(this.plugin.app, src);
			data = {
				...frontmatter,
				...config,
			};
		} else {
			thoughtsContent = src;
		}

		const client = this.plugin.aiClient.client;
		const response = await client.chat.completions.create({
			model: config.model || "gpt-4o-mini",
			temperature: config.temperature || 1,
			response_format:  zodResponseFormat(QuestionsObject, 'questions'),
			messages: [
				{
					role: 'system',
					content: parsePromptTemplate(this.plugin.settings.ghostReaderSystemPrompt, data),
				},
				{
					role: 'user',
					content: `Generate up to ${config.maxQuestions || 3} questions based on the following thoughts:\n\n${thoughtsContent}`,
				},
			]
		}).catch(reason => {
			this.$error.value = `Error generating questions: ${reason.message}`;
		});

		this.$state.set('idle')

		// @ts-ignore
		const fetchedQuestions = QuestionsObject.parse(JSON.parse(response.choices[0].message.content)).questions;
		this.$questions.value = fetchedQuestions;
		if (src instanceof TFile) {
			await this.setQuestionsInFrontmatter(fetchedQuestions);
			if (this.plugin.settings.debugMode) {
				new Notice(`Set questions in frontmatter for file: ${src.path}`);
			}
		}
		console.log(fetchedQuestions);
		return fetchedQuestions;
	}

	public appendToActiveFile(text: string): void {
		const activeFile = getActiveFile(this.plugin.app);
		if (!activeFile) {
			new Notice("No active file found to append text to.");
			return;
		}

		this.plugin.app.vault.append(activeFile, `\n\n${text}`);
		if (this.plugin.settings.debugMode) {
			new Notice(`Appended text to active file: ${activeFile.path}`);
		}

		const markdownView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView instanceof MarkdownView && markdownView.editor) {
			markdownView?.editor?.refresh();
			markdownView?.editor?.focus();
		}
	}
}
