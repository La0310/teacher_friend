# Teacher Friend 📝

An AI-powered essay grading assistant built with React Native and Expo. Take a photo of a handwritten essay (or type one in), and the app will transcribe it, analyze grammar, and highlight issues with suggestions — just like a real teacher would.

## Features

- 📷 **Photo Capture** — Take a photo or pick one from your gallery
- ✍️ **Handwriting Transcription** — Uses Gemini AI to transcribe handwritten text exactly as written (preserving errors)
- 🔍 **Grammar Analysis** — Deep analysis for grammar, punctuation, spelling, style, and structural issues
- 📊 **Essay Statistics** — Word count, paragraph count, and issue count at a glance
- 💡 **Inline Annotations** — Tap highlighted errors in the essay to see explanations and suggestions
- 🗂️ **Issue Cards** — Detailed breakdown of each grammar issue with category, explanation, and fix suggestions

## Start Here — File Guide

Read the files in this order to understand the project:

| Order | File | What It Does |
|-------|------|-------------|
| 1 | `App.js` | **Read this first.** The entire app in one file — UI screens, Gemini API calls, transcription, grammar analysis, and all components. |
| 2 | `index.js` | Entry point that registers `App` as the root component. |
| 3 | `app.json` | Expo configuration (app name, icons, platform settings). |
| 4 | `package.json` | Dependencies and scripts. |
| 5 | `.env` | Environment variables (not committed — you must create your own). |

## Tech Stack

- **React Native** (0.86) + **Expo** (SDK 57)
- **Gemini AI** (`gemini-3.6-flash`) — for both handwriting transcription and grammar analysis
- **expo-image-picker** — camera and gallery access
- **expo-file-system** — reading images as base64 for the API

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) or Expo Go app on your phone

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/La0310/teacher_friend.git
   cd teacher_friend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**

   Create a `.env` file in the project root:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).

4. **Run the app**
   ```bash
   npx expo start
   ```
   Then scan the QR code with the Expo Go app on your phone, or press `a` for Android emulator.

## How It Works

1. **Capture** — Take a photo of a handwritten essay or pick one from your gallery
2. **Transcribe** — Gemini reads the handwriting and outputs the text exactly as written (errors included)
3. **Edit** — Review and optionally correct the transcription
4. **Analyze** — Gemini analyzes the text for grammar, punctuation, spelling, and style issues
5. **Review** — See results with highlighted annotations, issue cards, and fix suggestions

## Project Structure

```
teacher_friend/
├── App.js              # Main app (screens, logic, components, styles)
├── index.js            # Expo entry point
├── app.json            # Expo config
├── package.json        # Dependencies & scripts
├── .env                # API key (not in repo — create your own)
├── .gitignore          # Ignored files
├── LICENSE             # MIT License
└── assets/             # App icons and splash screen
```

## License

MIT
