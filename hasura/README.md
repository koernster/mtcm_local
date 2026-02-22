# MTCM Hasura Metadata Repository

This repository contains the Hasura metadata configuration for the MTCM (Multi-Tenant Client Management) application.

## Structure

```
hasura-metadata/
├── config.yaml                 # Main Hasura CLI configuration
├── metadata/                   # Hasura metadata files
│   ├── version.yaml           # Metadata version (v3)
│   ├── databases/             # Database configurations
│   │   ├── databases.yaml     # Database connection config
│   │   └── default/           # Default database
│   │       └── tables/        # Table tracking and permissions
│   │           └── tables.yaml
│   ├── actions.yaml           # Custom GraphQL actions
│   ├── remote_schemas.yaml    # Remote schema integrations
│   ├── query_collections.yaml # Saved query collections
│   ├── allow_list.yaml        # Query allow list
│   ├── rest_endpoints.yaml    # REST API endpoints
│   ├── api_limits.yaml        # API rate limits
│   ├── inherited_roles.yaml   # Role inheritance config
│   ├── cron_triggers.yaml     # Scheduled triggers
│   └── network.yaml           # Network configuration
├── environments/              # Environment-specific configs
│   ├── dev/
│   │   ├── config.yaml        # Dev environment Hasura config
│   │   └── cron_triggers.yaml # Dev cron schedules
│   ├── test/
│   │   ├── config.yaml
│   │   └── cron_triggers.yaml
│   └── prod/
│       ├── config.yaml
│       └── cron_triggers.yaml
└── scripts/                   # Utility scripts
    ├── apply-cron-triggers.sh # Apply environment-specific crons
    ├── backup.sh              # Backup metadata
    └── restore.sh             # Restore metadata
```

## Environment Configuration

### Development (dev)
- Database: `mtcm_dev`
- Endpoint: `http://localhost:8080`
- Console: Enabled
- Dev Mode: Enabled

### Test (test)
- Database: `mtcm_test`
- Endpoint: `https://test.mtcm.dev/graphql`
- Console: Enabled
- Dev Mode: Disabled

### Production (prod)
- Database: `mtcm_prod`
- Endpoint: `https://mtcm.app/graphql`
- Console: Disabled
- Dev Mode: Disabled

## Getting Started

### Prerequisites

1. Install Hasura CLI:
```bash
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
```

2. Set up Doppler for environment variables:
```bash
doppler login
doppler setup --project paams-edge-server --config dev
```

### Initialize Metadata

1. Apply metadata to development environment:
```bash
cd /Users/steff/DEV/MTCM_R1/hasura-metadata
hasura metadata apply --endpoint http://localhost:8080 --admin-secret <admin-secret>
```

2. Track existing tables:
```bash
# Option 1: Via Hasura Console (recommended for initial setup)
hasura console

# Option 2: Via CLI
hasura metadata reload
```

### Manage Metadata

#### Export Current Metadata
```bash
hasura metadata export
```

#### Apply Metadata Changes
```bash
hasura metadata apply
```

#### Reload Metadata
```bash
hasura metadata reload
```

## Workflow

### Adding New Tables

1. **Option A: Via Console (Recommended)**
   - Open Hasura Console: `hasura console`
   - Go to Data → Schema → Track tables
   - Configure relationships and permissions in the UI
   - Export metadata: `hasura metadata export`

2. **Option B: Manually**
   - Add table configuration to `metadata/databases/default/tables/tables.yaml`
   - Apply metadata: `hasura metadata apply`

### Setting Up Permissions

For each table, configure permissions for three roles:

1. **public** - Unauthenticated users
   - Limited read access to public data
   - No insert/update/delete

2. **user** - Authenticated users
   - Read access to own data
   - Insert/update own records
   - Delete own records

3. **admin** - System administrators
   - Full access to all operations
   - Access to all data

Example permission in tables.yaml:
```yaml
- table:
    name: contacts
    schema: public
  select_permissions:
    - role: user
      permission:
        columns: [id, name, email, created_at]
        filter:
          user_id:
            _eq: X-Hasura-User-Id
```

### Environment-Specific Cron Triggers

Cron triggers are environment-specific. To apply them:

```bash
# Development
./scripts/apply-cron-triggers.sh dev

# Test
./scripts/apply-cron-triggers.sh test

# Production
./scripts/apply-cron-triggers.sh prod
```

## Common Tasks

### Connect to Dev Database
```bash
doppler run --config dev -- hasura console
```

### Connect to Test Database
```bash
doppler run --config test -- hasura console --endpoint https://test.mtcm.dev/graphql
```

### Backup Metadata
```bash
./scripts/backup.sh
# Creates timestamped backup in backups/
```

### Restore Metadata
```bash
./scripts/restore.sh <backup-file>
```

### Compare Metadata
```bash
# Compare local metadata with server
hasura metadata diff
```

## Security Best Practices

1. **Admin Secret**
   - Never commit admin secrets to git
   - Use Doppler for secret management
   - Rotate secrets regularly

2. **Permissions**
   - Follow principle of least privilege
   - Test permissions thoroughly
   - Use row-level security

3. **Console Access**
   - Disable console in production
   - Use read-only mode when possible
   - Restrict network access

## Troubleshooting

### Metadata Inconsistencies
```bash
# Check for inconsistencies
hasura metadata inconsistency list

# Drop inconsistencies (careful!)
hasura metadata inconsistency drop
```

### Connection Issues
```bash
# Test database connection
hasura metadata reload --endpoint <endpoint> --admin-secret <secret>
```

### Version Conflicts
```bash
# Force metadata version
hasura metadata apply --skip-update-check
```

## References

- [Hasura Metadata API](https://hasura.io/docs/latest/api-reference/metadata-api/)
- [Hasura CLI Reference](https://hasura.io/docs/latest/hasura-cli/commands/)
- [Permission Rules](https://hasura.io/docs/latest/auth/authorization/permissions/)

## Support

For issues or questions:
- Check Hasura logs: `docker logs <hasura-container>`
- Review metadata: `hasura metadata export`
- Consult: [Hasura Documentation](https://hasura.io/docs/)
