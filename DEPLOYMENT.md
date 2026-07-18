# Deployment Guide: Exposing Your Frequency App Online (Render.com)

Since the judges will need to test the app from their own devices (e.g. phones), deploying the application online is highly recommended. We have configured the repository to support a fast, free deployment on **Render.com**.

Follow these simple steps to deploy:

## Step 1: Push Your Code to GitHub
1. Make sure all your changes are committed to git:
   ```bash
   git add .
   git commit -m "Configure for Render deployment and populate data"
   ```
2. Push your branch (`test1` or `main`) to your public/private GitHub repository.

## Step 2: Set Up Render.com (Takes 2 Minutes)
1. Go to [Render.com](https://render.com/) and log in (you can sign in with your GitHub account).
2. Click the **"New +"** button in the top right, and select **"Web Service"**.
3. Under **"Connect a repository"**, select your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `frequency-chat` (or any name you prefer)
   - **Region**: Select the region closest to you
   - **Branch**: `test1` (or the branch you pushed your changes to)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: `Free`
5. Click **"Deploy Web Service"** at the bottom.

## Step 3: Test and Share!
1. Render will build and deploy the app (usually takes ~1-2 minutes).
2. Once complete, Render will give you a public URL (e.g., `https://frequency-chat-xxxx.onrender.com`).
3. You can open this URL on your laptop and your phone. They will connect to the same real-time room, allowing you to demo pairing and chatting live!

---

*Note: On Render's Free Plan, the server will "spin down" after 15 minutes of inactivity. If the page takes a long time to open for the first time, wait about 50 seconds for the server to wake up.*
