# NoteTmp ✨

A beautiful, minimalist note-taking app with smart features and a focus on simplicity. Your notes are auto-saved and expire after 6 hours, perfect for temporary notes and quick thoughts.

## 🎨 Features

### 🌓 Dark Mode
- Seamless dark/light mode toggle
- Smooth color transitions
- System preference detection
- Beautiful theme optimized for writing

### ⚙️ Customizable Settings
- **Font Size Control**: Adjust from 12px to 24px for comfortable reading
- **Tab Size**: Customize tab spacing from 2 to 8 spaces (default: 4 - wider than before!)
- **Line Height**: Fine-tune line spacing for better readability

### 📊 Real-time Stats
- Live word count
- Character count
- Automatic calculation as you type

### ⌨️ Keyboard Shortcuts
- `Cmd/Ctrl + K` - Clear all notes (with confirmation)
- `Cmd/Ctrl + S` - Export notes as .txt file

### 💾 Smart Storage
- Auto-save every few seconds
- 6-hour expiration timer
- Works completely offline
- Debounced saves to optimize performance

### 📥 Export Functionality
- Download notes as timestamped .txt files
- One-click export
- Preserves all formatting

### 🎯 UI/UX Enhancements
- Clean, distraction-free interface
- Smooth animations and transitions
- Custom scrollbar styling
- Enhanced selection highlighting
- Responsive design for all screen sizes
- Icons from Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

The app will be available at `http://localhost:8080`

## 🛠️ Technologies

- **Vite** - Lightning-fast build tool
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── components/
│   ├── Scratchpad.tsx      # Main note-taking component
│   ├── SettingsMenu.tsx    # Settings popover with controls
│   └── ui/                 # shadcn/ui components
├── hooks/
│   ├── useLocalStorage.ts  # Auto-save & expiry logic
│   ├── useDarkMode.ts      # Dark mode state management
│   └── useSettings.ts      # User preferences
├── pages/
│   └── Index.tsx           # Main page
└── index.css               # Global styles & theme
```

## 🎨 Customization

### Theme Colors
Edit the CSS variables in `src/index.css` to customize the color scheme:

```css
:root {
  --paper: 42 40% 97%;      /* Background color */
  --ink: 30 15% 18%;        /* Text color */
  --glow: 25 80% 55%;       /* Accent color */
  /* ... more variables */
}
```

### Default Settings
Modify defaults in `src/hooks/useSettings.ts`:

```typescript
const DEFAULT_SETTINGS = {
  fontSize: 15,      // Default font size
  tabSize: 4,        // Default tab width (wider!)
  lineHeight: 1.7,   // Default line height
};
```

## 📝 Tips

1. **Focus Mode**: The interface fades away as you type, keeping you focused
2. **Keyboard First**: Most actions have keyboard shortcuts for faster workflow
3. **Auto-Save**: Your work is saved automatically - no manual save needed
4. **Temporary by Design**: Notes expire after 6 hours, perfect for ephemeral thoughts

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ for writers who value simplicity
