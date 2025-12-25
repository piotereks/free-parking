# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Free Parking Monitor project.

## Active Workflows

### `deploy-branches.yml` - Branch-Specific GitHub Pages Deployment
**Status:** ✅ Active (Primary deployment workflow)

Automatically deploys branches to GitHub Pages with branch-specific subfolders:
- **Main branch** → `docs/html/parking/` (production)
- **Other branches** → `docs/html/parking-{branch-name}/` (preview)

**Triggers:**
- Push to `main`, `feature/**`, `fix/**`, `dev/**`
- Manual workflow dispatch

**Features:**
- Preserves other deployments (`keep_files: true`)
- Dynamic base path configuration
- Branch name normalization for URLs

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed documentation.

---

### `ci.yml` - CI/CD Pipeline
**Status:** ✅ Active

Runs linting, testing, and building on push to main/master or pull requests.

**Triggers:**
- Push to `main` or `master`
- Pull requests to `main` or `master`

**Jobs:**
- `lint-and-test`: Lints code, runs tests with coverage, builds project
- `build`: Production build and deployment (on main/master only)

**Note:** This workflow also deploys to GitHub Pages for main/master branches. Consider removing the deployment step since `deploy-branches.yml` now handles all deployments.

---

## Legacy Workflows

### `deploy_vite.yml` - Deploy (Main Branch Only)
**Status:** ⚠️ Legacy - Consider deprecating

Deploys only the main branch to `docs/html/parking/`.

**Recommendation:** Can be removed since `deploy-branches.yml` handles main branch deployment.

---

### `deploy_vite_loc.yml` - Deploy Local (Non-Main Branches)
**Status:** ⚠️ Legacy - Consider deprecating

Deploys non-main branches to GitHub Pages using the native Pages deployment action.

**Recommendation:** Can be removed since `deploy-branches.yml` provides better branch-specific deployments.

---

### `build.yml` - Deploy (Test Checkout)
**Status:** ⚠️ Testing/Debug workflow

Test workflow for debugging checkout and deployment issues with manual token handling.

**Recommendation:** Can be removed or kept as a reference for troubleshooting.

---

## Migration Path

To fully migrate to the new branch-specific deployment workflow:

1. ✅ **Done:** Created `deploy-branches.yml` with branch-specific deployments
2. ⏳ **Optional:** Remove or disable legacy deployment workflows:
   - `deploy_vite.yml`
   - `deploy_vite_loc.yml`
   - `build.yml`
3. ⏳ **Optional:** Remove deployment step from `ci.yml` (keep only CI/CD testing)

### Disabling a Workflow

To disable a workflow without deleting it, you can either:

1. **Rename it:** Add `.disabled` to the filename
   ```bash
   mv deploy_vite.yml deploy_vite.yml.disabled
   ```

2. **Add condition:** Add a condition that never evaluates to true
   ```yaml
   jobs:
     deploy:
       if: false  # Disabled
   ```

## Workflow Dependencies

- **Secrets required:**
  - `DEPLOY_TOKEN`: Personal access token for deploying to external repository
  
- **Permissions required:**
  - `contents: read`: Read repository contents
  - `pages: write`: Deploy to GitHub Pages
  - `id-token: write`: OIDC token for GitHub Pages

## Troubleshooting

### Workflow Not Triggering
- Check branch patterns in workflow file
- Ensure branch is not in the ignore list
- Verify workflow is enabled in repository settings

### Deployment Fails
- Check `DEPLOY_TOKEN` secret is set correctly
- Verify external repository access
- Review workflow logs for specific errors

### Multiple Deployments Conflict
- If multiple workflows deploy to the same location, they may overwrite each other
- Use `keep_files: true` to preserve other deployments
- Use unique `destination_dir` for each deployment

## Best Practices

1. **Keep workflows focused:** One workflow per purpose (CI, deployment, etc.)
2. **Use caching:** Cache npm dependencies to speed up workflows
3. **Set timeouts:** Prevent workflows from running indefinitely
4. **Use matrix builds:** Test on multiple Node.js versions if needed
5. **Minimize secrets:** Only use secrets where absolutely necessary
6. **Document changes:** Update this README when adding/removing workflows

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
