# Calendar Reflection

A Claude Code skill that fetches your Google Calendar events and generates a weekly markdown reflection for the past year.

## Features

- Fetches all calendar events for a specified period (default: 52 weeks)
- Organizes events by week with daily breakdowns
- Separates one-time events from recurring events
- Filters out routine events (gym, workouts, etc.)
- Extracts attendee names and meaningful descriptions
- Generates clean markdown output for journaling/reflection

## Output Format

```markdown
# Calendar Reflection: 2024

## Week 1 (Jan 1 - Jan 7)

### Monday, January 1
- **Team Standup** (9:00 AM - 9:30 AM)
  - Attendees: John, Sarah, Mike

### Tuesday, January 2
- **Client Meeting** (2:00 PM - 3:00 PM)
  - Attendees: Client Team
  - Notes: Q1 planning discussion

#### Recurring This Week
- Daily Standup (weekdays 9:00 AM)
```

## Setup

Setting up Google Calendar API requires OAuth credentials. Follow the detailed guide:

**[Setup Guide](../../.claude/commands/calendar-reflection-setup.md)**

### Quick Overview

1. Create a Google Cloud Project
2. Enable the Google Calendar API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Get a refresh token
6. Create config file with credentials

### Configuration

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

## Usage

### As a Claude Code Skill

```bash
# Last 52 weeks (default)
/calendar-reflection

# Last 12 weeks
/calendar-reflection --weeks=12
```

## Config Options

| Field | Required | Description |
|-------|----------|-------------|
| `client_id` | Yes | Google OAuth client ID |
| `client_secret` | Yes | Google OAuth client secret |
| `refresh_token` | Yes | OAuth refresh token |
| `exclude_keywords` | No | Keywords to filter out (default: gym, workout, exercise, fitness) |
| `exclude_calendars` | No | Calendar IDs to exclude |
| `max_description_length` | No | Max description length before truncating (default: 100) |

## Output File

Generated file: `calendar_reflection_{YEAR}.md` in the current directory.

## API Notes

- Uses Google Calendar API v3
- Requires `calendar.readonly` scope
- Rate limit: 1,000,000 queries/day (more than enough)
- Handles pagination for large calendars

## Security

- Never commit `calendar-reflection.config.json` (it's in .gitignore)
- Refresh tokens provide ongoing access - treat like passwords
- Revoke access anytime at [Google Account Permissions](https://myaccount.google.com/permissions)
