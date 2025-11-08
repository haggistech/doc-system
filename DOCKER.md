# Docker & Kubernetes Deployment Guide

This guide covers deploying the documentation system using Docker and Kubernetes.

## Table of Contents

- [Docker](#docker)
  - [Building the Image](#building-the-image)
  - [Running with Docker](#running-with-docker)
  - [Docker Compose](#docker-compose)
- [Kubernetes](#kubernetes)
  - [Prerequisites](#prerequisites)
  - [Deployment](#deployment)
  - [Configuration](#configuration)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Docker

### Building the Image

Build the Docker image locally:

```bash
# Build for your current architecture
docker build -t doc-system:latest .

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t doc-system:latest .
```

### Running with Docker

Run the container:

```bash
# Run on port 8080
docker run -d -p 8080:80 --name doc-system doc-system:latest

# Access the documentation
open http://localhost:8080
```

Stop and remove the container:

```bash
docker stop doc-system
docker rm doc-system
```

### Docker Compose

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

#### Docker Compose Options

**Custom port:**
```yaml
ports:
  - "3000:80"  # Access at http://localhost:3000
```

**Resource limits:**
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

## Kubernetes

### Prerequisites

- Kubernetes cluster (1.19+)
- kubectl configured
- (Optional) Ingress controller installed
- (Optional) cert-manager for TLS

### Deployment

#### Quick Deploy

Deploy all resources:

```bash
# Deploy using kubectl
kubectl apply -f k8s/

# Or using kustomize
kubectl apply -k k8s/
```

#### Step-by-Step Deploy

**1. Deploy the application:**

```bash
kubectl apply -f k8s/deployment.yaml
```

**2. Create the service:**

```bash
kubectl apply -f k8s/service.yaml
```

**3. (Optional) Create ingress:**

First, update `k8s/ingress.yaml` with your domain:

```yaml
spec:
  rules:
  - host: docs.yourdomain.com  # Change this
```

Then apply:

```bash
kubectl apply -f k8s/ingress.yaml
```

### Configuration

#### Update Docker Image

Edit `k8s/deployment.yaml`:

```yaml
spec:
  containers:
  - name: doc-system
    image: ghcr.io/haggistech/doc-system:v1.0.0  # Specify version
```

#### Scale Replicas

```bash
# Scale to 3 replicas
kubectl scale deployment/doc-system --replicas=3

# Or edit deployment.yaml
kubectl edit deployment/doc-system
```

#### Resource Limits

Edit `k8s/deployment.yaml`:

```yaml
resources:
  requests:
    cpu: 200m      # Increase CPU request
    memory: 256Mi  # Increase memory request
  limits:
    cpu: 500m      # Increase CPU limit
    memory: 512Mi  # Increase memory limit
```

#### Enable TLS with cert-manager

1. Install cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create ClusterIssuer:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

3. Update `k8s/ingress.yaml`:

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - docs.yourdomain.com
    secretName: doc-system-tls
```

### Useful Commands

```bash
# Check pod status
kubectl get pods -l app=doc-system

# View logs
kubectl logs -l app=doc-system -f

# Describe deployment
kubectl describe deployment/doc-system

# Check service
kubectl get svc doc-system

# Check ingress
kubectl get ingress doc-system

# Port forward for testing (access at localhost:8080)
kubectl port-forward svc/doc-system 8080:80

# Delete all resources
kubectl delete -k k8s/
```

## CI/CD

### Automated Docker Builds

Docker images are automatically built and pushed to GitHub Container Registry when you create a new tag.

#### Trigger a Build

```bash
# Create and push a tag (workflow will auto-build)
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

The workflow will:
1. Build multi-architecture images (amd64, arm64)
2. Push to `ghcr.io/haggistech/doc-system`
3. Tag as `latest` and version-specific tags

#### Use the Image

```bash
# Pull the latest image
docker pull ghcr.io/haggistech/doc-system:latest

# Pull specific version
docker pull ghcr.io/haggistech/doc-system:v1.0.0

# Run the image
docker run -p 8080:80 ghcr.io/haggistech/doc-system:latest
```

### GitOps Deployment

For continuous deployment with ArgoCD or Flux:

**ArgoCD Application:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: doc-system
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/haggistech/doc-system
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker logs doc-system
# or
kubectl logs -l app=doc-system
```

### Build Failures

Ensure Node.js version compatibility:
```dockerfile
FROM node:18-alpine  # Use supported version
```

Clear build cache:
```bash
docker builder prune -a
```

### Out of Memory

Increase container memory:
```yaml
resources:
  limits:
    memory: 512Mi  # Increase from 256Mi
```

### Ingress Not Working

Check ingress controller:
```bash
kubectl get pods -n ingress-nginx
```

Verify ingress class:
```yaml
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx  # Add if needed
```

### Image Pull Errors

For private registries, create image pull secret:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN

# Update deployment
spec:
  imagePullSecrets:
  - name: ghcr-secret
```

### Health Check Failures

Adjust probe settings:
```yaml
livenessProbe:
  initialDelaySeconds: 30  # Increase if app takes time to start
  timeoutSeconds: 10       # Increase timeout
  failureThreshold: 5      # Allow more failures
```

## Production Best Practices

1. **Use specific image tags** instead of `latest`
2. **Enable resource limits** to prevent resource exhaustion
3. **Set up monitoring** (Prometheus, Grafana)
4. **Use TLS** for external access
5. **Enable network policies** for security
6. **Regular security scans** of images
7. **Implement backup strategy** for persistent data
8. **Use horizontal pod autoscaling** (HPA) for traffic spikes

### Example HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: doc-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: doc-system
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [nginx Configuration](https://nginx.org/en/docs/)
