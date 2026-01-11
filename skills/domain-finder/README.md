# Domain Finder

Bash scripts to check domain availability via the Porkbun API.

## Features

- Check single domain availability with pricing
- Batch check multiple domains with rate limiting
- Displays registration pricing for available domains

## Setup

### 1. Get Porkbun API Keys

1. Go to [porkbun.com/account/api](https://porkbun.com/account/api)
2. Enable API access for your account
3. Generate API key and secret key

### 2. Configure Credentials

Create a `.env` file in this directory:
```bash
PORKBUN_API_KEY="pk1_xxxxxxxx"
PORKBUN_SECRET_KEY="sk1_xxxxxxxx"
```

## Usage

### Check Single Domain

```bash
./check-domain.sh example.land
```

Output:
```
- example.land - AVAILABLE ($12.99/yr)
```
or
```
- example.land - TAKEN
```

### Batch Check Domains

Edit `batch-check.sh` to customize the `DOMAINS` array, then run:

```bash
./batch-check.sh
```

The script includes 11-second delays between requests to respect rate limits.

## Customization

The batch script checks domains across these TLDs by default:
- `.land` - Whimsical territory vibes
- `.studio` - Creative professional
- `.wtf` - Chaotic energy

Edit the `DOMAINS` array in `batch-check.sh` to check your own domain ideas.

## API Notes

- Porkbun API requires a registered account with API access enabled
- Rate limiting: ~1 request per 10 seconds recommended
- Batch checks of 20+ domains take ~4 minutes
