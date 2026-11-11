# Deployment plan

Status on November 11, 2026: the owner approved a public repository and GitHub Pages deployment. The independent public repository `julian-amaro/multiplication-worksheet` has been created; the first deployment is in preparation. No custom domain or paid resource has been created.

## Approved destination

- Owner: `julian-amaro` (the connected GitHub account).
- New repository: `multiplication-worksheet` (name availability to be checked at creation).
- Recommended initial host: GitHub Pages, using only `public/`.
- Recommended no-cost route: a public repository and public HTTPS website. This makes the application source code public. It does not publish browser-stored handwriting or names, which are not in the source.
- No custom domain or paid plan. No existing repository or infrastructure will be reused.
- No connection to Northline code, credentials, deployment projects, or domains.

GitHub Free supports Pages for public repositories. Private repository support depends on the account plan. If public source is not approved, keep the repo private and select an independently approved host or verify existing paid-plan eligibility; do not upgrade or spend money automatically.

## Publication procedure

1. Create the new repository with the approved visibility. Keep the prepared commit and push `main` into that new repository only.
2. Ensure GitHub Actions can access the new repository. Run the Verify worksheet workflow.
3. Set Settings → Pages → Source to GitHub Actions. Restrict the `github-pages` deployment environment to `main`.
4. Manually run Publish worksheet from `main`. This workflow runs syntax checks and all tests before uploading only `public/` and deploying. Ordinary pushes never publish this candidate.
5. Read the successful deployment's actual HTTPS URL; do not treat a guessed URL as a live site. Verify that URL opens outside ChatGPT, assets load under the repository subpath, and ink survives reloading at that origin.
6. Open the URL in physical iPad Safari and run the device checks in TEST_REPORT.md. Record the device, iPadOS/Safari version, results, and any corrections before describing it as device-verified.

No download, ChatGPT login, or app-store installation is needed for the deployed website.

## Rollback and portability

Revert to the last verified commit, rerun verification, then manually publish it. Pages can be unpublished through repository settings. The four public files can also be served unchanged by another static HTTPS host. There is no provider-specific application SDK or backend to migrate. Local browser data is tied to the exact website origin; a host change does not move existing handwriting.

## Current publishing access

Repository creation used the authenticated GitHub website. Source upload uses the connected GitHub tools. Pages setup uses GitHub settings. No unrelated repository or credentials are used.

## References checked November 11, 2026

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
