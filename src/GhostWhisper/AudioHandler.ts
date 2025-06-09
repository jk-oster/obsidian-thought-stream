// Credits go to Nik Danilov's Whisper Plugin: https://github.com/nikdanilov/whisper-obsidian-plugin

import axios from "axios";
import ThoughtStream from "main";
import { Notice, MarkdownView } from "obsidian";
import { getBaseFileName } from "../utils";
import {Observable} from "../Observable";

export type AudioHandlerState = 'processing' | 'idle';
export type TranscriptionResult = {
	text: string;
	fileName: string;
};

export class AudioHandler {
	private plugin: ThoughtStream;

	public readonly $state: Observable<AudioHandlerState> = new Observable<AudioHandlerState>('idle');
	public readonly $transcription: Observable<TranscriptionResult> = new Observable<TranscriptionResult>({
		text: '',
		fileName: ''
	});
	public readonly $error: Observable<string|null> = new Observable<string|null>('');

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
	}

	async fetchTranscription(blob: Blob, fileName: string, notify: boolean = true): Promise<TranscriptionResult> {
		// Get the base file name without extension
		const audioFilePath = `${
			this.plugin.settings.saveAudioFilePath
				? `${this.plugin.settings.saveAudioFilePath}/`
				: ""
		}${fileName}`;

		if (this.plugin.settings.debugMode) {
			new Notice(`Sending audio data size: ${blob.size / 1000} KB`);
		}

		if (!this.plugin.settings.transcriptionApiKey) {
			new Notice(
				"API key is missing. Please add your API key in the settings."
			);
			return { text: '', fileName: '' };
		}

		this.$state.set('processing');

		const formData = new FormData();
		formData.append("file", blob, fileName);
		formData.append("model", this.plugin.settings.transcriptionModel);
		formData.append("language", this.plugin.settings.language);
		if (this.plugin.settings.transcriptionPrompt)
			formData.append("prompt", this.plugin.settings.transcriptionPrompt);

		try {
			// If the saveAudioFile setting is true, save the audio file
			if (this.plugin.settings.saveAudioFile) {
				const arrayBuffer = await blob.arrayBuffer();
				await this.plugin.app.vault.adapter.writeBinary(
					audioFilePath,
					new Uint8Array(arrayBuffer)
				);
				new Notice("Audio saved successfully.");
			}
		} catch (err) {
			console.error("Error saving audio file:", err);
			new Notice("Error saving audio file: " + err.message);
		}

		try {
			if (this.plugin.settings.debugMode) {
				new Notice("Parsing audio data:" + fileName);
			}
			const response = await axios.post(
				this.plugin.settings.transcriptionApiUrl,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${this.plugin.settings.transcriptionApiKey}`,
					},
				}
			);

			// Emit the transcription result
			this.$transcription.set({
				text: response.data.text,
				fileName: fileName,
			}, notify);
			console.log("Audio fetched successfully.");
		} catch (err) {
			console.error("Error fetching audio:", err);
			new Notice("Error fetching audio: " + err.message);

			this.$transcription.set({
				text: '',
				fileName: '',
			}, notify);
		}

		this.$state.set('idle');
		return this.$transcription.get();
	}
}
