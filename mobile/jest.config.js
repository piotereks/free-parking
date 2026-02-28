module.exports = {
  preset: 'react-native',
  
  // Use enhanced setup file for proper mocking
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Transform ignore patterns for node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|nativewind|parking-shared|@babel/runtime)/)',
  ],
  
  // Module name mapper for parking-shared alias
  moduleNameMapper: {
    '^parking-shared$': '<rootDir>/../shared/src/index.js',
    '^react$': '<rootDir>/node_modules/react',
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.test.jsx',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js',
  ],
  
  // Test environment
  testEnvironment: 'node',
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Verbose output
  verbose: true,
};
