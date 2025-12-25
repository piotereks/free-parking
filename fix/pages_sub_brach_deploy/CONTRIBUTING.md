# Contributing to Free Parking Monitor

Thank you for your interest in contributing to the Free Parking Monitor project! This guide will help you get started.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/free-parking.git
   cd free-parking
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📝 Development Workflow

### Before Making Changes

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make sure all tests pass:
   ```bash
   npm run test:run
   ```

3. Ensure code passes linting:
   ```bash
   npm run lint
   ```

### Automated Deployment

When you push your feature branch, it will automatically deploy to a branch-specific preview:

- **Branch naming conventions supported:**
  - `feature/*` → Deploys to `parking-feature-*`
  - `fix/*` → Deploys to `parking-fix-*`
  - `dev/*` → Deploys to `parking-dev-*`
  
- **Preview URL pattern:** `https://piotereks.github.io/piotereks/html/parking-{normalized-branch-name}/`
  
- **Example:**
  - Branch: `feature/new-dashboard`
  - Preview: `https://piotereks.github.io/piotereks/html/parking-feature-new-dashboard/`

This allows you to test your changes in a production-like environment before merging to main. Each branch gets its own deployment, and all deployments coexist without overwriting each other.

### While Developing

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Test in both light and dark themes
- Check responsiveness on mobile devices

### Code Style Guidelines

- **Components**: Use functional components with hooks
- **Naming**: 
  - Components: PascalCase (e.g., `ParkingCard`)
  - Functions: camelCase (e.g., `fetchData`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_URLS`)
- **Props**: Always add PropTypes validation
- **Comments**: Use JSDoc comments for functions
- **Imports**: Group by type (React, third-party, local)

### Testing

- Write tests for new features in `src/test/`
- Run tests before committing:
  ```bash
  npm run test:run
  ```
- Aim for meaningful test coverage

### Building

Before submitting, ensure the project builds successfully:
```bash
npm run build
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information
- Console errors (if any)

## ✨ Suggesting Features

Feature suggestions are welcome! Please:

- Check existing issues first
- Describe the feature clearly
- Explain the use case and benefits
- Consider implementation complexity

## 📦 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Run linter and tests**:
   ```bash
   npm run lint
   npm run test:run
   npm run build
   ```
4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add awesome feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** on GitHub

### PR Guidelines

- Use descriptive PR titles
- Reference related issues
- Describe changes clearly
- Include screenshots for UI changes
- Keep PRs focused and atomic
- Be responsive to feedback

### Commit Message Format

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add loading skeleton for parking cards
fix: correct timestamp parsing for timezone
docs: update installation instructions
refactor: extract utility functions to separate module
```

## 🏗️ Project Structure

```
src/
├── components/        # React components
├── store/            # State management (Zustand)
├── utils/            # Utility functions
├── test/             # Test files
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## 🧪 Testing Guidelines

- Write unit tests for utilities
- Write integration tests for components
- Use meaningful test descriptions
- Mock external dependencies
- Test error cases

Example test structure:
```javascript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation
  });
});
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [ECharts Documentation](https://echarts.apache.org/en/index.html)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Ask in pull request comments
- Contact maintainers directly

Thank you for contributing! 🎉
