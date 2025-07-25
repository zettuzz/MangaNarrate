# MangaNarrate - Clean Version

A minimal manga/manhwa recap script generator with drag-and-drop image reordering and AI integration. Built with **zero external dependencies** beyond Next.js essentials.

## Features

- 🖼️ **Image Upload**: Drag & drop up to 100 images (max 4MB each)
- 🔄 **Native Drag & Drop**: Pure HTML5 drag and drop with smooth animations
- 📊 **Batch Counter**: Shows total number of uploaded images
- 🤖 **AI Model Selection**: Support for OpenAI, Gemini, and Grok
- 📝 **Prompt Configuration**: Main prompt, negative prompt, and character list
- 🔒 **Local API Key Storage**: Secure local storage for API keys
- 🌙 **Dark Theme**: Clean dark UI design with green accents
- ⚡ **Zero Dependencies**: Only Next.js, TypeScript, Tailwind, and Lucide icons

## Quick Setup

### 1. Create Project
\`\`\`bash
npx create-next-app@latest recapscriptmaker-minimal --typescript --tailwind --eslint --app
cd recapscriptmaker-minimal
\`\`\`

### 2. Install Only Essential Dependencies
\`\`\`bash
npm install lucide-react
\`\`\`

### 3. Copy Files
Copy all the files from the code project above into your project.

### 4. Start Development
\`\`\`bash
npm run dev
\`\`\`

## Usage

1. **Upload Images**: Drag and drop your manga/manhwa images
2. **Reorder**: Drag images to reorder them (shows priority numbers)
3. **Select Model**: Choose your preferred AI model
4. **Configure Prompts**: Set your prompts and character list
5. **Generate**: Click "Generate Script" to process all images
6. **Download**: Export your script (feature to be implemented)

## API Keys

Go to Settings to configure your API keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Google Gemini**: https://makersuite.google.com/app/apikey
- **xAI Grok**: https://console.x.ai/

Keys are stored locally in your browser and never sent to external servers.

## Dependencies

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Lucide React**: Icons only

**That's it!** No external UI libraries, state management, or drag-and-drop libraries required!

## Features Included

✅ **Professional UI**: Clean, modern design with smooth animations
✅ **Drag & Drop Reordering**: Native HTML5 drag and drop
✅ **Batch Processing**: Upload and process multiple images
✅ **Progress Tracking**: Real-time generation progress
✅ **API Key Management**: Secure local storage with show/hide
✅ **Responsive Design**: Works on desktop, tablet, and mobile
✅ **Dark Theme**: Beautiful dark-first design
✅ **Type Safety**: Full TypeScript support

## Project Structure

\`\`\`
/app
  page.tsx                 # Main application page
  settings/page.tsx        # API key management
  layout.tsx              # Root layout
  globals.css             # Global styles and animations

package.json              # Minimal dependencies
tailwind.config.js        # Tailwind configuration
next.config.mjs          # Next.js configuration
README.md                # This file
\`\`\`

## Environment Variables

This project requires **NO** environment variables. All API keys are managed client-side for maximum security.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
