# Executables (local)
DOCKER_COMP = docker compose

# Docker containers
NODE_CONT = $(DOCKER_COMP) exec nuxt

# Executables
NPX = $(NODE_CONT) npx nuxi
NPM = $(NODE_CONT) npm

# Misc
.DEFAULT_GOAL = help
.PHONY        : help build up start down logs sh composer vendor sf cc test consolidate install

## —— 🎵 🐳 The Symfony Docker Makefile 🐳 🎵 ——————————————————————————————————
help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

## —— Docker 🐳 ————————————————————————————————————————————————————————————————
build: ## Builds the Docker images
	@$(DOCKER_COMP) build --pull --no-cache

up: ## Start the docker hub in detached mode (no logs)
	@$(DOCKER_COMP) up --detach

install: ## Start the docker hub in detached mode (no logs)
	@$(DOCKER_COMP) run --rm --entrypoint bash nuxt -c "npm install"

start: build up ## Build and start the containers

down: ## Stop the docker hub
	@$(DOCKER_COMP) down --remove-orphans

logs: ## Show live logs
	@$(DOCKER_COMP) logs --tail=0 --follow

sh: ## Connect to the FrankenPHP container
	@$(NODE_CONT) sh

bash: ## Connect to the FrankenPHP container via bash so up and down arrows go to previous commands
	@$(NODE_CONT) bash

## —— NPM 🧙 ——————————————————————————————————————————————————————————————
npx: ## Run 'npx nuxi', pass the parameter "c=" to run a given command, example: make composer c='prepare'
	@$(eval c ?=)
	@$(NPX) $(c)

npm: ## Run npm, pass the parameter "c=" to run a given command, example: make composer c='install'
	@$(eval c ?=)
	@$(NPM) $(c)

## —— AI 🧠 ———————————————————————————————————————————————————————————————
consolidate:
	@consolidate --ext=ts,vue,css,json,yaml,Dockerfile,md --exclude=package-lock.json,README.md,'*/.nuxt/*','*/.output/*','*/.data/*','*/docs/*'
	@cp ../hskstudykit-backend/docs/api.md api.txt
