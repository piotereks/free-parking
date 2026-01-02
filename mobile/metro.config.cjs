const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const sharedPath = path.resolve(workspaceRoot, 'shared');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages and which external packages to include
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],
};

// Ensure Metro resolves the react packages from the mobile app's node_modules
// to avoid duplicate React instances when importing `parking-shared`.
// Also resolve parking-shared to its source files (not dist) so dependencies
// are resolved by Metro from mobile's node_modules.
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    react: path.resolve(projectRoot, 'node_modules/react'),
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    zustand: path.resolve(projectRoot, 'node_modules/zustand'),
    'parking-shared': path.resolve(sharedPath, 'src'),
  },
  resolveRequest: (context, moduleName, platform) => {
    // Redirect all zustand imports (including subpaths) to mobile's node_modules
    if (moduleName.startsWith('zustand')) {
      return context.resolveRequest(
        context,
        path.resolve(projectRoot, 'node_modules', moduleName),
        platform
      );
    }
    // Let Metro handle other imports normally
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
