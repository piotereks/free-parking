const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get default Expo Metro config
const config = getDefaultConfig(__dirname);

// Path to the shared package
const sharedPath = path.resolve(__dirname, '../shared');

// Add shared package to watchFolders
config.watchFolders = [sharedPath];

// Configure resolver for shared package
config.resolver = {
  ...config.resolver,
  
  // Enable symlink support
  resolveRequest: (context, moduleName, platform) => {
    // Handle parking-shared alias
    if (moduleName === 'parking-shared') {
      return {
        filePath: path.join(sharedPath, 'src', 'index.js'),
        type: 'sourceFile',
      };
    }
    
    // Default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
  
  // Support both ESM and CJS extensions
  sourceExts: [
    ...config.resolver.sourceExts,
    'mjs',
    'cjs',
  ],
  
  // Node modules to exclude from bundling (if needed)
  blockList: [
    // Exclude shared node_modules to prevent duplication
    /shared\/node_modules\/.*/,
  ],
};

// Enable additional babel transforms if needed
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
