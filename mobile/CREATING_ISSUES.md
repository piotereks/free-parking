# Creating GitHub Issues for Mobile Modifications

This directory contains everything you need to create GitHub issues for the 100 mobile app modifications documented in `TINY_MODIFICATIONS.md`.

## Quick Start

### Option 1: Use GitHub Issue Templates (Easiest)

1. Go to the [Issues page](https://github.com/piotereks/free-parking/issues/new/choose) on GitHub
2. Choose a template based on the type of modification:
   - 🔧 **Mobile - Code Quality Improvement** (items 1-8)
   - 🎨 **Mobile - UI/UX Improvement** (items 9-18)
   - ⚡ **Mobile - Performance Optimization** (items 19-23)
   - 🧪 **Mobile - Testing Improvement** (items 24-30)
   - 📚 **Mobile - Documentation** (items 31-38)
   - 🚀 **Mobile - Quick Win** (items 71-80) - Best for beginners!
3. Fill in the modification number from `TINY_MODIFICATIONS.md`
4. Complete the template and create the issue

### Option 2: Generate All Issues with Script

Use the `generate-issues.py` script to create issue files for all 100 modifications:

```bash
cd mobile

# Preview what will be generated (shows first 5)
python3 generate-issues.py --dry-run

# Generate markdown files for all issues
python3 generate-issues.py --output-dir ./issues

# Create all issues directly using GitHub CLI (requires gh CLI installed)
python3 generate-issues.py --gh-create
```

### Option 3: Manual Bulk Creation with GitHub CLI

After generating issue files:

```bash
cd mobile/issues
for file in *.md; do
  gh issue create --body-file "$file"
done
```

## Issue Templates Available

All templates are in `.github/ISSUE_TEMPLATE/`:

1. **config.yml** - Configuration with helpful links
2. **mobile-code-quality.md** - For code quality improvements
3. **mobile-ui-ux.md** - For UI/UX enhancements
4. **mobile-performance.md** - For performance optimizations
5. **mobile-testing.md** - For adding/improving tests
6. **mobile-documentation.md** - For documentation improvements
7. **mobile-quick-win.md** - For quick wins (< 30 minutes)

## What Each Template Includes

Every template has:
- ✅ Appropriate labels (mobile, category, enhancement)
- ✅ Structured format with clear sections
- ✅ Reference to `TINY_MODIFICATIONS.md`
- ✅ Implementation checklist
- ✅ Space for modification number and details

Quick Win templates also get the `good-first-issue` label automatically!

## Script Features

The `generate-issues.py` script:
- ✅ Parses all 100 modifications from `TINY_MODIFICATIONS.md`
- ✅ Automatically assigns correct labels based on category
- ✅ Formats issues consistently
- ✅ Can create issues directly via GitHub CLI
- ✅ Supports dry-run mode for preview

## Workflow Recommendations

### For Project Maintainers

1. Use templates to create a few high-priority issues manually
2. Or run the script to create all 100 issues at once
3. Use labels and milestones to organize work
4. Close issues as PRs are merged

### For Contributors

1. Browse the [Issues page](https://github.com/piotereks/free-parking/issues?q=is%3Aissue+is%3Aopen+label%3Amobile)
2. Filter by labels:
   - `quick-win` - Fast improvements
   - `good-first-issue` - Great for newcomers
   - `code-quality` - Code improvements
   - `ui-ux` - Visual enhancements
3. Pick an issue and read the full details in `TINY_MODIFICATIONS.md`
4. Create a PR and link it to the issue

## Labels Used

All issues get these labels:
- `mobile` - Identifies mobile app issues
- `enhancement` - Type of change
- Category-specific:
  - `code-quality` - Code quality improvements
  - `ui-ux` - UI/UX enhancements
  - `performance` - Performance optimizations
  - `testing` - Test improvements
  - `documentation` - Documentation updates
  - `accessibility` - Accessibility improvements
  - `quick-win` - Quick improvements
  - `good-first-issue` - Good for new contributors

## Tips

- **Start with Quick Wins** (items 71-80) if you're new
- **Read the full modification** in `TINY_MODIFICATIONS.md` before starting
- **Keep PRs focused** - One issue per PR
- **Reference the issue** in your PR description
- **Ask questions** in the issue comments if anything is unclear

## Examples

### Creating a Quick Win Issue

1. Go to: https://github.com/piotereks/free-parking/issues/new/choose
2. Select "🚀 Mobile - Quick Win"
3. Fill in:
   - Modification Number: `71`
   - Title: `[Mobile] Fix Typos in Comments`
   - Description: Review and fix any typos in comments
4. Create issue!

### Using the Script

```bash
# Generate all issue markdown files
cd mobile
python3 generate-issues.py

# This creates ./issues/ directory with 100 files:
# - issue-001-add-proptypes-to-all-components.md
# - issue-002-extract-magic-numbers-to-constants.md
# - ... (98 more)

# Then bulk create with GitHub CLI
cd issues
for file in *.md; do
  gh issue create --body-file "$file"
  sleep 2  # Rate limiting
done
```

## Need Help?

- See `TINY_MODIFICATIONS.md` for complete modification details
- Check existing issues for examples
- Ask questions in issue comments or discussions

---

**Last Updated**: 2026-02-07  
**Issue Templates**: 7 templates in `.github/ISSUE_TEMPLATE/`  
**Total Modifications**: 100 items documented
