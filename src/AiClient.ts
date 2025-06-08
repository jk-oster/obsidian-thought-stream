import ThoughtStream from "../main";
import OpenAI from "openai";


export class AiClient {
	private plugin: ThoughtStream;
	public readonly  client: OpenAI;

	constructor(plugin: ThoughtStream) {
		this.plugin = plugin;

		this.client = this.createClient();

		this.plugin.settingsManager.$changedSettings.subscribe(() => {
			this.client.baseURL = this.plugin.settings.completionApiUrl || "https://api.openai.com/v1";
			this.client.apiKey = this.plugin.settings.completionApiKey || this.plugin.settings.transcriptionApiKey;
		});
	}

	private createClient() {
		return new OpenAI({
			apiKey: this.plugin.settings.completionApiKey || this.plugin.settings.transcriptionApiKey,
			baseURL: this.plugin.settings.completionApiUrl || "https://api.openai.com/v1",
			dangerouslyAllowBrowser: true
		});
	}
}
