# Docker Setup Guide

This guide covers building and running the documentation system locally using Docker.

## Current Status

✅ **Docker image built**: `doc-system:latest` (52.9MB)
✅ **Multi-stage build**: Node.js builder + nginx server
✅ **Optimized**: Alpine-based for minimal size

## Building the Docker Image

Build the Docker image locally:

```bash
# Build using docker command
docker build -t doc-system:latest .

# Or use the Makefile
make docker-build
```

### Multi-Architecture Builds

To build for multiple architectures:

```bash
# Build for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t doc-system:latest .

# Or use the Makefile
make docker-buildx
```

## Running Locally

### Using Docker Directly

```bash
# Run on port 8080
docker run -d -p 8080:80 --name doc-system doc-system:latest

# Access the documentation
open http://localhost:8080

# View logs
docker logs -f doc-system

# Stop and remove
docker stop doc-system
docker rm doc-system
```

### Using Docker Compose

The easiest way to run locally:

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

Access at: http://localhost:8080

### Using Makefile Commands

```bash
make docker-run     # Start container on port 8080
make docker-logs    # View logs
make docker-stop    # Stop and remove container

# Or use docker-compose
make compose-up     # Start with docker-compose
make compose-logs   # View logs
make compose-down   # Stop docker-compose
```

## Customizing Port

### Docker Command

```bash
# Run on port 3000 instead
docker run -d -p 3000:80 --name doc-system doc-system:latest
```

### Docker Compose

Edit `docker-compose.yml`:

```yaml
ports:
  - "3000:80"  # Access at http://localhost:3000
```

### Makefile

```bash
# Override default port
make docker-run PORT=3000
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

## Kubernetes Deployment

For detailed Kubernetes deployment instructions, see [DOCKER.md](DOCKER.md).

### Quick Deploy to Local Cluster

```bash
# Build the image
docker build -t doc-system:latest .

# Load into your local cluster
# For minikube:
minikube image load doc-system:latest

# For kind:
kind load docker-image doc-system:latest

# For k3d:
k3d image import doc-system:latest

# Deploy to Kubernetes
kubectl apply -k k8s/

# Port forward to access locally
kubectl port-forward svc/doc-system 8080:80
```

## Troubleshooting

### Port Already in Use

If you see "address already in use":

```bash
# Use a different port
docker run -d -p 3000:80 --name doc-system doc-system:latest
```

### Container Name Conflict

If the container name is already in use:

```bash
# Remove the existing container
docker rm -f doc-system

# Then run again
docker run -d -p 8080:80 --name doc-system doc-system:latest
```

### Image Too Large

Current image is 52.9MB (very good). If it grows:
- Check what's being copied in Dockerfile
- Review .dockerignore file
- Verify multi-stage build is working properly

### Build Fails

If the build fails:

```bash
# Clear build cache
docker builder prune -a

# Rebuild
docker build -t doc-system:latest .
# Or
make docker-build
```

### Node.js Version Issues

If you encounter Node.js compatibility issues, update the Dockerfile:

```dockerfile
FROM node:18-alpine AS builder  # Use supported LTS version
```

## Resource Management

### Setting Resource Limits

#### Docker Run

```bash
docker run -d \
  -p 8080:80 \
  --name doc-system \
  --memory="256m" \
  --cpus="0.5" \
  doc-system:latest
```

#### Docker Compose

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 256M
    reservations:
      cpus: '0.25'
      memory: 128M
```

#### Kubernetes

See resource limits in [k8s/deployment.yaml](k8s/deployment.yaml).

## Development Workflow

### Quick Rebuild and Test

```bash
# Build the documentation
npm run build

# Rebuild Docker image
docker build -t doc-system:latest .

# Stop old container and start new one
docker rm -f doc-system
docker run -d -p 8080:80 --name doc-system doc-system:latest

# Or use Makefile
make docker-stop docker-run
```

### Automated with Makefile

```bash
# Build and run in one command
make docker-all
```

## Health Checks

The Docker Compose configuration includes health checks:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

Check container health:

```bash
docker ps
# Look for "healthy" status

# Or inspect health status
docker inspect --format='{{.State.Health.Status}}' doc-system
```

## Best Practices

1. **Use specific tags** instead of `latest` in production
2. **Set resource limits** to prevent resource exhaustion
3. **Enable health checks** for automatic restarts
4. **Use multi-stage builds** (already implemented)
5. **Keep images small** (current: 52.9MB)
6. **Use .dockerignore** to exclude unnecessary files (already configured)
7. **Test locally** before deploying to clusters

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [DOCKER.md](DOCKER.md) - Comprehensive Docker & Kubernetes guide
- [nginx Documentation](https://nginx.org/en/docs/)
