---
title: Feature Guide
description: Learn everything about Obsidian Whisper Buddy and how to use all its powerful features.

editLink: true
lastUpdated: true
---

# Feature Guide

> [!warning] Work in Progress 🏗️
> This page is a work in progress and does not include all the features yet! In case you have questions or problems that are not covered in this guide check out [FAQ & Troubleshooting](./faq.md).

[[toc]]

## ⚙️ Settings

### Ghost Whisper Settings (Transcription)
-   API Key: Input your OpenAI API key to unlock the advanced transcription capabilities of the Whisper API. You can obtain a key from OpenAI at this [link](https://platform.openai.com/overview). If you are not familiar with the concept of an API key, you can learn more about this at this [link](https://tfthacker.medium.com/how-to-get-your-own-api-key-for-using-openai-chatgpt-in-obsidian-41b7dd71f8d3).
-   API URL: Specify the endpoint that will be used to make requests to the Whisper API. This should not be changed unless you have a specific reason to use a different endpoint.
-   Model: Choose the machine learning model to use for generating text transcriptions. This should not be changed unless you have a specific reason to use a different model.
-   Language: Specify the language of the message being whispered. For a list of languages and codes, consult this [link](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py).
-   Save recording: Toggle this option to save the audio file after sending it to the Whisper API. When enabled, you can specify the path in the vault where the audio files should be saved.
-   Recordings folder: Specify the path in the vault where to save the audio files. Example: `folder/audio`. This option is only available if "Save recording" is enabled.
-   Save transcription: Toggle this option to create a new file for each recording, or leave it off to add transcriptions at your cursor. When enabled, you can specify the path in the vault where the transcriptions should be saved.
-   Transcriptions folder: Specify the path in the vault where to save the transcription files. Example: `folder/note`. This option is only available if "Save transcription" is enabled.

### Ghost Writer Settings (Content Generation)


### Ghost Reader Settings (Question Generation)


---

> [!important] Disclaimer
> This is an unofficial browser plugin for Obsidian. The project is not sponsored, endorsed or affiliated with Dynalist Inc, the makers of [Obsidian.md](https://obsidian.md). The obsidian logo is property of https://obsidian.md.
