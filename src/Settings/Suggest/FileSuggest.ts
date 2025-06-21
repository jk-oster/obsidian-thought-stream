// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TAbstractFile, TFile } from "obsidian";
import { TextInputSuggest } from "./Suggest";
import WhisperBuddy from "main";
import {getTFilesFromFolder} from "../../utils";

export enum FileSuggestMode {
	PresetFiles,
	ScriptFiles,
}

export class FileSuggest extends TextInputSuggest<TFile> {
	constructor(
		public inputEl: HTMLInputElement,
		private plugin: WhisperBuddy,
		private mode: FileSuggestMode
	) {
		super(plugin.app, inputEl);
	}

	get_folder(mode: FileSuggestMode): string {
		switch (mode) {
			case FileSuggestMode.PresetFiles:
			default:
				return this.plugin.settings.saveDraftsFilePath;
		}
	}

	get_error_msg(mode: FileSuggestMode): string {
		switch (mode) {
			case FileSuggestMode.PresetFiles:
				return `Templates folder doesn't exist`;
			case FileSuggestMode.ScriptFiles:
				return `User Scripts folder doesn't exist`;
		}
	}

	getSuggestions(input_str: string): TFile[] {
		const all_files = getTFilesFromFolder(
			this.plugin.app,
			this.get_folder(this.mode)
		);

		if (!all_files) {
			return [];
		}

		const files: TFile[] = [];
		const lower_input_str = input_str.toLowerCase();

		all_files.forEach((file: TAbstractFile) => {
			if (
				file instanceof TFile &&
				file.extension === "md" &&
				file.path.toLowerCase().contains(lower_input_str)
			) {
				files.push(file);
			}
		});

		return files.slice(0, 1000);
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path);
	}

	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.path;
		this.inputEl.trigger("input");
		this.close();
	}
}
