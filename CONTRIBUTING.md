# Contributing to Coding Streak Card Generator

Thank you for your interest in contributing! 🎉

We welcome contributions from the community. This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check if the bug has already been reported in [Issues](https://github.com/VA-run23/streak-card23/issues)
- Test with the latest version of the code

When creating a bug report, include:
- Clear and descriptive title
- Detailed steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots or error messages if applicable
- Environment details (browser, OS, Node.js version)

### Suggesting Features

Feature requests are welcome! Please:
- Open an issue with the `enhancement` label
- Clearly describe the feature and its use case
- Explain why this feature would be useful
- Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/VA-run23/streak-card23.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write clear, concise comments
   - Test your changes thoroughly
   - Ensure the build passes: `npm run build`

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues (e.g., "Fixes #123")
   - Include screenshots for UI changes
   - Ensure CI checks pass

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VA-run23/streak-card23.git
   cd streak-card23
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
streak-card23/
├── api/              # Vercel serverless functions
├── server/           # Local development server
├── src/              # React frontend
├── public/           # Static assets
└── .github/          # GitHub workflows
```

## Code Style Guidelines

- Use ES6+ features (arrow functions, destructuring, etc.)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused (single responsibility)
- Use async/await for asynchronous operations
- Handle errors gracefully with try-catch blocks

## Adding New Platforms

To add support for a new coding platform:

1. **Update API handler** (`api/fetch-streak.js`):
   ```javascript
   async function getNewPlatformStreak(username) {
     try {
       // Fetch streak data from platform API
       const response = await axios.get(`https://api.platform.com/${username}`);
       return response.data.streak || 0;
     } catch (error) {
       console.error('Platform fetch error:', error.message);
       return 0;
     }
   }
   ```

2. **Add platform URL mapping**:
   ```javascript
   function getPlatformUrl(platform, username) {
     const urlMap = {
       // ... existing platforms
       newplatform: `https://platform.com/user/${username}`
     };
     return urlMap[platform] || '#';
   }
   ```

3. **Update switch case** in handler:
   ```javascript
   case 'newplatform':
     streakCount = await getNewPlatformStreak(username);
     dataSource = 'api';
     break;
   ```

4. **Update frontend** (`src/App.jsx`):
   ```javascript
   const platforms = [
     // ... existing platforms
     { value: 'newplatform', label: 'New Platform', hasApi: true }
   ];
   ```

5. **Add platform icon and name** (`api/streak-card.js`):
   ```javascript
   const platformIcons = {
     // ... existing icons
     newplatform: '🎯'
   };
   
   const platformNames = {
     // ... existing names
     newplatform: 'New Platform'
   };
   ```

6. **Test thoroughly**:
   - Test API endpoint: `/api/fetch-streak/newplatform/username`
   - Test card generation with the new platform
   - Verify clickable links work correctly

## Testing

Before submitting a PR:
- Test locally with `npm run dev`
- Build successfully with `npm run build`
- Test API endpoints manually
- Test frontend functionality
- Check for console errors

## Documentation

When adding features:
- Update README.md if user-facing
- Update DEPLOYMENT.md if deployment-related
- Add JSDoc comments for complex functions
- Update this CONTRIBUTING.md if process changes

## Questions or Need Help?

- Open an issue for questions
- Check existing issues and PRs
- Review the README.md and DEPLOYMENT.md

## Recognition

Contributors will be recognized in the project. Thank you for making this project better! 🙏

---

**Happy Contributing!** 🚀
