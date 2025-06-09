import {type App, normalizePath, Notice, Plugin, TAbstractFile, TFile, TFolder, Vault} from "obsidian";

export const updateFrontMatterByFile = async (
	app: App,
	file: TFile,
	finalData: any
) => {
	await app.fileManager.processFrontMatter(file, (fm) => {
		Object.keys(finalData).forEach((key) => {
			fm[key] = finalData[key];
		});
	});
};

export const getFrontMatterByFile = async (app: App, file: TFile) => {
	let frontmatter = {} as Record<string, any>;
	await app.fileManager.processFrontMatter(file, (fm) => {
		frontmatter = fm;
	});
	return frontmatter;
};

export const handleLocalUrl = async (obUrl: string, plugin: Plugin) => {
	console.log("handleLocalUrl--", obUrl);

	try {
		const obInnerFile = plugin.app.metadataCache.getFirstLinkpathDest(obUrl, "");
		if (!obInnerFile) {
			new Notice(`Failed upload ${obUrl}, 文件不存在`);
			return;
		}
		console.log("find ob local file");

		const conArrayBuffer = await plugin.app.vault.readBinary(obInnerFile);

		return new Blob([conArrayBuffer], {
			type: "image/" + obInnerFile.extension,
		});
	} catch (error: any) {
		new Notice(`Fail Read ${obUrl}, ${error.message}`);
	}

	return;
};

export function hasFrontmatterKey(app: App, file: TFile, frontmatterKey: string) {
	if (!file) return false;
	const cache = app.metadataCache.getFileCache(file);
	return !!cache?.frontmatter?.[frontmatterKey];
}

export function getDataViewCache(app: App, linkedFile: TFile, sourceFile: TFile) {
	if (hasDataviewActive(app)) {
		return getDataviewApi(app).page(linkedFile.path, sourceFile.path);
	}
}

export function getActiveFile(app: App): TFile|null {
	return app.workspace.getActiveFile();
}

export function refreshActiveFile(app: App): void {
	app.workspace.activeEditor?.editor?.refresh();
}

export async function getCachedFileContent(app: App, file: TFile): Promise<string> {
	return app.vault.cachedRead(file);
}

export async function getFileContent(app: App, file: TFile): Promise<string> {
	return app.vault.read(file);
}

export function cleanFileName(fileName: string): string {
	return fileName.replace(/[^a-zA-Z0-9-_ ]/g, '').trim();
}

export function hasDataviewActive(app: App): boolean {
	return (app as any).plugins.enabledPlugins.has('dataview') &&
		(app as any).plugins?.plugins?.dataview?.api;
}

export function getDataviewApi(app: App): any {
	return (app as any).plugins?.plugins?.dataview?.api;
}

export const getAllThoughtStreamFiles = async (app: App, identifier: string = '#thoughtstream'): Promise<TFile[]> => {
	if (hasDataviewActive(app)) {
		return await getDataviewApi(app).pages(identifier) as TFile[] ?? [];
	}
	new Notice('Dataview not active.')
	return [];
}

export function getBaseFileName(filePath: string) {
	// Extract the file name including extension
	const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);

	// Remove the extension from the file name
	return fileName.substring(0, fileName.lastIndexOf("."));
}

export function openURL(link: string): void {
	window.open(link, '_blank');
}

export function getTFilesFromFolder(
	app: App,
	folderStr: string
): Array<TFile> {
	const folder = resolveTFolder(app, folderStr);

	const files: Array<TFile> = [];
	Vault.recurseChildren(folder, (file: TAbstractFile) => {
		if (file instanceof TFile) {
			files.push(file);
		}
	});

	files.sort((a, b) => {
		return a.path.localeCompare(b.path);
	});

	return files;
}

export function resolveTFolder(app: App, folder_str: string): TFolder {
	folder_str = normalizePath(folder_str);

	const folder = app.vault.getAbstractFileByPath(folder_str);
	if (!folder) {
		throw new Error(`Folder "${folder_str}" doesn't exist`);
	}
	if (!(folder instanceof TFolder)) {
		throw new Error(`${folder_str} is a file, not a folder`);
	}

	return folder;
}

export function resolveTFile(app: App, file_str: string): TFile {
	file_str = normalizePath(file_str);

	const file = app.vault.getAbstractFileByPath(file_str);
	if (!file) {
		throw new Error(`File "${file_str}" doesn't exist`);
	}
	if (!(file instanceof TFile)) {
		throw new Error(`${file_str} is a folder, not a file`);
	}

	return file;
}
