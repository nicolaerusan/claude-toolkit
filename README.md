# Claude Toolkit

A collection of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills for personal productivity and data analysis.

## Skills

| Skill | Description |
|-------|-------------|
| [fetch-twitter-replies](skills/fetch-twitter-replies/) | Fetch all replies to a Twitter/X post and export as JSON/CSV |
| [calendar-reflection](skills/calendar-reflection/) | Generate weekly markdown reflections from Google Calendar |
| [domain-finder](skills/domain-finder/) | Check domain availability via Porkbun API |

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/claude-toolkit.git
cd claude-toolkit
```

### 2. Configure Credentials

Each skill requires its own API credentials. See the individual skill READMEs for setup instructions.

Create a `.env` file in the project root:
```bash
# Twitter API (for fetch-twitter-replies)
TWITTER_BEARER_TOKEN=your_token_here

# Porkbun API (for domain-finder)
PORKBUN_API_KEY=pk1_xxxxxxxx
PORKBUN_SECRET_KEY=sk1_xxxxxxxx
```

For Google Calendar, see the [setup guide](.claude/commands/calendar-reflection-setup.md).

### 3. Use with Claude Code

The skills are installed as Claude Code slash commands:

```bash
/fetch-twitter-replies https://twitter.com/user/status/1234567890
/calendar-reflection --weeks=12
```

## Directory Structure

```
claude-toolkit/
├── .claude/
│   └── commands/              # Claude Code skill definitions
│       ├── fetch-twitter-replies.md
│       ├── calendar-reflection.md
│       └── calendar-reflection-setup.md
├── skills/
│   ├── fetch-twitter-replies/
│   │   ├── fetch_twitter_replies.ts
│   │   ├── .env.example
│   │   └── README.md
│   ├── calendar-reflection/
│   │   └── README.md
│   └── domain-finder/
│       ├── check-domain.sh
│       ├── batch-check.sh
│       ├── .env.example
│       └── README.md
├── .env.example               # Template for all credentials
├── .gitignore
├── README.md
└── agents.md                  # Guide for AI agents
```

## Adding New Skills

1. Create a skill definition in `.claude/commands/your-skill.md`
2. Add implementation code in `skills/your-skill/` if needed
3. Create a README documenting setup and usage
4. Update this README to list the new skill

See [agents.md](agents.md) for detailed contribution guidelines.

## License

MIT
