---
description: Fetch all replies to a Twitter/X post and export as JSON and CSV
argument-hint: <tweet_url_or_id>
---

# Fetch Twitter Replies

Fetch all replies to the specified Twitter/X post and save them as both JSON and CSV files.

## Input
The user provided: $ARGUMENTS

## Instructions

1. **Extract the Tweet ID** from the input:
   - If it's a URL like `https://twitter.com/user/status/1234567890` or `https://x.com/user/status/1234567890`, extract the numeric ID
   - If it's just a number, use it directly

2. **Get the Bearer Token** (check in this order):
   - First, read from `.env` file in project root (look for `TWITTER_BEARER_TOKEN=...`)
   - If not found, check `.claude/commands/fetch-twitter-replies.config.json` for `{"bearer_token": "..."}`
   - If not found, check environment variable `TWITTER_BEARER_TOKEN`
   - If none found, ask the user to create `.env` with `TWITTER_BEARER_TOKEN=your_token`

3. **Fetch replies using the Twitter API v2**:
   - Use the search endpoint: `https://api.twitter.com/2/tweets/search/recent`
   - Query: `conversation_id:{tweet_id}`
   - Tweet fields: `author_id,created_at,public_metrics,in_reply_to_user_id`
   - Expansions: `author_id` (to get user details)
   - User fields: `username,name,public_metrics,description` (gets followers, bio, etc.)
   - Handle pagination to get ALL replies (use `next_token`)

4. **Process the data** into a structured format with these fields:
   - `id`: Tweet ID
   - `text`: Reply text content
   - `author_id`: Author's Twitter ID
   - `author_username`: Author's @handle
   - `author_name`: Author's display name
   - `author_bio`: Author's profile description/bio
   - `author_followers_count`: Number of followers
   - `author_following_count`: Number of accounts they follow
   - `author_tweet_count`: Total tweets by this user
   - `created_at`: Timestamp of the reply
   - `like_count`: Number of likes on this reply
   - `retweet_count`: Number of retweets
   - `reply_count`: Number of replies to this reply
   - `impression_count`: Number of impressions (if available)

5. **Save the output files**:
   - `twitter_replies_{tweet_id}.json` - Full JSON array of reply objects
   - `twitter_replies_{tweet_id}.csv` - CSV with headers, ready for Google Sheets/Clay import

6. **Report results** to the user:
   - Total number of replies fetched
   - File paths for both JSON and CSV
   - Any errors or rate limit warnings

## API Notes

- Twitter API v2 search only returns tweets from the last 7 days on Basic tier
- Rate limit: 450 requests per 15 minutes (Basic tier)
- If rate limited, wait and retry with exponential backoff
- Maximum 100 tweets per request, use pagination for more

## Example API Request

```bash
curl -X GET "https://api.twitter.com/2/tweets/search/recent?query=conversation_id:1234567890&tweet.fields=author_id,created_at,public_metrics,in_reply_to_user_id&expansions=author_id&user.fields=username,name,public_metrics,description&max_results=100" \
  -H "Authorization: Bearer $TWITTER_BEARER_TOKEN"
```

## Example Response Structure

The API returns users in an `includes.users` array that must be joined with tweets by `author_id`:

```json
{
  "data": [
    {
      "id": "123",
      "text": "Great post!",
      "author_id": "456",
      "created_at": "2024-01-15T10:30:00.000Z",
      "public_metrics": {
        "like_count": 5,
        "retweet_count": 1,
        "reply_count": 0
      }
    }
  ],
  "includes": {
    "users": [
      {
        "id": "456",
        "username": "example_user",
        "name": "Example User",
        "description": "This is my bio",
        "public_metrics": {
          "followers_count": 1500,
          "following_count": 200,
          "tweet_count": 3400
        }
      }
    ]
  }
}
```
