# Branch-Specific GitHub Pages Deployment

This document explains the branch-specific deployment strategy for this project.

## Overview

The project uses an automated GitHub Actions workflow to deploy different branches to branch-specific subfolders on GitHub Pages. This allows multiple deployments to coexist without overwriting each other, making it easy to preview features before merging to main.

## Deployment Strategy

### Main Branch
- **Branch:** `main`
- **Deploys to:** `docs/html/parking/`
- **URL:** `https://piotereks.github.io/piotereks/html/parking/`
- **Purpose:** Production deployment

### Feature/Fix/Dev Branches
- **Branch patterns:** `feature/*`, `fix/*`, `dev/*`
- **Deploys to:** `docs/html/parking-{normalized-branch-name}/`
- **URL pattern:** `https://piotereks.github.io/piotereks/html/parking-{normalized-branch-name}/`
- **Purpose:** Preview deployments for testing

### Branch Name Normalization

Branch names are normalized for use in URLs by:
1. Converting to lowercase
2. Replacing slashes (`/`) with hyphens (`-`)
3. Replacing dots (`.`) with hyphens (`-`)
4. Replacing underscores (`_`) with hyphens (`-`)

**Examples:**
- `feature/new-dashboard` → `feature-new-dashboard`
- `fix/Bug_123` → `fix-bug-123`
- `dev/test.new.feature` → `dev-test-new-feature`

## How It Works

### Workflow Trigger
The deployment workflow (`.github/workflows/deploy-branches.yml`) triggers on:
- Push to `main`, `feature/**`, `fix/**`, or `dev/**` branches
- Manual workflow dispatch

### Deployment Steps

1. **Branch Detection**
   - Detects the current branch name from `GITHUB_REF`
   - Normalizes the branch name for URL usage

2. **Path Configuration**
   - Main branch: Uses primary deployment path
   - Other branches: Creates branch-specific path

3. **Build Configuration**
   - Sets `VITE_BASE_PATH` environment variable
   - Vite uses this to configure asset paths correctly

4. **Deployment**
   - Uses `peaceiris/actions-gh-pages@v3` action
   - Deploys to external repository: `piotereks/piotereks`
   - Uses `keep_files: true` to preserve other deployments
   - Deploys to branch-specific `destination_dir`

## Configuration

### Vite Configuration

The `vite.config.js` file supports dynamic base paths via the `VITE_BASE_PATH` environment variable:

```javascript
const base = process.env.VITE_BASE_PATH || '/piotereks/html/parking/'
```

### Supported Branch Patterns

To add support for additional branch patterns, edit `.github/workflows/deploy-branches.yml`:

```yaml
on:
  push:
    branches:
      - main
      - 'feature/**'
      - 'fix/**'
      - 'dev/**'
      - 'your-pattern/**'  # Add new patterns here
```

## Manual Deployment

### Building with Custom Base Path

You can build locally with a custom base path:

```bash
VITE_BASE_PATH="/your/custom/path/" npm run build
```

### Local Testing

To test a branch-specific build locally:

```bash
# Build with branch-specific path
VITE_BASE_PATH="/piotereks/html/parking-feature-test/" npm run build

# Preview the build
npm run preview
```

## Benefits

1. **Isolated Deployments:** Each branch gets its own deployment without affecting others
2. **Easy Testing:** Preview changes in a production-like environment before merging
3. **No Overwrites:** Multiple feature branches can be deployed simultaneously
4. **Clean URLs:** Predictable URL pattern based on branch name
5. **Automatic Cleanup:** Old deployments can be manually removed when branches are deleted

## Limitations

1. **Manual Cleanup:** Branch deployments are not automatically deleted when branches are deleted
2. **Storage:** Each deployment uses GitHub Pages storage space
3. **Branch Names:** Long or complex branch names may create long URLs

## Troubleshooting

### Deployment Failed
- Check that `DEPLOY_TOKEN` secret is set in repository settings
- Verify the external repository (`piotereks/piotereks`) is accessible
- Check workflow logs for specific error messages

### Wrong URL or 404 Error
- Verify the base path matches the deployment destination
- Check that branch name normalization is working correctly
- Ensure assets are built with the correct base path

### Build Fails
- Ensure all dependencies are installed
- Check that the build passes locally with the same base path
- Review build logs for specific errors

## Cleanup

To remove old branch deployments:

1. Clone the deployment repository:
   ```bash
   git clone https://github.com/piotereks/piotereks.git
   ```

2. Remove the branch-specific folder:
   ```bash
   cd piotereks
   git rm -r docs/html/parking-{branch-name}
   git commit -m "Remove deployment for {branch-name}"
   git push
   ```

## Related Files

- `.github/workflows/deploy-branches.yml` - Main deployment workflow
- `vite.config.js` - Vite configuration with dynamic base path
- `README.md` - General deployment documentation
- `CONTRIBUTING.md` - Contributor guide with deployment info
