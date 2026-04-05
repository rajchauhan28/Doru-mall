# Design Spec: Project Reorganization & Security Enhancement

This design document outlines the strategy for separating the `index.html` file into a modular structure and implementing security best practices for Supabase credentials.

## 1. Project Structure Reorganization

The current single-file application will be decomposed into a standard directory structure to improve maintainability and readability.

### New Directory Map
- **`index.html`**: Clean structure, meta tags, and links to external assets.
- **`css/`**
    - `style.css`: All application-specific styles.
- **`js/`**
    - `app.js`: Application logic, view routing, UI rendering, and event handlers.
    - `supabase-config.js`: **(GIT IGNORED)** Local Supabase client initialization with real keys.
    - `supabase-config.example.js`: Template file for Supabase configuration with placeholders.

## 2. Security Strategy for Credentials

To prevent sensitive Supabase credentials from being exposed on GitHub while ensuring the application remains functional upon deployment:

### Local Development
- `js/supabase-config.js` will contain the actual `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- This file will be added to `.gitignore` to prevent it from being committed to the repository.

### GitHub Repository
- `js/supabase-config.example.js` will be committed as a reference for the required configuration structure.
- `.gitignore` will be updated to explicitly ignore any files containing sensitive keys.

### Deployment (Vercel)
- The application will be updated to check for environment variables (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) or fallback to the local config.
- Credentials should be added as environment variables in the Vercel dashboard.

## 3. Implementation Plan Summary

1.  **Preparation**: Create the directory structure (`css/`, `js/`).
2.  **CSS Extraction**: Move all CSS from `index.html` to `css/style.css`.
3.  **JS Extraction**: Move all application logic to `js/app.js`.
4.  **Credential Management**: Create `js/supabase-config.js` and `js/supabase-config.example.js`.
5.  **Refactor index.html**: Clean up the original file, link external assets, and remove inline code.
6.  **Git Cleanup**: Update `.gitignore` and commit the new structure.
