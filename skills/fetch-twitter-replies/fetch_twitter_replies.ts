import * as fs from "fs";
import * as path from "path";

// Load bearer token from environment variable or config file
function getBearerToken(): string {
  // First, try environment variable
  if (process.env.TWITTER_BEARER_TOKEN) {
    return process.env.TWITTER_BEARER_TOKEN;
  }

  // Then, try config file
  const configPath = path.join(
    __dirname,
    ".claude/commands/fetch-twitter-replies.config.json"
  );
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.bearer_token) {
      return config.bearer_token;
    }
  }

  throw new Error(
    "TWITTER_BEARER_TOKEN not found. Set it as an environment variable or in .claude/commands/fetch-twitter-replies.config.json"
  );
}

// Get tweet ID from command line argument
function getTweetId(): string {
  const arg = process.argv[2];
  if (!arg) {
    throw new Error("Usage: npx ts-node fetch_twitter_replies.ts <tweet_url_or_id>");
  }

  // Extract ID from URL if needed
  const match = arg.match(/status\/(\d+)/);
  return match ? match[1] : arg;
}

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  in_reply_to_user_id?: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
}

interface User {
  id: string;
  username: string;
  name: string;
  description: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface ApiResponse {
  data?: Tweet[];
  includes?: {
    users?: User[];
  };
  meta?: {
    next_token?: string;
    result_count?: number;
  };
  errors?: Array<{ message: string }>;
}

interface ProcessedReply {
  id: string;
  text: string;
  author_id: string;
  author_username: string;
  author_name: string;
  author_bio: string;
  author_followers_count: number;
  author_following_count: number;
  author_tweet_count: number;
  created_at: string;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  impression_count: number;
}

async function fetchReplies(
  bearerToken: string,
  tweetId: string
): Promise<{
  tweets: Tweet[];
  users: Map<string, User>;
}> {
  const headers = { Authorization: `Bearer ${bearerToken}` };
  const baseUrl = "https://api.twitter.com/2/tweets/search/recent";

  const allTweets: Tweet[] = [];
  const allUsers = new Map<string, User>();
  let nextToken: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      query: `conversation_id:${tweetId}`,
      "tweet.fields": "author_id,created_at,public_metrics,in_reply_to_user_id",
      expansions: "author_id",
      "user.fields": "username,name,public_metrics,description",
      max_results: "100",
    });

    if (nextToken) {
      params.set("next_token", nextToken);
    }

    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`Error: ${response.status}`);
      const text = await response.text();
      console.error(text);
      break;
    }

    const data: ApiResponse = await response.json();

    if (data.errors) {
      console.error("API Errors:", data.errors);
      break;
    }

    // Collect tweets
    if (data.data) {
      allTweets.push(...data.data);
    }

    // Collect users (indexed by id)
    if (data.includes?.users) {
      for (const user of data.includes.users) {
        allUsers.set(user.id, user);
      }
    }

    // Check for more pages
    nextToken = data.meta?.next_token;
    console.log(
      `Fetched ${data.data?.length ?? 0} tweets, total so far: ${allTweets.length}`
    );

    if (!nextToken) {
      break;
    }
  }

  return { tweets: allTweets, users: allUsers };
}

function processData(
  tweets: Tweet[],
  users: Map<string, User>
): ProcessedReply[] {
  return tweets.map((tweet) => {
    const user = users.get(tweet.author_id);
    const userMetrics = user?.public_metrics ?? {
      followers_count: 0,
      following_count: 0,
      tweet_count: 0,
    };
    const tweetMetrics = tweet.public_metrics ?? {
      like_count: 0,
      retweet_count: 0,
      reply_count: 0,
      impression_count: 0,
    };

    return {
      id: tweet.id ?? "",
      text: tweet.text ?? "",
      author_id: tweet.author_id ?? "",
      author_username: user?.username ?? "",
      author_name: user?.name ?? "",
      author_bio: user?.description ?? "",
      author_followers_count: userMetrics.followers_count ?? 0,
      author_following_count: userMetrics.following_count ?? 0,
      author_tweet_count: userMetrics.tweet_count ?? 0,
      created_at: tweet.created_at ?? "",
      like_count: tweetMetrics.like_count ?? 0,
      retweet_count: tweetMetrics.retweet_count ?? 0,
      reply_count: tweetMetrics.reply_count ?? 0,
      impression_count: tweetMetrics.impression_count ?? 0,
    };
  });
}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function saveFiles(
  data: ProcessedReply[],
  tweetId: string
): { jsonFile: string; csvFile: string } {
  const jsonFile = `twitter_replies_${tweetId}.json`;
  const csvFile = `twitter_replies_${tweetId}.csv`;

  // Save JSON
  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved JSON: ${jsonFile}`);

  // Save CSV
  if (data.length > 0) {
    const headers = Object.keys(data[0]) as (keyof ProcessedReply)[];
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => escapeCSV(row[h])).join(",")),
    ].join("\n");

    fs.writeFileSync(csvFile, csvContent, "utf-8");
    console.log(`Saved CSV: ${csvFile}`);
  }

  return {
    jsonFile: path.resolve(jsonFile),
    csvFile: path.resolve(csvFile),
  };
}

async function main() {
  const bearerToken = getBearerToken();
  const tweetId = getTweetId();

  console.log(`Fetching replies to tweet ${tweetId}...`);
  const { tweets, users } = await fetchReplies(bearerToken, tweetId);

  if (tweets.length === 0) {
    console.log("No replies found.");
    return;
  }

  console.log(`\nProcessing ${tweets.length} replies...`);
  const processed = processData(tweets, users);

  const { jsonFile, csvFile } = saveFiles(processed, tweetId);

  console.log(`\n=== Summary ===`);
  console.log(`Total replies fetched: ${processed.length}`);
  console.log(`JSON file: ${jsonFile}`);
  console.log(`CSV file: ${csvFile}`);
}

main().catch(console.error);
