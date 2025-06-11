import axios from "axios";
import ThoughtStream from "main";
import { Notice, MarkdownView } from "obsidian";
import { getBaseFileName } from "../utils";
import {Observable} from "../Observable";
import {TranscriptionResult} from "./GhostWhisper";


export class TranscriptionHandler {
	private plugin: ThoughtStream;

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;

		this.plugin.audioHandler.$transcription.subscribe(async (result: TranscriptionResult) => {
			if (result.text) {
				await this.handleTranscription(result.text, result.fileName);
			}
		});
	}

	async handleTranscription(text: string, fileName: string): Promise<void> {
		// Get the base file name without extension
		const baseFileName = getBaseFileName(fileName);

		const audioFilePath = `${
			this.plugin.settings.saveAudioFilePath
				? `${this.plugin.settings.saveAudioFilePath}/`
				: ""
		}${fileName}`;

		const noteFilePath = `${
			this.plugin.settings.createNewFileAfterRecordingPath
				? `${this.plugin.settings.createNewFileAfterRecordingPath}/`
				: ""
		}${baseFileName}.md`;

		try {
			// Determine if a new file should be created
			const activeView =
				this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
			const shouldCreateNewFile =
				this.plugin.settings.createNewFileAfterRecording ||
				(!activeView && !this.plugin.settings.saveRecordingToClipboard);

			if (shouldCreateNewFile) {
				await this.plugin.app.vault.create(
					noteFilePath,
					`![[${audioFilePath}]]\n${text}`
				);
				await this.plugin.app.workspace.openLinkText(
					noteFilePath,
					"",
					true
				);
			} else {
				// Insert the transcription at the cursor position
				const editor =
					this.plugin.app.workspace.getActiveViewOfType(
						MarkdownView
					)?.editor;
				if (editor) {
					const cursorPosition = editor.getCursor();
					editor.replaceRange(text, cursorPosition);

					// Move the cursor to the end of the inserted text
					const newPosition = {
						line: cursorPosition.line,
						ch: cursorPosition.ch + text.length,
					};
					editor.setCursor(newPosition);
				} else {
					const activeFile = this.plugin.app.workspace.getActiveFile();
					if (activeFile) {
						await this.plugin.app.vault.append(activeFile, `\n${text}`);
					}
				}
			}

			if (this.plugin.settings.saveRecordingToClipboard) {
				// Save the transcription to the clipboard
				await navigator.clipboard.writeText(text);
				new Notice("Transcription copied to clipboard.");
			}

			new Notice("Transcribed successfully.");
		} catch (err) {
			console.error("Error parsing audio:", err);
			new Notice("Error parsing audio: " + err.message);
		}
	}
}
