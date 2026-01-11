---
description: Fetch Google Calendar events for the past year and create a weekly reflection markdown
argument-hint: [--weeks=N]
---

# Calendar Reflection

Fetch your Google Calendar events for the past year (or specified weeks) and generate a markdown file organized by week for reflection purposes.

## Input
The user provided: $ARGUMENTS

Parse optional arguments:
- `--weeks=N` - Limit to last N weeks (default: 52 weeks / 1 year)

## Instructions

1. **Get Google OAuth Credentials** (check in this order):
   - First, check `.claude/commands/calendar-reflection.config.json` for credentials
   - If not found, check `.env` file in project root for `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
   - If not found, check environment variables
   - If none found, print this message and stop:
     ```
     Google Calendar credentials not found.

     To set up credentials:
     1. Read the setup guide: .claude/commands/calendar-reflection-setup.md
     2. Create .claude/commands/calendar-reflection.config.json with your credentials

     Example config:
     {
       "client_id": "your-client-id.apps.googleusercontent.com",
       "client_secret": "your-client-secret",
       "refresh_token": "your-refresh-token"
     }
     ```

2. **Get an Access Token** using the refresh token:
   ```bash
   curl -X POST "https://oauth2.googleapis.com/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id={client_id}&client_secret={client_secret}&refresh_token={refresh_token}&grant_type=refresh_token"
   ```
   Extract `access_token` from the response.

3. **Calculate the date range**:
   - `timeMax`: Current date/time in ISO 8601 format
   - `timeMin`: Current date minus N weeks (default 52)

4. **Fetch events from Google Calendar API**:
   - Endpoint: `https://www.googleapis.com/calendar/v3/calendars/primary/events`
   - Parameters:
     - `timeMin`: Start of date range
     - `timeMax`: End of date range
     - `maxResults`: 2500
     - `singleEvents`: true (expands recurring events into instances)
     - `orderBy`: startTime
   - Handle pagination using `nextPageToken` to get ALL events

5. **Load exclusion keywords** from config (default: `["gym", "workout", "exercise", "fitness"]`)

6. **Process events**:
   - Filter out events whose summary contains any exclusion keyword (case-insensitive)
   - Separate events into two groups:
     - **One-time events**: Events without `recurringEventId`
     - **Recurring events**: Events with `recurringEventId` (group by `recurringEventId`)
   - Group all events by week (Monday-Sunday)

7. **Generate markdown output** with this structure:
   ```markdown
   # Calendar Reflection: {YEAR}

   ## Week {N} ({Mon Date} - {Sun Date})

   ### {Day of Week}, {Full Date}
   - **{Event Title}** ({Start Time} - {End Time})
     - Attendees: {comma-separated names}
     - Notes: {description if short and meaningful}

   #### Recurring This Week
   - {Event Title} ({typical day/time})
   ```

   **Note about descriptions**: Only include notes/descriptions if they are:
   - Under 100 characters after stripping HTML
   - NOT auto-generated (skip if description contains "This event was created from an email" or similar boilerplate)
   - NOT flight/booking details (skip if contains "Booking reference", "Flight number", "Operated by", etc.)

8. **Save the output file**:
   - Filename: `calendar_reflection_{YEAR}.md` in current directory
   - If spanning multiple years, use the most recent year

9. **Report results** to the user:
   - Total events processed
   - Number of weeks covered
   - Number of recurring vs one-time events
   - Output file path

## API Notes

- Google Calendar API has a quota of 1,000,000 queries per day (plenty for this use case)
- Maximum 2500 events per request, use pagination for more
- `singleEvents=true` expands recurring events into individual instances
- Each instance has `recurringEventId` pointing to the parent event

## Example API Request

```bash
curl -X GET "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2024-01-01T00:00:00Z&timeMax=2025-01-01T00:00:00Z&maxResults=2500&singleEvents=true&orderBy=startTime" \
  -H "Authorization: Bearer {access_token}"
```

## Example Response Structure

```json
{
  "items": [
    {
      "id": "abc123",
      "summary": "Team Meeting",
      "start": {
        "dateTime": "2024-06-15T10:00:00-07:00"
      },
      "end": {
        "dateTime": "2024-06-15T11:00:00-07:00"
      },
      "attendees": [
        {"email": "john@example.com", "displayName": "John Doe"},
        {"email": "jane@example.com", "displayName": "Jane Smith"}
      ],
      "description": "Weekly sync meeting",
      "recurringEventId": "parent_event_id_xyz"
    },
    {
      "id": "def456",
      "summary": "KP Visit",
      "start": {
        "dateTime": "2024-06-16T14:00:00-07:00"
      },
      "end": {
        "dateTime": "2024-06-16T15:00:00-07:00"
      },
      "description": "Annual checkup"
    }
  ],
  "nextPageToken": "token_for_next_page"
}
```

## Config Options

The config file supports these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `client_id` | Yes | Google OAuth client ID |
| `client_secret` | Yes | Google OAuth client secret |
| `refresh_token` | Yes | OAuth refresh token (long-lived) |
| `exclude_keywords` | No | Array of keywords to exclude (default: gym, workout, exercise, fitness) |
| `exclude_calendars` | No | Array of calendar IDs to exclude |
| `max_description_length` | No | Max characters for descriptions before excluding (default: 100) |
