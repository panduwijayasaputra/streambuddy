# StreamBuddy Environment Setup Guide

This guide provides comprehensive instructions for setting up environment variables across different environments in the StreamBuddy project.

## 📁 Environment Files Structure

```
StreamBuddy/
├── env.example                    # Root environment template
├── apps/
│   ├── frontend/
│   │   ├── env.example           # Frontend environment template
│   │   ├── env.development.example # Development environment
│   │   ├── env.staging.example   # Staging environment
│   │   └── env.production.example # Production environment
│   └── backend/
│       └── env.example           # Backend environment template
└── ENVIRONMENT_SETUP.md          # This file
```

## 🚀 Quick Start

### 1. Root Environment Setup

```bash
# Copy the root environment template
cp env.example .env

# Edit the file with your actual values
nano .env
```

### 2. Frontend Environment Setup

```bash
# Navigate to frontend directory
cd apps/frontend

# Copy environment templates
cp env.example .env.local
cp env.development.example .env.development.local
cp env.staging.example .env.staging.local
cp env.production.example .env.production.local

# Edit the files with your actual values
nano .env.local
nano .env.development.local
nano .env.staging.local
nano .env.production.local
```

### 3. Backend Environment Setup

```bash
# Navigate to backend directory
cd apps/backend

# Copy environment template
cp env.example .env

# Edit the file with your actual values
nano .env
```

## 🔧 Environment Configuration

### Root Environment Variables

The root `env.example` file contains shared configuration that applies to the entire project:

- **Application Configuration**: Basic app settings
- **Database Configuration**: PostgreSQL connection settings
- **Redis Configuration**: Cache and session storage
- **OpenAI Configuration**: AI service integration
- **Authentication & Security**: JWT and CORS settings
- **Rate Limiting**: API rate limiting configuration
- **Logging & Monitoring**: Log levels and monitoring settings
- **Backup & Recovery**: Database backup configuration
- **External Services**: Twitch, YouTube, Discord integrations
- **Analytics & Monitoring**: Sentry, Google Analytics
- **Feature Flags**: Feature toggles for different environments
- **Development Settings**: Development-specific configurations
- **Production Settings**: Production overrides

### Frontend Environment Variables

Frontend environment files use the `NEXT_PUBLIC_` prefix for client-side access:

#### Core Configuration

- `NEXT_PUBLIC_API_BASE_URL`: Backend API endpoint
- `NEXT_PUBLIC_WS_URL`: WebSocket connection URL
- `NEXT_PUBLIC_DEBUG_MODE`: Enable debug features
- `NEXT_PUBLIC_LOG_LEVEL`: Logging level

#### Authentication

- `NEXT_PUBLIC_AUTH_DOMAIN`: Authentication domain
- `NEXT_PUBLIC_AUTH_CLIENT_ID`: Auth client ID
- `NEXT_PUBLIC_JWT_STORAGE_KEY`: JWT storage key

#### External Platform Integrations

- `NEXT_PUBLIC_TWITCH_CLIENT_ID`: Twitch API client ID
- `NEXT_PUBLIC_YOUTUBE_API_KEY`: YouTube API key
- `NEXT_PUBLIC_DISCORD_CLIENT_ID`: Discord client ID

#### AI/ML Services

- `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI API key
- `NEXT_PUBLIC_ANTHROPIC_API_KEY`: Anthropic API key

#### Analytics & Monitoring

- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: Google Analytics ID

#### Feature Flags

- `NEXT_PUBLIC_ENABLE_CHAT_PROCESSING`: Enable chat processing
- `NEXT_PUBLIC_ENABLE_AI_RESPONSES`: Enable AI responses
- `NEXT_PUBLIC_ENABLE_OVERLAY`: Enable overlay features

### Backend Environment Variables

Backend environment variables are server-side only:

#### Database Configuration

- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

#### Redis Configuration

- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_PASSWORD`: Redis password
- `REDIS_DB`: Redis database number

#### OpenAI Configuration

- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: AI model to use
- `OPENAI_TEMPERATURE`: AI response randomness
- `OPENAI_MAX_TOKENS`: Maximum tokens per response

#### Security Configuration

- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time
- `CORS_ORIGIN`: Allowed CORS origins

#### Rate Limiting

- `RATE_LIMIT_TTL`: Rate limit time window
- `RATE_LIMIT_LIMIT`: Maximum requests per window
- `RATE_LIMIT_MESSAGE`: Rate limit error message

## 🌍 Environment-Specific Configurations

### Development Environment

**File**: `apps/frontend/.env.development.local`

- Debug mode enabled
- Hot reloading enabled
- Test API keys
- Relaxed security settings
- Detailed logging
- Performance optimizations disabled

### Staging Environment

**File**: `apps/frontend/.env.staging.local`

- Debug mode enabled for testing
- Production-like settings
- Staging API endpoints
- Moderate security settings
- Testing features enabled
- Mock data support

### Production Environment

**File**: `apps/frontend/.env.production.local`

- Debug mode disabled
- Performance optimizations enabled
- Strict security settings
- Production API endpoints
- Error tracking enabled
- Analytics enabled

## 🔐 Security Best Practices

### 1. Environment File Security

```bash
# Ensure environment files are in .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

### 2. API Key Management

- Never commit real API keys to version control
- Use different API keys for each environment
- Rotate API keys regularly
- Use environment-specific API keys

### 3. Secret Management

For production environments, consider using:

- **AWS Secrets Manager**
- **Azure Key Vault**
- **Google Cloud Secret Manager**
- **HashiCorp Vault**

### 4. Environment Variable Validation

Create validation scripts to ensure required variables are set:

```bash
#!/bin/bash
# validate-env.sh

required_vars=(
  "DB_HOST"
  "DB_PASSWORD"
  "OPENAI_API_KEY"
  "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

echo "All required environment variables are set"
```

## 🧪 Testing Environment Variables

### 1. Validation Script

```bash
# apps/backend/scripts/validate-env.js
const requiredEnvVars = [
  'DB_HOST',
  'DB_PASSWORD',
  'OPENAI_API_KEY',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('All required environment variables are set');
```

### 2. Environment Check Command

```bash
# Add to package.json scripts
"validate:env": "node scripts/validate-env.js"
```

## 📊 Environment Monitoring

### 1. Environment Variable Logging

```typescript
// apps/backend/src/common/utils/env-logger.util.ts
export function logEnvironmentInfo() {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    REDIS_HOST: process.env.REDIS_HOST,
    // Don't log sensitive values
  };

  console.log("Environment Configuration:", envInfo);
}
```

### 2. Health Check Integration

```typescript
// apps/backend/src/common/health/env-health.service.ts
export class EnvironmentHealthService {
  async checkEnvironmentVariables() {
    const requiredVars = ['DB_HOST', 'OPENAI_API_KEY', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(var => !process.env[var]);

    return {
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      missing: missingVars
    };
  }
}
```

## 🔄 Environment Migration

### 1. Development to Staging

```bash
# Copy development config to staging
cp apps/frontend/.env.development.local apps/frontend/.env.staging.local

# Update staging-specific values
sed -i 's/localhost:3001/api-staging.streambuddy.com\/api/g' apps/frontend/.env.staging.local
sed -i 's/development/staging/g' apps/frontend/.env.staging.local
```

### 2. Staging to Production

```bash
# Copy staging config to production
cp apps/frontend/.env.staging.local apps/frontend/.env.production.local

# Update production-specific values
sed -i 's/staging.streambuddy.com/streambuddy.com/g' apps/frontend/.env.production.local
sed -i 's/staging/production/g' apps/frontend/.env.production.local
```

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**

   ```bash
   # Check if .env file exists
   ls -la .env*

   # Verify file permissions
   chmod 600 .env
   ```

2. **Next.js Not Reading Environment Variables**

   ```bash
   # Ensure variables start with NEXT_PUBLIC_
   # Restart development server
   npm run dev
   ```

3. **Backend Environment Variables Not Available**
   ```bash
   # Check if .env file is in correct location
   # Verify file format (no spaces around =)
   # Restart backend server
   npm run start:dev
   ```

### Debug Commands

```bash
# List all environment variables
env | sort

# Check specific variable
echo $DB_HOST

# Validate environment setup
npm run validate:env
```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Environment Variable Best Practices](https://12factor.net/config)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

## 🤝 Contributing

When adding new environment variables:

1. Update the appropriate `.env.example` file
2. Document the variable in this guide
3. Add validation if required
4. Update deployment scripts if needed
5. Test in all environments

---

**Note**: Always keep your environment files secure and never commit them to version control. Use the provided templates as starting points and customize them for your specific needs.
