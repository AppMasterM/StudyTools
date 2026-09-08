# StudyTools

Student toolkit built with React and Capacitor.

## Android APK

GitHub Actions builds a debug Android APK automatically.

1. Push/commit the project to the `main` branch.
2. Open the repository's **Actions** tab.
3. Open **Build StudyTools Android APK**.
4. Wait for the workflow to finish.
5. Open the successful run and download the `StudyTools-debug-apk` artifact.

The workflow creates the Android platform on the GitHub runner, so the repository does not need to contain a generated `android/` directory.
