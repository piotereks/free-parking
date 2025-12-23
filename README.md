# 🅿️ Free Parking Monitor

A real-time parking availability monitoring application for UBS Wrocław parking facilities. Built with React, Vite, and ECharts to provide live updates and historical statistics.

## ✨ Features

- **Real-time Dashboard**: Live parking space availability with auto-refresh every 5 minutes
- **Historical Statistics**: Interactive charts showing parking trends over time
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with preferences saved locally
- **Data Persistence**: Smart caching system for instant page loads
- **Multiple Parking Locations**: 
  - GreenDay parking facility (187 spaces)
  - Uni Wroc parking facility (41 spaces)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/piotereks/free-parking.git
cd free-parking

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 7.2
- **State Management**: Zustand 5.0
- **Charting**: ECharts 6.0 with React wrapper
- **Styling**: Tailwind CSS 3.4
- **Data Parsing**: PapaParse for CSV processing
- **Icons**: Lucide React

### Project Structure

```
src/
├── App.jsx                    # Main app component with routing
├── Dashboard.jsx              # Real-time parking dashboard view
├── Statistics.jsx             # Historical charts view
├── Header.jsx                 # Shared header with navigation
├── ParkingDataManager.jsx     # Data provider with API/CSV logic
├── ThemeContext.jsx           # Theme state management
├── store/
│   └── parkingStore.js       # Zustand store for global state
├── index.css                  # Global styles
└── App.css                    # Component-specific styles
```

### Data Flow

1. **Real-time Data**: Fetched from `zaparkuj.pl` API endpoints via CORS proxy
2. **Historical Data**: Loaded from published Google Sheets CSV
3. **Data Submission**: New samples automatically submitted to Google Form
4. **Caching**: Both real-time and historical data cached in localStorage

## 🔧 Configuration

### API Endpoints

Located in `src/ParkingDataManager.jsx`:

```javascript
const API_URLS = [
    'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
    'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json'
];
```

### CORS Proxy

The application uses `https://corsproxy.io/` to bypass CORS restrictions. Update `CORS_PROXY` constant if needed.

### Google Form Integration

To configure automatic data submission to Google Forms, update the `FORM_ENTRIES` object with your form's entry IDs:

1. Open your Google Form in edit mode
2. Right-click on each field → Inspect Element
3. Find `<input name="entry.XXXXXXXXXX">`
4. Update the entry IDs in `ParkingDataManager.jsx`

## 🎨 Customization

### Themes

Toggle between light and dark themes using the sun/moon icon in the header. Preference is saved to localStorage.

### Chart Palettes

The Statistics view offers 4 color palettes:
- Neon (default)
- Classic
- Cyberpunk
- Modern

### Cache Management

Clear local cache by adding `?clear_cache` to the URL, which reveals a "Clear Cache" button in the header.

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory. Deploy this directory to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### Environment-Specific Builds

Use `vite.config.local.js` for local development with custom base paths if needed.

## 🐛 Troubleshooting

### API Data Not Loading

1. Check browser console for CORS errors
2. Verify CORS proxy is accessible
3. Confirm API endpoints are online

### Chart Not Rendering

1. Ensure historical data CSV is accessible
2. Check for timestamp format issues in data
3. Verify ECharts dependencies are installed

### Cache Issues

Navigate to `?clear_cache` and click "Clear Cache" button to reset local storage.

## 📝 Development Notes

### Code Conventions

- Use functional components with hooks
- Follow existing naming patterns (e.g., `Bank_1` → `Uni Wroc`)
- Timestamps should be in format `YYYY-MM-DD HH:MM:SS`
- Use `useParkingStore` hook for accessing global state

### Adding New Features

1. Update Zustand store if new global state is needed
2. Use existing `ParkingDataProvider` for data operations
3. Maintain responsive design with Tailwind utilities
4. Test in both light and dark themes

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Parking data provided by UBS Wrocław via zaparkuj.pl
- Built with modern web technologies and best practices
- Icons from Lucide React library

## 📧 Contact

For questions or issues, please open an issue on GitHub.

---

Made with ❤️ for better parking experience in Wrocław
