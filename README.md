# Speech-to-text in Obsidian using OpenAI Whisper 🗣️📝
[![Deploy Docs](https://github.com/jk-oster/obsidian-thought-stream/actions/workflows/deploy-docs.yaml/badge.svg)](https://github.com/jk-oster/obsidian-thought-stream/actions/workflows/deploy-docs.yaml)
[![Release Obsidian plugin](https://github.com/jk-oster/obsidian-thought-stream/actions/workflows/release.yaml/badge.svg)](https://github.com/jk-oster/obsidian-thought-stream/actions/workflows/release.yaml)

Obsidian Thought Stream is a plugin that effortlessly turns your speech into written notes. 
Speak your mind, and let [Whisper](https://openai.com/research/whisper) from OpenAI do the rest!

## Features

- **🎙️ Ghost-Whisper**: Voice your ideas and thoughts without the need to type them out.
- **👓 Ghost-Reader**: Receive insightful questions on-the-fly to explore your ideas further and overcome writer's block.
- **🖊️ Ghost-Writer**: Automatically organize your thoughts and ideas turn them into useful output and draft content.

![logo](./docs/public/ghost-reader-logo-slim.png)

## 🚀 Getting Started

1. This plugin can be installed from "Community Plugins" inside Obsidian or via the [BRAT Plugin](obsidian://show-plugin?id=obsidian42-brat).
2. For this plugin to work, you will need to provide your OpenAI API key (or an OpenAI compatible API + key).

## 🎯 How to Use

> For further explanation of using this plugin, check out the article ["Speech-to-text in Obsidian using OpenAI Whisper Service"](https://tfthacker.medium.com/speech-to-text-in-obsidian-using-openai-whisper-service-7b2843bf8d64) by [TfT Hacker](https://twitter.com/tfthacker)

### Recording and Transcribing Audio

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

### Upload Existing Audio File

You can also transcribe an existing audio file:

-   Open the command palette with `Ctrl/Cmd + P`.
-   Search for "Upload Audio File" and select it.
-   A file dialog will appear. Choose the audio file you want to transcribe.
-   The plugin will transcribe the selected file and create a new note with the content and linked audio file in the specified folder.

### Command Palette for Quick Actions

The following actions can be accessed quickly through the command palette:
- "Start/Stop recording"
- "Upload audio file and transcribe"
- "Start recording and open recorder controls"
- "Create/generate Content based on active file"
- "Create content preset"
- "Open Ghost-Reader View"

### Access Ghost-Reader View

Click on the "Ghost" ribbon button to open the Ghost-Reader view.

- To generate insightful questions, click the "Glasses" button.
- The plugin will read your note and prompt you various questions to help you explore the topic at hand even further.
- For an even smoother experience, you can configure the plugin to automatically read the current file every time you open a note.

### Generate Content



## 🤝 Contributing

We welcome and appreciate contributions, issue reports, and feature requests from the community! Feel free to visit the [Issues](https://github.com/jk-oster/obsidian-thought-stream/issues) page to share your thoughts and suggestions.

## 💬 Whisper API

-   For additional information, including limitations and pricing related to using the Whisper API, check out the [OpenAI Whisper FAQ](https://help.openai.com/en/articles/7031512-whisper-api-faq)
-   For a high-level overview of the Whisper API, check out this information from [OpenAI](https://openai.com/research/whisper)

## ⚒️ Manual Installation

If you want to install this plugin manually, use the following steps:

1. Download `manifest.json`, `main.js`, `styles.css` from the [GitHub repository](https://github.com/jk-oster/obsidian-thought-stream/releases) into the `plugins/obsidian-thought-stream` folder within your Obsidian vault.
2. Click on `Reload plugins` button inside `Settings > Community plugins`.
3. Locate the "Thought Stream" plugin and enable it.
4. In the plugin settings include your OpenAI API key.

## 🏆 Credits

This plugin is based on a fork of the excellent [Whisper Plugin](https://github.com/nikdanilov/whisper-obsidian-plugin) by [@Nik Danilov](https://github.com/nikdanilov).
Thanks a lot, his efforts laid the foundation of this plugin and also served as inspiration.


## 🤩 Say Thank You

Are you finding value in this plugin? Great! You can fuel my coding sessions and share your appreciation by buying me a coffee [here](https://ko-fi.com/jakobosterberger).

Help others discover the magic of the Obsidian Thought Stream Plugin! I'd be thrilled if you could share your experiences on Twitter, Reddit, or your preferred social media platform!

You can find me on Instagram [@jakobosterberger](https://instagram.com/@jakobosterberger) or on my website [jakobosterberger.com](https://jakobosterberger.com).

[<img src="https://user-images.githubusercontent.com/14358394/115450238-f39e8100-a21b-11eb-89d0-fa4b82cdbce8.png" width="180">](https://ko-fi.com/jakobosterberger)

