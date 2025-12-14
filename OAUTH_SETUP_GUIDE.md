# OAuth SSO Setup Guide

This guide explains how to set up Single Sign-On with Google and Apple for the Soccer Betting Game.

## Overview

Users can now log in using their Google or Apple accounts. The system will:
1. Verify the OAuth token with the provider
2. Create a new account automatically (with 1000 chips bonus)
3. Or log in to existing account if email matches

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in application details:
   - App name: Soccer Betting Game
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes: `openid`, `profile`, `email`
5. Add test users if in testing mode

### 3. Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add authorized JavaScript origins:
   ```
   http://localhost:4200
   http://soccer-query-app-wz.s3-website-us-east-1.amazonaws.com
   ```
5. Add authorized redirect URIs:
   ```
   http://localhost:4200/betting/login
   http://soccer-query-app-wz.s3-website-us-east-1.amazonaws.com/betting/login
   ```
6. Copy the **Client ID**

### 4. Update Frontend Configuration

Edit `/soccerUI/src/app/services/oauth.service.ts`:

```typescript
private config: OAuthConfig = {
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Paste your Client ID here
    redirectUri: window.location.origin + '/betting/login',
    scope: 'openid profile email'
  },
  // ...
};
```

### 5. Update Backend Configuration

Add to `/bettingAPI/.env`:

```bash
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

Or for Lambda, update SAM template.yaml:

```yaml
Environment:
  Variables:
    GOOGLE_CLIENT_ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

## Apple Sign In Setup

### 1. Create Apple Developer Account

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Go to **Certificates, Identifiers & Profiles**

### 2. Register App ID

1. Go to **Identifiers** → **+** (Add)
2. Select **App IDs** → Continue
3. Select **App** → Continue
4. Configure:
   - Description: Soccer Betting Game
   - Bundle ID: com.soccerbetting.app
   - Enable **Sign In with Apple**
5. Register

### 3. Create Service ID

1. Go to **Identifiers** → **+** (Add)
2. Select **Services IDs** → Continue
3. Configure:
   - Description: Soccer Betting Web Service
   - Identifier: com.soccerbetting.service
4. Enable **Sign In with Apple**
5. Configure domains and return URLs:
   - Domains: `soccer-query-app-wz.s3-website-us-east-1.amazonaws.com`
   - Return URLs: `http://soccer-query-app-wz.s3-website-us-east-1.amazonaws.com/betting/login`
6. Save

### 4. Create Private Key

1. Go to **Keys** → **+** (Add)
2. Configure:
   - Key Name: Soccer Betting Sign In Key
   - Enable **Sign In with Apple**
   - Configure with your App ID
3. Download the `.p8` private key file (save securely!)
4. Note the **Key ID**

### 5. Update Frontend Configuration

Edit `/soccerUI/src/app/services/oauth.service.ts`:

```typescript
private config: OAuthConfig = {
  // ...
  apple: {
    clientId: 'com.soccerbetting.service', // Your Service ID
    redirectUri: window.location.origin + '/betting/login',
    scope: 'name email'
  }
};
```

### 6. Update Backend Configuration

Apple Sign In requires server-side token verification with JWT. This is more complex and requires:
- Apple Team ID
- Service ID
- Key ID
- Private Key (.p8 file)

Add to `/bettingAPI/.env`:

```bash
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_SERVICE_ID=com.soccerbetting.service
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY_PATH=./apple-sign-in-key.p8
```

## Database Migration

Run the migration to add OAuth support:

```bash
# Connect to your RDS database
PGPASSWORD='BettingGame2025' psql -h betting-game-db.ckp2ggowssdy.us-east-1.rds.amazonaws.com -U bettingadmin -d betting -f bettingDB/migration/25.1.2_oauth_support.sql
```

## Testing

### Local Testing (localhost)

1. Update OAuth service with localhost redirect
2. Start Angular dev server: `npm start`
3. Start Node.js API: `npm start` (in bettingAPI)
4. Navigate to http://localhost:4200/betting/login
5. Click "Continue with Google" or "Continue with Apple"
6. Complete OAuth flow
7. Verify user is created in database with 1000 chips

### Production Testing

1. Deploy frontend to S3: `npm run build && aws s3 sync dist/soccer-ui s3://soccer-query-app-wz --delete`
2. Deploy backend to Lambda: `sam build --use-container && sam deploy`
3. Navigate to http://soccer-query-app-wz.s3-website-us-east-1.amazonaws.com/betting/login
4. Click "Continue with Google" or "Continue with Apple"
5. Complete OAuth flow
6. Verify user is created with 1000 chips

## Security Considerations

### Production Checklist

- [ ] Use HTTPS for all OAuth redirects (CloudFront + ACM certificate)
- [ ] Verify OAuth tokens on backend (not just frontend)
- [ ] Store OAuth secrets in AWS Secrets Manager (not environment variables)
- [ ] Implement rate limiting for OAuth endpoints
- [ ] Add logging for OAuth attempts
- [ ] Monitor for suspicious OAuth activity
- [ ] Regularly rotate API keys
- [ ] Review OAuth scopes (request minimum necessary)
- [ ] Implement CSRF protection
- [ ] Validate redirect URIs strictly

### Environment Variables

Never commit these to git:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (if using backend flow)
- `APPLE_TEAM_ID`
- `APPLE_SERVICE_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`

Use:
- AWS Secrets Manager for production
- `.env` file (gitignored) for local development
- SAM template environment variables for Lambda

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Check authorized redirect URIs in Google Cloud Console
- Ensure URL matches exactly (including http/https)

**Error: "invalid_client"**
- Verify Client ID is correct
- Check if API is enabled
- Ensure OAuth consent screen is configured

### Apple Sign In Issues

**Error: "invalid_client"**
- Verify Service ID is correct
- Check domain and return URL configuration
- Ensure Sign In with Apple is enabled for App ID

**Error: "invalid_request"**
- Check if private key is correct
- Verify Key ID matches
- Ensure JWT signature is valid

### Backend Issues

**Error: "Invalid Google token"**
- Token may be expired (tokens expire after 1 hour)
- Client ID mismatch
- Token was issued for different audience

**Error: "Database error"**
- Check database migration was applied
- Verify OAuth columns exist in users table
- Check database connection

## User Experience Flow

1. User clicks "Continue with Google" or "Continue with Apple"
2. Redirected to OAuth provider (Google/Apple)
3. User logs in to their account (if not already logged in)
4. User grants permissions (first time only)
5. Redirected back to app with OAuth token
6. Frontend sends token to backend for verification
7. Backend verifies token with provider
8. Backend creates user account (if new) or logs in existing user
9. User receives JWT token and 1000 chips (if new account)
10. Redirected to card shop

## Future Enhancements

- [ ] Add Facebook OAuth
- [ ] Add Twitter OAuth
- [ ] Add Microsoft OAuth
- [ ] Remember OAuth provider for returning users
- [ ] Allow linking multiple OAuth providers to one account
- [ ] Add profile photos from OAuth providers
- [ ] Implement OAuth refresh tokens
- [ ] Add "Sign out of all devices" feature

## Support

For issues, contact the development team or check:
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- Apple Sign In Docs: https://developer.apple.com/sign-in-with-apple/
- JWT.io for token debugging: https://jwt.io/
