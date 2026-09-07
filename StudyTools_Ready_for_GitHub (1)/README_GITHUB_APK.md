# StudyTools — GitHub APK Build

This project is prepared for building an Android debug APK with GitHub Actions.

## Important
Do not upload `node_modules/` or generated build/cache folders.

## GitHub
1. Create a repository named `StudyTools`.
2. Upload the contents of this folder to the repository.
3. Commit to the `main` branch.
4. Open **Actions**.
5. Run **Build StudyTools Android APK** (or push to `main`).
6. Open the completed workflow run.
7. Under **Artifacts**, download `StudyTools-debug-apk`.
8. The APK inside is `app-debug.apk`.

Package ID: `com.studytools.app`

The workflow creates the Android platform automatically, so Android Studio is not required for this build.
