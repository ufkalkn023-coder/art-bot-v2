# GitHub Deployment Guide

This guide will help you upload your Art Bot code to GitHub.

## Prerequisites

- You must have `git` installed on your computer.
- You must have a GitHub account.

## Step 1: Initialize Git Repository

Open your terminal in the project folder (`/Users/ufuk/Desktop/artbot-main`) and run:

```bash
git init
```

## Step 2: Create .gitignore

Ensure you have a `.gitignore` file to prevent uploading sensitive data (API keys) and heavy folders.
Create or edit `.gitignore` with the following content:

```text
node_modules/
.env
.DS_Store
backup/
data/temp/
```

## Step 3: Commit Your Code

Add all files to the staging area and commit them:

```bash
git add .
git commit -m "Initial commit: Art Bot with Evolution Series, Quartet Mode, and Safety Features"
```

## Step 4: Create a Repository on GitHub

1. Go to [github.com/new](https://github.com/new).
2. Enter a repository name (e.g., `art-bot-v2`).
3. Choose **Private** (recommended since you have logic you might want to keep private, though keys are in .env).
4. Click **Create repository**.

## Step 5: Push to GitHub

Copy the commands provided by GitHub under "…or push an existing repository from the command line" and run them. They will look like this:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/art-bot-v2.git
git push -u origin main
```

*(Replace `YOUR_USERNAME` and `art-bot-v2` with your actual details)*

## Step 6: Deployment (Optional)

To run this bot 24/7, you can deploy it to a VPS (like DigitalOcean, Hetzner) or a cloud service (Render, Heroku).

- **Render/Heroku**: Connect your GitHub repo. Add your environment variables (API keys) in the dashboard.
- **VPS**: Clone the repo, create a `.env` file with your keys, run `npm install`, and use `pm2` to keep it running (`pm2 start index.js --name artbot`).

## Important Notes

- **NEVER** upload your `.env` file to GitHub. It contains your private API keys.
- If you make changes, run `git add .`, `git commit -m "message"`, and `git push`.
