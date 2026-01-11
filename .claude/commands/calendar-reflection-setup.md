# Google Calendar API Setup Guide

This guide walks you through setting up Google Calendar API credentials for the `/calendar-reflection` skill.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "Calendar Reflection")
5. Click "Create"
6. Wait for the project to be created, then select it

## Step 2: Enable the Google Calendar API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API"
4. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace org)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Calendar Reflection
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Find and select: `https://www.googleapis.com/auth/calendar.readonly`
8. Click "Update", then "Save and Continue"
9. On "Test users", click "Add Users" and add your email
10. Click "Save and Continue", then "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Desktop app" as the application type
4. Name it (e.g., "Calendar Reflection Desktop")
5. Click "Create"
6. You'll see your **Client ID** and **Client Secret** - save these!
7. Click "Download JSON" to save the credentials file (optional backup)

## Step 5: Get a Refresh Token

You need a refresh token to access the API without re-authenticating each time.

### Option A: Using oauth2l (Recommended)

1. Install oauth2l:
   ```bash
   # macOS
   brew install oauth2l

   # Or with Go
   go install github.com/google/oauth2l@latest
   ```

2. Create a credentials file `client_secret.json` with your credentials:
   ```json
   {
     "installed": {
       "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
       "client_secret": "YOUR_CLIENT_SECRET",
       "redirect_uris": ["http://localhost"]
     }
   }
   ```

3. Run oauth2l to get tokens:
   ```bash
   oauth2l fetch --credentials client_secret.json --scope calendar.readonly --output_format json
   ```

4. This opens a browser for authentication. After authorizing, you'll get a JSON response containing the refresh token.

### Option B: Manual OAuth Flow

1. Construct this authorization URL (replace YOUR_CLIENT_ID):
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly&access_type=offline&prompt=consent
   ```

2. Open this URL in your browser and authorize the app

3. You'll be redirected to `http://localhost/?code=AUTHORIZATION_CODE`
   - Copy the `code` parameter from the URL

4. Exchange the code for tokens:
   ```bash
   curl -X POST "https://oauth2.googleapis.com/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=AUTHORIZATION_CODE" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=http://localhost"
   ```

5. The response contains your `refresh_token` - save it!

## Step 6: Configure the Skill

Create `.claude/commands/calendar-reflection.config.json`:

```json
{
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN",
  "exclude_keywords": ["gym", "workout", "exercise", "fitness"],
  "exclude_calendars": []
}
```

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure redirect_uri matches exactly: `http://localhost`
- Check that you added yourself as a test user

### "Token has been expired or revoked"
- Generate a new refresh token using Step 5
- Make sure you used `access_type=offline` and `prompt=consent`

### "Request had insufficient authentication scopes"
- Ensure `calendar.readonly` scope is enabled in OAuth consent screen
- Regenerate refresh token with correct scope

### "Quota exceeded"
- Google Calendar API has generous limits (1M queries/day)
- If you hit limits, wait and retry

## Security Notes

- Never commit `calendar-reflection.config.json` to git (it's in .gitignore)
- The refresh token provides ongoing access - treat it like a password
- You can revoke access anytime at [Google Account Permissions](https://myaccount.google.com/permissions)
