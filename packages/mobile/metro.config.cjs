const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// Ensure Metro treats the mobile package as the app root
config.projectRoot = projectRoot;

// Include workspace root so Metro can resolve shared packages and root node_modules
config.watchFolders = config.watchFolders || [];
if (!config.watchFolders.includes(workspaceRoot)) {
  config.watchFolders.push(workspaceRoot);
}

config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
