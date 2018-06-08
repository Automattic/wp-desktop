ifeq ($(OS),Windows_NT)
ENV_PATH_SEP := ;
else
ENV_PATH_SEP := :
endif

THIS_MAKEFILE_PATH := $(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR := $(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)
NPM_BIN_DIR = $(shell npm bin)

RED = `tput setaf 1`
GREEN = `tput setaf 2`
CYAN = `tput setaf 6`
RESET = `tput sgr0`

CALYPSO_DIR := $(THIS_DIR)/calypso

CHECKMARK = ✓

# Environment Variables
CONFIG_ENV = 
CALYPSO_ENV = desktop
NODE_ENV = production
BUILD_PLATFORM = mwl
DEBUG = 
TEST_PRODUCTION_BINARY = false

# Build sources
# TODO: run tasks parallel when in dev mode
build-source: checks build-config build-calypso build-desktop
	@echo "$(CYAN)$(CHECKMARK) All parts built$(RESET)"

# Start app
start:
	@echo "$(CYAN)Starting app...$(RESET)"

	@NODE_ENV=$(NODE_ENV) DEBUG=$(DEBUG) npx electron .

# Start app server in dev mode
dev-server: CONFIG_ENV = development
dev-server: CALYPSO_ENV = desktop-development
dev-server: NODE_ENV = development
dev-server: checks
	@echo "\n\n$(GREEN)+------------------------------------------------+"
	@echo "|                                                |"
	@echo "|    Wait for calypso to start the dev server    |"
	@echo "|       and start the app with \`make dev\`        |"
	@echo "|                                                |"
	@echo "+------------------------------------------------+$(RESET)\n\n"
	
	@$(MAKE) build-config CONFIG_ENV=$(CONFIG_ENV)


	@npx concurrently -k \
	-n "Calypso,Desktop" \
	"$(MAKE) calypso-dev NODE_ENV=$(NODE_ENV) CALYPSO_ENV=$(CALYPSO_ENV)" \
	"wait-on http://localhost:3000 && $(MAKE) desktop-dev NODE_ENV=$(NODE_ENV)" \

# Start app in dev mode
dev: NODE_ENV = development
dev: DEBUG = desktop:*
dev: 
	$(MAKE) start NODE_ENV=$(NODE_ENV) DEBUG=$(DEBUG)

# Build config
build-config: 
	@node $(THIS_DIR)/resource/build-scripts/build-config-file.js $(CONFIG_ENV)

	@echo "$(CYAN)$(CHECKMARK) Config created$(RESET)"

# Build calypso bundle
build-calypso: 
	@cd $(CALYPSO_DIR) && NODE_ENV=$(NODE_ENV) CALYPSO_ENV=$(CALYPSO_ENV) npm run -s build

	@echo "$(CYAN)$(CHECKMARK) Calypso built$(RESET)"

# Run Calypso server
calypso-dev: 
	@echo "$(CYAN)Starting Calypso...$(RESET)"

	@cd $(CALYPSO_DIR) && NODE_ENV=$(NODE_ENV) CALYPSO_ENV=$(CALYPSO_ENV) npm run -s start

# Build desktop bundle
build-desktop:
	@NODE_ENV=$(NODE_ENV) NODE_PATH=calypso/server$(ENV_PATH_SEP)calypso/client CALYPSO_SERVER=true npx webpack --config $(THIS_DIR)/webpack.config.js

	@echo "$(CYAN)$(CHECKMARK) Desktop built$(RESET)"

# Build and watch desktop scripts
desktop-dev:
	@echo "$(CYAN)Starting Desktop Server...$(RESET)"

	@NODE_ENV=$(NODE_ENV) NODE_PATH=calypso/server$(ENV_PATH_SEP)calypso/client CALYPSO_SERVER=true npx webpack --watch --config $(THIS_DIR)/webpack.config.js

# Package App
package:
	@npx electron-builder build -$(BUILD_PLATFORM)

	@echo "$(CYAN)$(CHECKMARK) App built$(RESET)"

# Combined steps for building app 
build: build-source package

# Perform checks
checks: check-node-version-parity secret secret-clientid

# Check for secrets.json
secret:
	@if [ $(CONFIG_ENV) = "release" ] && [ ! -f $(CALYPSO_DIR)/config/secrets.json ]; \
	then { \
		if [ -z "${CIRCLECI}" ]; \
			then { \
				echo "$(RED)x calypso/config/secrets.json not found. Required file, see docs/secrets.md$(RESET)"; \
				exit 1; \
			} \
		fi; \
	} \
	fi;


CLIENT_ID := $(shell node -p "require('$(CALYPSO_DIR)/config/secrets.json').desktop_oauth_client_id")

# Confirm proper clientid for production release
secret-clientid:
	@if [ $(CONFIG_ENV) = "release" ] && [ ! $(CLIENT_ID) = "43452" ]; \
	then { \
		echo "$(RED)x calypso/config/secrets.json, \"desktop_oauth_client_id\" must be \"43452\" $(RESET)"; \
		exit 1; \
	} \
	fi;


CALYPSO_NODE_VERSION := $(shell cat calypso/.nvmrc)
CURRENT_NODE_VERSION := $(shell node -v)

# Check that the current node & npm versions are the versions Calypso expects to ensure it is built safely.
check-node-version-parity:
ifneq ($(CALYPSO_NODE_VERSION), $(CURRENT_NODE_VERSION))
	$(error Please ensure that wp-desktop is using the following versions of NPM and Node to match wp-calypso before continuing)
else 
	@echo $(GREEN)$(CHECKMARK) Current NodeJS version is on par with Calypso \($(CALYPSO_NODE_VERSION)\) $(RESET)
endif

test: CONFIG_ENV = test  
test: build-config
	@echo "$(CYAN)$(CHECKMARK) Starting test...$(RESET)"

	@TEST_PRODUCTION_BINARY=$(TEST_PRODUCTION_BINARY) npx xvfb-maybe mocha --compilers js:babel-core/register ./test

distclean: clean
	@cd calypso; npm run distclean
	@rm -rf ./node_modules

clean:
	@cd calypso; npm run clean
	@rm -rf ./release
	@rm -rf ./build

.PHONY: test build-sources
