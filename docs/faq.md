---
title: FAQ & Troubleshooting Guide
description: Find answers to common questions and solutions to issues with Whisper Buddy.

editLink: true
---

# FAQ and Troubleshooting

> [!warning] Work in Progress 🏗️
> This page is a work in progress. If you don't find an answer to your questions here or in the [guide](./feature-guide.md), feel free to [reach out](https://jakobosterberger.com/contact) or to open up an [issue on github](https://github.com/jk-oster/obsidian-thought-stream/issues).

[[toc]]

## How can I troubleshoot connection problems between Whisper Buddy and my LLM-Provider?

You can troubleshoot connection problems by following these steps:
1. Check your API key and ensure it is correctly entered in the Whisper Buddy settings.
2. Check your API URL and ensure it is correctly entered in the Whisper Buddy settings.
3. Ensure that you have a stable internet connection.
4. Check the API status of your LLM-Provider to see if there are any ongoing issues.
5. If you are using a self-hosted LLM, ensure that it is running and accessible from your network.
6. Turn on the developer mode in the plugin settings and check the notices in the plugin interface for any error messages or warnings that might indicate the source of the problem.
7. If the problem persists, check the developer console in Obsidian for any error messages related to Whisper Buddy. You can open the developer console by pressing `Ctrl + Shift + I` (or `Cmd + Option + I` on Mac) and navigating to the "Console" tab.
8. If you still can't resolve the issue, consider reaching out for help by opening an [issue on GitHub](https://github.com/jk-oster/obsidian-thought-stream/issues)

## How do I test the latest extension version from GitHub?


## Is Whisper Buddy also available for Obsidian Mobile?

Yes, Whisper Buddy is available for Obsidian Mobile.

## How do I build my own version of Whisper Buddy?


## How does Whisper Buddy read note data?

Whisper Buddy reads note data from your Obsidian vault using the Obsidian plugin API. 
It does not access or read any data outside your vault.

Whisper Buddy usually reads only the currently active note execpt if you explicitly upload an audio file.

## How do I include / exclude certain (private) notes from being processed?

You can include or exclude certain notes from being processed by Whisper Buddy by using `inlcude` and `exlude` settings of the plugin.

## How does Whisper Buddy handle my note data?

Whisper Buddys sends note data to the configured LLM-Provider for processing.
The LLM-Provider might store the data according to its own privacy policy.
The Whisper Buddy plugin has no control over how the LLM-Provider handles the data.

You can also configure Whisper Buddy to use a self-hosted / local LLM compatible with OpenAi API. This way you can ensure that no sensitive data is sent to a third-party service.

The plugin itself does not store or log any data outside your vault.
All the data storage and processing aside from transcription, question generation and content generation happens locally in your Obsidian vault.

## Which LLM-Providers are supported?

Currently, Whisper Buddy supports all OpenAI-API-compatible providers, including:
- OpenAI
- OpenRouter
- Anthropic
- Azure OpenAI

## How do I report a bug or request a feature?

You can report bugs or request features by opening an issue on the [GitHub repository](https://github.com/jk-oster/obsidian-thought-stream/issues)
or by contacting me directly through the [contact form](https://jakobosterberger.com/contact).

## How do I get an API key for my LLM-Provider?

You can get an API key for your LLM-Provider by following these steps:
1. Visit the website of your LLM-Provider (e.g., [OpenAI](https://platform.openai.com/overview), or [Open Router](https://openrouter.ai/)).
2. Sign up for an account if you don't have one.
3. Navigate to the API section of the website.
4. Follow the instructions to create a new API key.

## How do I configure Whisper Buddy to use my (local) LLM-Provider?

You can configure Whisper Buddy to use your LLM-Provider by following these steps:
1. Open the Obsidian settings.
2. Navigate to the "Whisper Buddy" plugin settings.
3. Enter your custom API url and API key.
4. Select the model you want to use.
5. Select the language you want to use for the transcription.

## How do I use Whisper Buddy to transcribe existing audio files?

You can use Whisper Buddy to transcribe audio files by following these steps:
1. Open the command palette with `Ctrl/Cmd + P`.
2. Search for "Transcribe Audio File" and select it.
3. A file dialog will appear. Choose the audio file you want to transcribe.
4. The plugin will transcribe the selected file. The output will be saved according to your settings, either in a new note or at the cursor position in the current note.

## How do I use Whisper Buddy to generate content?

You can use Whisper Buddy to generate content by following these steps:
1. using the command palette:
	- Open the command palette with `Ctrl/Cmd + P`.
	- Search for "Generate Content" and select it.
2. using the Whisper Buddy interface:
   - Open the Whisper Buddy interface by e.g., clicking on the ribbon icon. 
   - Click the "Generate Content" Button.
3. A dialog will appear. Choose a preset or enter a configuration for the content you want to generate.
4. Click the "Generate" button. The plugin will generate the content based on your configuration and create a new note.

## How do I use Whisper Buddy to generate questions?

You can use Whisper Buddy to generate questions by following these steps:
1. Open the Whisper Buddy interface by e.g., clicking on the ribbon icon.
2. Click the "Generate Questions" Button.

> [!info] Tip 💡
> If you want, you can configure the plugin to automatically generate questions for each note.
> You can do this by enabling the "Auto read active file" setting in the Whisper Buddy settings.

> [!warning] Caution 💸
> Be aware that this will automatically send requests to your LLM-Provider for each note you open, 
> which might incur costs depending on your provider's pricing model.
