---
title: FAQ & Troubleshooting Guide
description: Find answers to common questions and solutions to issues with Thought Stream.

editLink: true
---

# FAQ and Troubleshooting

> [!warning] Work in Progress 🏗️
> This page is a work in progress. If you don't find an answer to your questions here or in the [guide](./feature-guide.md), feel free to [reach out](https://jakobosterberger.com/contact) or to open up an [issue on github](https://github.com/jk-oster/obsidian-thought-stream/issues).

[[toc]]

## How can I troubleshoot connection problems between Thought Stream and my LLM-Provider?


## How do I test the latest extension version from GitHub?


## Is Thought Stream also available for Obsidian Mobile?

Yes, Thought Stream is available for Obsidian Mobile.

## How do I build my own version of Thought Stream?


## How does Thought Stream read note data?

Thought Stream reads note data from your Obsidian vault using the Obsidian plugin API. 
It does not access or read any data outside your vault.

Thought Stream usually reads only the currently active note execpt if you explicitly upload an audio file.

## How do I include / exclude certain (private) notes from being processed?

You can include or exclude certain notes from being processed by Thought Stream by using `inlcude` and `exlude` settings of the plugin.

## How does Thought Stream handle sensitive data?

Thought Streams sends note data to the configured LLM-Provider for processing.
The LLM-Provider might store the data according to its own privacy policy.
The Thought Stream plugin has no control over how the LLM-Provider handles the data.

It does not store or log any sensitive data remotely.
All the data storage and processing aside from transcription, question generation and content generation happens locally in your Obsidian vault.

## Which LLM-Providers are supported?

Currently, Thought Stream supports all OpenAI-API-compatible providers, including:
- OpenAI
- OpenRouter
- Anthropic
- Azure OpenAI

## How do I report a bug or request a feature?

You can report bugs or request features by opening an issue on the [GitHub repository]()
or by contacting me directly through the [contact form](https://jakobosterberger.com/contact).

## How do I get an API key for my LLM-Provider?

You can get an API key for your LLM-Provider by following these steps:
1. Visit the website of your LLM-Provider (e.g., [OpenAI](https://platform.openai.com/overview), or [Open Router](https://openrouter.ai/)).
2. Sign up for an account if you don't have one.
3. Navigate to the API section of the website.
4. Follow the instructions to create a new API key.

## How do I configure Thought Stream to use my LLM-Provider?
You can configure Thought Stream to use your LLM-Provider by following these steps:
1. Open the Obsidian settings.
2. Navigate to the "Thought Stream" plugin settings.
3. Enter your custom API url and api key.
4. Select the model you want to use.
5. Select the language you want to use for the transcription.

## How do I use Thought Stream to transcribe audio files?

You can use Thought Stream to transcribe audio files by following these steps:
1. Open the command palette with `Ctrl/Cmd + P`.
2. Search for "Transcribe Audio File" and select it.
3. A file dialog will appear. Choose the audio file you want to transcribe.
4. The plugin will transcribe the selected file. The output will be saved according to your settings, either in a new note or at the cursor position in the current note.
