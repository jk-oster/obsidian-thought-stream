---
title: Getting Started
description: Start using Thought Stream in just a minute and learn how to use its powerful features.

editLink: true
---

# Getting Started with Thought Stream

> [!warning] Work in Progress 🏗️
> This page is a work in progress and does not include all the features yet! In case you have questions or problems that are not covered in this guide check out [FAQ & Troubleshooting](./faq.md).

## Installation

1. This plugin can be installed from "Community Plugins" inside Obsidian or via the [BRAT Plugin](obsidian://show-plugin?id=obsidian42-brat).
2. For this plugin to work, you will need to provide your OpenAI API key (or an OpenAI compatible API + key).

## How to Use

> For further explanation of using this plugin, check out the article ["Speech-to-text in Obsidian using OpenAI Whisper Service"](https://tfthacker.medium.com/speech-to-text-in-obsidian-using-openai-whisper-service-7b2843bf8d64) by [TfT Hacker](https://twitter.com/tfthacker)

## Recording and Transcribing Audio

There are several convenient options for how you can control audio recording:
- Quickly start or stop recording in the background using the `Alt + Q` command shortcut.
- Use the "Start Recording & Open Recorder Controls" ribbon button to open the recorder controls and begin recording.
- Use the recorder controls in the Ghost-Reader view (click the 🎙️ "Microphone" button)
- Use the recorder controls in the Obsidian status bar (click the 🎙️ "Microphone" button)

You can pause and resume the recording using the ⏯️ "Pause/Resume" button.
Click the ⏹️ "Stop" button once you're done.
After stopping the recording, the plugin will automatically transcribe the audio.
Depending on the settings, a new note is created with the transcribed content and linked audio file in the specified folder.
The transcription can also be automatically copied to your clipboard.

## Upload Existing Audio File

You can also transcribe an existing audio file:

-   Open the command palette with `Ctrl/Cmd + P`.
-   Search for "Upload Audio File" and select it.
-   A file dialog will appear. Choose the audio file you want to transcribe.
-   The plugin will transcribe the selected file and create a new note with the content and linked audio file in the specified folder.

## Command Palette for Quick Actions

The following actions can be accessed quickly through the command palette:
- "Start/Stop recording"
- "Upload audio file and transcribe"
- "Start recording and open recorder controls"
- "Create/generate Content based on active file"
- "Create content preset"
- "Open Ghost-Reader View"

## Access Ghost-Reader View

Click on the "Ghost" ribbon button to open the Ghost-Reader view.

- To generate insightful questions, click the "Glasses" button.
- The plugin will read your note and prompt you various questions to help you explore the topic at hand even further.
- For an even smoother experience, you can configure the plugin to automatically read the current file every time you open a note.

## Generate Content

...
