# Docker Image Setup Guide

The Docker image has been built successfully and is ready to push to GitHub Container Registry.

## Current Status

✅ **Docker image built**: `doc-system:latest` (52.9MB)
✅ **Multi-stage build**: Node.js builder + nginx server
✅ **Optimized**: Alpine-based for minimal size

## Pushing to GitHub Container Registry

### Step 1: Create Token with Correct Permissions

The current token needs additional permissions. Create a new Personal Access Token:

1. Go to: https://github.com/settings/tokens/new
2. Name it: `doc-system-packages`
3. Select these scopes:
   - ✅ `write:packages` - Upload packages to GitHub Package Registry
   - ✅ `read:packages` - Download packages from GitHub Package Registry
   - ✅ `delete:packages` - Delete packages from GitHub Package Registry
   - ✅ `repo` - Full control of private repositories (if needed)
4. Click "Generate token"
5. Copy the token

### Step 2: Login to GitHub Container Registry

```bash
# Replace YOUR_TOKEN with the token from step 1
echo "YOUR_TOKEN" | docker login ghcr.io -u haggistech --password-stdin
```

### Step 3: Tag the Image

```bash
# Tag for latest
docker tag doc-system:latest ghcr.io/haggistech/doc-system:latest

# Tag for specific version
docker tag doc-system:latest ghcr.io/haggistech/doc-system:v1.0.0
```

### Step 4: Push to Registry

```bash
# Push both tags
docker push ghcr.io/haggistech/doc-system:latest
docker push ghcr.io/haggistech/doc-system:v1.0.0
```

### Step 5: Make Package Public (Optional)

1. Go to: https://github.com/haggistech?tab=packages
2. Click on `doc-system` package
3. Click "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Public"

## Alternative: Use GitHub Actions

The easier way is to let GitHub Actions build and push automatically:

### Method 1: Manual Trigger

```bash
# Just create a tag and push it
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

GitHub Actions will automatically:
- Build the Docker image
- Push to `ghcr.io/haggistech/doc-system:v1.0.1`
- Push to `ghcr.io/haggistech/doc-system:latest`

### Method 2: Trigger Workflow Manually

1. Go to: https://github.com/haggistech/doc-system/actions/workflows/docker.yml
2. Click "Run workflow"
3. Select branch: `master`
4. Click "Run workflow"

## Using the Docker Image

Once pushed, you can use it anywhere:

### Docker

```bash
# Pull and run
docker pull ghcr.io/haggistech/doc-system:latest
docker run -p 8080:80 ghcr.io/haggistech/doc-system:latest
```

### Docker Compose

Update `docker-compose.yml`:

```yaml
services:
  doc-system:
    image: ghcr.io/haggistech/doc-system:latest
    ports:
      - "8080:80"
```

### Kubernetes

Update `k8s/deployment.yaml`:

```yaml
spec:
  containers:
  - name: doc-system
    image: ghcr.io/haggistech/doc-system:v1.0.0
```

Then deploy:

```bash
kubectl apply -k k8s/
```

## Local Testing

You can test the locally built image right now:

```bash
# Run the container
docker run -d -p 8080:80 --name doc-system doc-system:latest

# Access the documentation
open http://localhost:8080

# View logs
docker logs -f doc-system

# Stop and remove
docker stop doc-system
docker rm doc-system
```

Or use the Makefile:

```bash
make docker-run    # Start container
make docker-logs   # View logs
make docker-stop   # Stop container
```

## Verifying the Build

Check what's in the image:

```bash
# List files in the nginx html directory
docker run --rm doc-system:latest ls -la /usr/share/nginx/html

# Check nginx configuration
docker run --rm doc-system:latest cat /etc/nginx/conf.d/default.conf

# Test nginx configuration
docker run --rm doc-system:latest nginx -t
```

## Troubleshooting

### Permission Denied

If you get "permission_denied" when pushing:
- Verify token has `write:packages` scope
- Ensure you're logged in: `docker login ghcr.io`
- Check organization settings allow packages

### Image Too Large

Current image is 52.9MB (very good). If it grows:
- Check what's being copied in Dockerfile
- Review .dockerignore file
- Use multi-stage builds (already implemented)

### Build Fails

If the build fails:
```bash
# Clear build cache
docker builder prune -a

# Rebuild
make docker-build
```

## Next Steps

**Recommended**: Let GitHub Actions handle the Docker builds automatically. Just push tags:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

This will trigger both:
1. Auto-versioning workflow (creates release)
2. Docker build workflow (builds and pushes image)

Then you can use the image from anywhere:
```bash
docker pull ghcr.io/haggistech/doc-system:v1.0.1
```
