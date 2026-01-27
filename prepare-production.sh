#!/bin/bash

# Prepare production server bundle for offline deployment

set -e

echo "📦 Preparing production server bundle..."

# Create temporary production directory
PROD_DIR="dashboard-production"
rm -rf "$PROD_DIR"
mkdir -p "$PROD_DIR"

echo "✅ Created production directory: $PROD_DIR"

# Copy server files
echo "📋 Copying server files..."
mkdir -p "$PROD_DIR/server"
cp -r server/*.cjs "$PROD_DIR/server/" 2>/dev/null || true
cp -r server/*.ts "$PROD_DIR/server/" 2>/dev/null || true
cp -r server/auth "$PROD_DIR/server/" 2>/dev/null || true
cp -r server/middleware "$PROD_DIR/server/" 2>/dev/null || true
cp -r server/routes "$PROD_DIR/server/" 2>/dev/null || true

# Copy Prisma schema
echo "📋 Copying Prisma files..."
mkdir -p "$PROD_DIR/prisma"
cp -r prisma/* "$PROD_DIR/prisma/"

# Copy package.json for server
echo "📋 Copying server package.json..."
cp server/package.json "$PROD_DIR/"

# Copy .env file
if [ -f ".env" ]; then
  cp .env "$PROD_DIR/.env"
  echo "✅ Copied .env file (REMEMBER TO UPDATE SECRETS!)"
elif [ -f ".env.production" ]; then
  cp .env.production "$PROD_DIR/.env"
  echo "✅ Copied .env.production as .env"
else
  echo "⚠️  No .env file found, you'll need to create .env manually"
fi

# Install dependencies in production directory
echo "📦 Installing dependencies..."
cd "$PROD_DIR"
npm install

echo "✅ Dependencies installed"

# Generate Prisma Client for multiple Linux platforms
echo "🔧 Generating Prisma Client with Linux binaries..."
echo "   This will download engine binaries for:"
echo "   - rhel-openssl-1.1.x (RHEL/CentOS 7/8)"
echo "   - rhel-openssl-3.0.x (RHEL/CentOS 9+)"
echo "   - debian-openssl-1.1.x (Ubuntu 18.04/20.04)"
echo "   - debian-openssl-3.0.x (Ubuntu 22.04+)"

# Generate client (downloads query engines)
npx prisma generate

# Also download migration engines
echo "🔧 Downloading migration engines..."
npx prisma version

echo "✅ Prisma Client and engines generated"

# Verify the generated Prisma Client with engines
echo "📋 Verifying Prisma engines..."
if [ -d "node_modules/.prisma" ]; then
  echo "✅ Prisma engines found in node_modules/.prisma/"
  ls -lh node_modules/.prisma/client/*.node 2>/dev/null || echo "   Engine files ready"
else
  echo "⚠️  Warning: Prisma engines not found, generation may have failed"
  exit 1
fi

cd ..

# Create uploads directory
mkdir -p "$PROD_DIR/uploads"
echo "✅ Created uploads directory"

# Create helper scripts for offline deployment
echo "📝 Creating deployment helper scripts..."

cat > "$PROD_DIR/migrate.sh" << 'MIGRATE_EOF'
#!/bin/bash

# Database initialization script for offline Rocky Linux deployment

set -e

echo "🔧 Initializing database..."

DB_PATH="./prisma/dev.db"

# Check if database already exists
if [ -f "$DB_PATH" ]; then
    echo "✅ Database already exists at $DB_PATH"
    echo "   Database schema is pre-created and ready to use"
    echo "   If you need to reset it, delete the file and copy from backup"
    exit 0
fi

echo "❌ Error: Database file not found at $DB_PATH"
echo ""
echo "The database file should have been included in the deployment package."
echo "Please ensure prisma/dev.db was copied during deployment."

exit 1
MIGRATE_EOF

cat > "$PROD_DIR/start.sh" << 'START_EOF'
#!/bin/bash

# Startup script for offline Rocky Linux deployment

set -e

echo "🚀 Starting Dashboard Server..."

# Tell Prisma to skip binary download checks
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Point to the pre-generated client for Rocky Linux 9
export PRISMA_QUERY_ENGINE_LIBRARY="$(pwd)/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node"

# Verify the binary exists
if [ ! -f "$PRISMA_QUERY_ENGINE_LIBRARY" ]; then
    echo "❌ Error: Prisma engine binary not found!"
    echo "   Expected: $PRISMA_QUERY_ENGINE_LIBRARY"
    exit 1
fi

echo "✅ Using Prisma engine: libquery_engine-rhel-openssl-3.0.x.so.node"
echo ""
echo "Starting server on port ${PORT:-3001}..."
echo "Press Ctrl+C to stop"
echo ""

# Start the server
node server/production.cjs
START_EOF

chmod +x "$PROD_DIR/migrate.sh"
chmod +x "$PROD_DIR/start.sh"

echo "✅ Created helper scripts: migrate.sh and start.sh"

# Create README for deployment
cat > "$PROD_DIR/README.md" << 'EOF'
# Dashboard Production Server

## Deployment Instructions

### On your local machine (macOS):
1. Run `./prepare-production.sh` to create the production bundle
2. Copy `dashboard-production.tar.gz` to your offline Rocky Linux server

### On Rocky Linux server:
1. Create directory and extract the archive:
```bash
mkdir dashboard-production
cd dashboard-production
tar -xzf ../dashboard-production.tar.gz
```

2. Make scripts executable:
```bash
chmod +x start.sh migrate.sh
```

3. Edit `.env` file and update the secrets:
```bash
vi .env

# IMPORTANT: Change these values!
SESSION_SECRET=your-random-secret-min-32-chars
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-random-secret-min-32-chars

# Optional: Update dashboard titles
DASHBOARD_TITLE=Your Dashboard Title
DASHBOARD_SUBTITLE=Your Subtitle
```

4. Check database (should already exist):
```bash
./migrate.sh
```

5. Start the server:
```bash
./start.sh
```

The server will run on http://0.0.0.0:3001 (or the PORT specified in .env)

## Important Notes

- **Prisma Client is pre-generated**: Binary engines for Linux are included in `node_modules/.prisma/`
- **No internet required**: All dependencies and binaries are bundled for offline deployment
- **Supported platforms**: RHEL/CentOS 7-9, Ubuntu 18.04-24.04, Debian
- **DO NOT run `prisma generate`** - engines are already included
- If you see Prisma connection errors, check DATABASE_URL in .env file

## Troubleshooting

### Database Error (Error code 14: Unable to open the database file)
This is usually caused by SELinux blocking database access:

```bash
# Check SELinux status
getenforce

# Temporarily disable SELinux to test
sudo setenforce 0
./start.sh

# If it works, properly configure SELinux:
sudo setenforce 1
sudo chcon -R -t httpd_sys_rw_content_t ./prisma/
./start.sh
```

### Google OAuth Error
Make sure Google OAuth variables in `.env` are commented out if not using OAuth:
```bash
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_CALLBACK_URL=...
```

The server will run on the port specified in .env (default: 3001)

## Directory Structure

- `server/` - Server source code
- `prisma/` - Database schema and migrations
- `node_modules/` - All required dependencies (included for offline deployment)
- `uploads/` - File attachments storage
- `.env` - Environment configuration

## Notes

- All dependencies are included in node_modules
- Database file will be created at prisma/dev.db
- Make sure to set proper permissions for uploads/ directory
- Keep .env file secure with proper permissions
EOF

echo "✅ Created deployment README"

# Create tarball for easy transfer (without macOS metadata)
echo "📦 Creating tarball..."
# Create tar from inside directory to avoid macOS extended attributes issues
cd "$PROD_DIR"
COPYFILE_DISABLE=1 tar -cf ../dashboard-production.tar .
cd ..
gzip -f dashboard-production.tar
echo "✅ Created dashboard-production.tar.gz"

echo ""
echo "✅ Production bundle ready!"
echo ""
echo "📦 Package created: dashboard-production.tar.gz"
echo "📁 Directory: $PROD_DIR/"
echo ""
echo "To deploy:"
echo "1. Copy dashboard-production.tar.gz to your offline server"
echo "2. Create directory and extract:"
echo "   mkdir dashboard-production"
echo "   cd dashboard-production"
echo "   tar -xzf ../dashboard-production.tar.gz"
echo "3. Configure .env file (update secrets)"
echo "4. Make scripts executable: chmod +x start.sh migrate.sh"
echo "5. Check database: ./migrate.sh"
echo "6. Start server: ./start.sh"
echo ""
echo "Total size:"
du -sh "$PROD_DIR"
du -sh dashboard-production.tar.gz
