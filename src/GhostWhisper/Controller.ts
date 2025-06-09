import {RecordingStatus} from "../StatusBar";
import ThoughtStream from "../../main";

export class Controller {
	private readonly plugin: ThoughtStream;

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;
	}

	public async toggleRecording() {
		if (this.plugin.recorder.getRecordingState() === 'recording') {
			await this.stopRecording();
		} else {
			await this.startRecording();
		}
	}

	public async startRecording() {
		console.log("start");
		this.plugin.statusBar.updateStatus(RecordingStatus.Recording);
		await this.plugin.recorder.startRecording();
		this.plugin.timer.start();
	}

	public async pauseRecording() {
		console.log("pausing recording...");
		await this.plugin.recorder.pauseRecording();
		this.plugin.timer.pause();
	}

	public async stopRecording() {
		console.log("stopping recording...");
		const blob = await this.plugin.recorder.stopRecording();
		this.plugin.timer.reset();

		const extension = this.plugin.recorder.getMimeType()?.split("/")[1];
		const fileName = `${new Date()
			.toISOString()
			.replace(/[:.]/g, "-")}.${extension}`;
		await this.plugin.audioHandler.fetchTranscription(blob, fileName);
	}
}
