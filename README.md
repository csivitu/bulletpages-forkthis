# 🚀 BulletPages

**Smart web page summarizing Chrome extension powered by Gemini API**

## 📝 Description

BulletPages is a powerful Chrome extension that transforms long, cluttered web pages into concise, easy-to-read bullet point summaries using Google's Gemini AI. Perfect for quickly digesting articles, blog posts, and other textual content without the fluff.

## ✨ Features

- 🧠 **AI-Powered Summaries**: Leverages Google's Gemini API for intelligent content summarization
- 🎯 **Multiple Summary Lengths**: Choose between 4-point or 10-point summaries based on your needs
- 🌐 **Universal Compatibility**: Works on most web pages with readable content
- 🔒 **Secure**: API keys are stored locally and never leave your browser
- 🎨 **Modern UI**: Clean, responsive design with smooth animations

## 📦 Installation

1. 🌐 Open Chrome and navigate to `chrome://extensions/`
2. ⚙️ Enable "Developer mode" in the top right corner
3. 📂 Click "Load unpacked" and select the BulletPages folder

## ⚙️ Setup

1. 🖱️ Click on the BulletPages extension icon in the Chrome toolbar
2. 🔑 Click the "Gemini API Key" button
3. 🆔 Enter your Gemini API key (get one free from [Google AI Studio](https://aistudio.google.com/))
4. 💾 Click "Save API Key"

## 🚀 Usage

1. 📖 Navigate to any readable webpage (news articles, blog posts, etc.)
2. 🖱️ Click the BulletPages extension icon in the toolbar
3. 🎛️ Select your preferred summary type (4 points or 10 points)
4. 🕐 Click "Summarise" and wait for the AI to generate your summary
5. ✅ Read your concise bullet-point summary in the popup

## 🔧 Troubleshooting

- ❌ **"Page not readable"**: The extension works best on pages with clear article content. Try another page with substantial text.
- ⚠️ **Summary not generating**: 
  - Check that your API key is valid and properly saved
  - Ensure you have an active internet connection
  - Verify that your API key has sufficient quota
- 🔄 **Still having issues**: Try refreshing the page before using the extension

## 🔐 Privacy & Security

- 🔐 Your Gemini API key is stored securely in Chrome's storage and never transmitted to any server other than Google's API
- 📡 Content is sent directly to Google's Gemini API for processing
- 🚫 We do not collect, store, or transmit any of your browsing data

## 🛠️ Technical Details

- 🏗️ **Built with**: Manifest V3, JavaScript, HTML, CSS
- ☁️ **AI Model**: Google Gemini 1.5 Flash
- 📡 **API**: Google Generative Language API
- 🧩 **Permissions**: 
  - `scripting`: To extract content from web pages
  - `activeTab`: To access the currently active tab
  - `storage`: To securely store your API key

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve BulletPages.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
