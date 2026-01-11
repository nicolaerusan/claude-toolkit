# Agent Guide

This document explains how AI agents (including Claude) should interact with and update this repository.

## Repository Purpose

This is a collection of Claude Code skills - reusable automation scripts that extend Claude's capabilities. Each skill follows a consistent pattern:

1. **Skill Definition** (`.claude/commands/*.md`) - The prompt/instructions that Claude follows
2. **Implementation** (`skills/*/`) - Optional supporting code (TypeScript, Bash, etc.)
3. **Documentation** (`skills/*/README.md`) - Setup and usage instructions

## Adding a New Skill

### Step 1: Create the Skill Definition

Create `.claude/commands/your-skill.md`:

```markdown
---
description: Short description shown in skill list
argument-hint: <required_arg> [optional_arg]
---

# Your Skill Name

Brief explanation of what this skill does.

## Input
The user provided: $ARGUMENTS

## Instructions

1. **Step one** - Describe what to do
2. **Step two** - Next action
3. **Step three** - Final steps

## Example

Show example usage and output.
```

### Step 2: Add Implementation (if needed)

If the skill requires code beyond what Claude can execute directly:

1. Create `skills/your-skill/` directory
2. Add implementation files
3. Create `skills/your-skill/README.md` with setup instructions

### Step 3: Handle Credentials Securely

- Never commit API keys or tokens
- Use environment variables or config files
- Add sensitive files to `.gitignore`
- Provide `.config.example.json` templates

### Step 4: Update Documentation

1. Add the skill to the table in `README.md`
2. Ensure the skill README covers:
   - What it does
   - Required credentials and setup
   - Usage examples
   - Output format

## Modifying Existing Skills

When updating a skill:

1. **Test changes** before committing
2. **Update documentation** if behavior changes
3. **Maintain backward compatibility** when possible
4. **Don't break credential patterns** - keep existing config file locations

## File Patterns

### Gitignore Rules

These files should never be committed:
- `.env`, `.env.*` - Environment variables
- `*.config.json` in `.claude/commands/` - User credentials
- Generated output files (`twitter_replies_*.json`, `calendar_reflection_*.md`)

### Config Examples

Always provide example config files:
- `your-skill.config.example.json` - Template with placeholder values
- Document required fields in the README

## Code Style

### TypeScript Skills

- Use environment variables for credentials
- Accept arguments via command line
- Provide clear error messages when credentials are missing

### Bash Skills

- Source `.env` from the script directory
- Check for required environment variables
- Use clear variable names

### Skill Definitions

- Use clear, numbered instructions
- Include example API requests/responses
- Document rate limits and API constraints
- Specify output file formats

## Testing

Before committing:

1. Verify credentials load correctly from all supported sources
2. Test with sample inputs
3. Confirm output files are generated correctly
4. Check that sensitive data isn't exposed

## Questions?

If you're an AI agent and unsure about something:
- Check existing skills for patterns to follow
- Prioritize security (never expose credentials)
- When in doubt, ask the user for clarification
