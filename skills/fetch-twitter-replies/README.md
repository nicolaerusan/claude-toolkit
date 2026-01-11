# Fetch Twitter Replies

A Claude Code skill that fetches all replies to a Twitter/X post and exports them as JSON and CSV files.

## Features

- Extracts all replies to a given tweet using Twitter API v2
- Fetches user metadata (followers, bio, account metrics) for each replier
- Handles pagination automatically to get all replies
- Exports structured JSON and CSV formats ready for analysis

## Output Fields

Each reply includes:

| Field | Description |
|-------|-------------|
| `id` | Tweet ID |
| `text` | Reply text content |
| `author_id` | Author's Twitter ID |
| `author_username` | Author's @handle |
| `author_name` | Author's display name |
| `author_bio` | Author's profile bio |
| `author_followers_count` | Follower count |
| `author_following_count` | Following count |
| `author_tweet_count` | Total tweets |
| `created_at` | Reply timestamp |
| `like_count` | Likes on reply |
| `retweet_count` | Retweets |
| `reply_count` | Replies to this reply |
| `impression_count` | Impressions |

## Setup

### 1. Get a Twitter API Bearer Token

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create a project and app
3. Generate a Bearer Token from the app settings

### 2. Configure the Token

**Option A: Environment Variable**
```bash
export TWITTER_BEARER_TOKEN="your_token_here"
```

**Option B: .env File**
Create a `.env` file in the project root:
```
TWITTER_BEARER_TOKEN=your_token_here
```

**Option C: Config File**
Create `.claude/commands/fetch-twitter-replies.config.json`:
```json
{
  "bearer_token": "your_token_here"
}
```

## Usage

### As a Claude Code Skill

```
/fetch-twitter-replies https://twitter.com/user/status/1234567890
```

Or with just the tweet ID:
```
/fetch-twitter-replies 1234567890
```

### Standalone TypeScript

```bash
cd skills/fetch-twitter-replies
npx ts-node fetch_twitter_replies.ts <tweet_url_or_id>
```

## Output Files

- `twitter_replies_{tweet_id}.json` - Full JSON array
- `twitter_replies_{tweet_id}.csv` - CSV for spreadsheet import

## API Limitations

- Twitter API v2 search only returns tweets from the last 7 days (Basic tier)
- Rate limit: 450 requests per 15 minutes
- Maximum 100 tweets per request (pagination handled automatically)
