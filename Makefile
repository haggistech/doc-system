.PHONY: help build run stop clean docker-build docker-run docker-stop k8s-deploy k8s-delete

# Variables
IMAGE_NAME := doc-system
TAG := latest
PORT := 8080

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the documentation
	npm run build

dev: ## Run development server
	npm run dev

serve: ## Serve built documentation
	npm run serve

docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):$(TAG) .

docker-run: ## Run Docker container
	docker run -d -p $(PORT):80 --name $(IMAGE_NAME) $(IMAGE_NAME):$(TAG)
	@echo "Documentation running at http://localhost:$(PORT)"

docker-stop: ## Stop and remove Docker container
	docker stop $(IMAGE_NAME) || true
	docker rm $(IMAGE_NAME) || true

docker-logs: ## View Docker container logs
	docker logs -f $(IMAGE_NAME)

compose-up: ## Start with docker-compose
	docker-compose up -d
	@echo "Documentation running at http://localhost:8080"

compose-down: ## Stop docker-compose
	docker-compose down

compose-logs: ## View docker-compose logs
	docker-compose logs -f

k8s-deploy: ## Deploy to Kubernetes
	kubectl apply -k k8s/

k8s-delete: ## Delete from Kubernetes
	kubectl delete -k k8s/

k8s-logs: ## View Kubernetes pod logs
	kubectl logs -l app=doc-system -f

k8s-status: ## Check Kubernetes deployment status
	kubectl get pods,svc,ingress -l app=doc-system

k8s-port-forward: ## Port forward Kubernetes service (8080 -> 80)
	kubectl port-forward svc/doc-system 8080:80

clean: ## Clean build artifacts
	rm -rf build/
	rm -rf node_modules/

install: ## Install dependencies
	npm install

test: ## Run tests (if any)
	npm test

lint: ## Lint code (if configured)
	npm run lint || echo "No linter configured"

all: install build ## Install and build

docker-all: docker-build docker-run ## Build and run Docker container

# Multi-arch build
docker-buildx: ## Build multi-architecture Docker image
	docker buildx build --platform linux/amd64,linux/arm64 -t $(IMAGE_NAME):$(TAG) .
