# The World I Hear - Interactive Wall

This project contains the frontend interfaces for "The World I Hear" interactive wall exhibition.

## How to Run Locally

You can run this project locally using one of the following methods:

**Method 1: Live Server (VS Code)**
1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click on `public/index.html` (or `mobile.html`, `admin.html`) and select **"Open with Live Server"**.

**Method 2: Simple Local Server**
If you have Node.js or Python installed, you can serve the `public/` directory:
- **Node.js**: `npx serve public`
- **Python**: `python -m http.server -d public`

## Google Apps Script Backend

The project has migrated from a local JSON database (`db/`) to a **Google Apps Script** backend using Google Sheets. 
- The frontend (e.g., `app.js`, `mobile.js`, `admin.js`) communicates directly with the deployed Google Apps Script URL.
- This allows the app to fetch, submit, and delete sticky notes dynamically without needing a local Node.js server.

## GitHub Pages Deployment

This repository is configured to automatically deploy everything inside the `public/` folder to GitHub Pages whenever changes are pushed to the `main` branch. 
