import ThoughtStream from "../../main";
import {Observable} from "../Observable";
import OpenAI from "openai";
import {zodResponseFormat, zodTextFormat} from "openai/helpers/zod";
import {z} from "zod";
import {MarkdownView, Notice, TFile} from "obsidian";
import {cleanFileName, getActiveFile, updateFrontMatterByFile} from "../utils";

export type GhostWriterState = 'loading' | 'idle' | 'error';

export type GhostWriterPreset = {
	audience: string,
	example?: string,
	information?: string,
	contentType: string,
	creativity: Creativity,
	wordCount?: number,
};

const defaultConfig: GhostWriterPreset = {
	audience: "general",
	contentType: "text",
	creativity: 'balanced',
}

export type Creativity = 'precise' | 'minimal' | 'balanced' | 'enhanced' | 'imaginative';

export const CreativityOptions: Record<Creativity, string> = {
	precise: 'Strictly adherence to exact words and expressions for a precise and straightforward draft.',
	minimal: 'Slightly enhance words and expression with minimal adjustments for a clean and clear draft.',
	balanced: 'Blend users words with moderate enhancements to produce a balanced and engaging draft.',
	enhanced: 'Incorporate noticeable creativity, add flair and variation while maintaining the users core message.',
	imaginative: 'Infuse the draft with imaginative variations and unique stylistic elements for a highly creative output.',
}

const getTemperatureBasedOnCreativity = (creativity: Creativity): number => {
	switch (creativity) {
		case 'precise':
			return 0.3;
		case 'minimal':
			return 0.5;
		case 'balanced':
			return 0.7;
		case 'enhanced':
			return 0.9;
		case 'imaginative':
			return 1.0;
		default:
			return 0.7; // Default to balanced if unknown
	}
}

const DocumentObject = z.object({
	title: z.string(),
	description: z.string(),
	content: z.string(),
	tags: z.array(z.string()),
});

type Doc = z.infer<typeof DocumentObject> & {
	srcFile?: TFile; // Optional source File from the document
};

export class GhostWriter {
	private plugin: ThoughtStream;

	private $state = new Observable<GhostWriterState>('idle');
	private $error = new Observable<string | null>(null);
	private $documentResult = new Observable<Doc|null>(null);

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
	}

	async generateForActiveFile(config: Partial<GhostWriterPreset> = defaultConfig): Promise<void> {

		const file = getActiveFile(this.plugin.app);
		if (!file) {
			new Notice("No active file found to generate document for.");
			return;
		}

		if (this.plugin.settings.debugMode) {
			new Notice(`Generating document for file: ${file.path}`);
		}

		const document = await this.getDocument(file, config);
		if (document) {
			await this.writeDocument(document, config);
			new Notice(`Document generated and written to: ${file.path}`);
		} else {
			new Notice("Failed to generate document.");
		}
	}

	async getDocument(src: string|TFile, config: Partial<GhostWriterPreset> = defaultConfig): Promise<Doc> {
		this.$state.set('loading')

		let thoughtsContent = '';
		if (src instanceof TFile) {
			thoughtsContent = await this.plugin.app.vault.cachedRead(src);
		} else {
			thoughtsContent = src;
		}

		const client = this.plugin.aiClient.client;
		const response = await client.chat.completions.create({
			model: this.plugin.settings.completionModel || "gpt-4o-mini",
			temperature: getTemperatureBasedOnCreativity(config.creativity || 'balanced'),
			response_format: zodResponseFormat(DocumentObject, 'content-draft'),
			messages: [
				{
					role: 'system',
					content: `
          You are a professional Ghost Writer that writes the content draft for a ${config.contentType || 'text'}.
          You are tasked to write a ${config.contentType || 'text'} based on the thoughts and ideas provided by the user.
          These thoughts are a stream of consciousness that the user has provided - so they may not be well-structured or coherent.
          Make fine tune the ${config.contentType || 'text'} for the target audience with the following description: "${config.audience || 'general audience'}".
          Make sure to write a ${config.contentType || 'text'} that is and well-structured, coherent, 
          follows a logical narrative thread and is first and foremost based on the inputs given by the user 
          (don't add things unless asked for by the creativity level!).
          Your goal is to create a ${config.contentType || 'text'} that incorporates the users thoughts.
          Use the following creativity level: "${config.creativity || 'balanced'}" - ${CreativityOptions[config.creativity || 'balanced']}.
          Generate a sensible title, the content, and a very brief description for the ${config.contentType || 'text'} (max. 250 Characters) and also up to 2-4 useful tags.
          `,
				},
				{
					role: 'user',
					content: `Create a draft for a ${config.contentType || 'text'} based on the following ideas:\n\n${thoughtsContent}
					${config.information ? `
					---
					Make sure to consider this following information:\n${config.information || ''}\n
					` : ''}
					${config.example ? `
					---
					You can also use the following example as a reference 
					(consider the style and tone of writing, not so much the content!), 
					imitate the style of this example as closely as possible:\n${config.example || ''}
					` : ''}
					${config.wordCount ? `
					---
					Please try to keep the ${config.contentType || 'text'} to around ${config.wordCount} words.
					` : ''}
					}
					`,
				},
			]
		}).catch((reason: any) => {
			this.$error.value = `Error generating questions: ${reason.message}`;
		});

		this.$state.set('idle')

		// @ts-ignore
		const fetchedDocument = DocumentObject.parse(JSON.parse(response?.choices[0].message.content)) as Doc;

		if (src instanceof TFile) {
			fetchedDocument.srcFile = src;
		}

		this.$documentResult.value = fetchedDocument;
		console.log(fetchedDocument);
		return fetchedDocument;
	}

	async writeDocument(document: Doc, config: Partial<GhostWriterPreset> = defaultConfig): Promise<void> {

		const fileName = cleanFileName(document.title);
		let noteFilePath = `${this.plugin.settings.createNewFileAfterRecordingPath}/${fileName}.md`;

		// check if the file already exists
		const existingFile = this.plugin.app.vault.getAbstractFileByPath(noteFilePath);
		if (existingFile) {
			// If the file already exists, append a timestamp to the filename
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			noteFilePath = `${this.plugin.settings.createNewFileAfterRecordingPath}/${fileName}-${timestamp}.md`;
			if (this.plugin.settings.debugMode) {
				new Notice(`File already exists: ${document.title}`);
			}
		}

		if (this.plugin.settings.debugMode) {
			new Notice(`Writing document: ${document.title}`);
		}

		const frontmatter = {
			"title": document.title,
			"description": document.description || "",
			"tags": document.tags || [],
			"audience": config.audience || "general",
			"contentType": config.contentType || "text",
			"creativity": config.creativity || "balanced",
			"information": config.information || "",
			"src": document.srcFile ? `[[${document.srcFile.basename}]]` : undefined,
			"preset" : '',
		};

		try {
			const file = await this.plugin.app.vault.create(
				noteFilePath,
				document.content,
			);
			await this.plugin.app.workspace.openLinkText(
				noteFilePath,
				"",
				true
			);
			await updateFrontMatterByFile(this.plugin.app, file, frontmatter);
		} catch (err) {
			console.error("Error writing content file:", err);
			new Notice("Error writing content file: " + err.message);
		}
	}

	async writeContentPreset(config: Partial<GhostWriterPreset> = defaultConfig): Promise<void> {
		// write the content preset to a new file in the configured path
		const fileName = cleanFileName(`Content Preset - ${config.audience || 'general'} - ${config.contentType || 'text'}`);
		let noteFilePath = `${this.plugin.settings.createNewFileAfterRecordingPath}/${fileName}.md`;
		// check if the file already exists
		const existingFile = this.plugin.app.vault.getAbstractFileByPath(noteFilePath);
		if (existingFile) {
			// If the file already exists, append a timestamp to the filename
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			noteFilePath = `${this.plugin.settings.createNewFileAfterRecordingPath}/${fileName}-${timestamp}.md`;
		}

		if (this.plugin.settings.debugMode) {
			new Notice(`Writing preset: ${fileName}`);
		}

		const frontmatter = {
			"contentType": config.contentType,
			"audience": config.audience || "",
			"information": config.information || "",
			"creativity": config.creativity || "balanced",
		};

		try {
			const file = await this.plugin.app.vault.create(
				noteFilePath,
				config.example ?? '',
			);
			await this.plugin.app.workspace.openLinkText(
				noteFilePath,
				"",
				true
			);
			await updateFrontMatterByFile(this.plugin.app, file, frontmatter);
		} catch (err) {
			console.error("Error writing content file:", err);
			new Notice("Error writing content file: " + err.message);
		}
	}

	async getConfigFromPreset(filePath: string): Promise<Partial<GhostWriterPreset>> {
		const file = this.plugin.app.vault.getAbstractFileByPath(filePath);
		if (!file || !(file instanceof TFile)) {
			new Notice(`Preset file not found: ${filePath}`);
			return {};
		}

		const content = await this.plugin.app.vault.cachedRead(file);
		const frontmatter = this.plugin.app.metadataCache.getFileCache(file)?.frontmatter;

		if (!frontmatter) {
			new Notice(`No frontmatter found in preset file: ${filePath}`);
			return {};
		}

		return {
			audience: frontmatter.audience || "general",
			contentType: frontmatter.contentType || "text",
			information: frontmatter.information || "",
			example: content.replace(/^---\n[\s\S]*?\n---\n/, '').trim(),
			creativity: frontmatter.creativity || 'balanced',
		};
	}
}
