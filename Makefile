ifeq ($(OS),Windows_NT)
ENV_PATH_SEP := ;
else
ENV_PATH_SEP := :
endif

THIS_MAKEFILE_PATH := $(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR := $(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

RED=`tput setaf 1`
GREEN=`tput setaf 2`
CYAN=`tput setaf 6`
RESET=`tput sgr0`

CALYPSO_DIR := $(THIS_DIR)/calypso

CHECKMARK=✓

CONFIG_ENV = 
CALYPSO_ENV = desktop
NODE_ENV = production
BUILD_PLATFORM = mwl

# Build sources
# TODO: run tasks parallel when in dev mode
build-source: checks build-config build-calypso build-desktop
	@echo "$(CYAN)$(CHECKMARK) All parts built$(RESET)"

# Start app
start: build-source
	@echo "$(CYAN)Starting app...$(RESET)"

	@npx electron .

# Build config
build-config: 
	@node $(THIS_DIR)/resource/build-scripts/build-config-file.js $(CONFIG_ENV)

	@echo "$(CYAN)$(CHECKMARK) Config created$(RESET)"

# BUild calypso bundle
build-calypso: 
	@cd $(CALYPSO_DIR) && NODE_ENV=$(NODE_ENV) CALYPSO_ENV=$(CALYPSO_ENV) npm run -s build

	@echo "$(CYAN)$(CHECKMARK) Calypso built$(RESET)"

# Build desktop bundle
build-desktop:
	@NODE_ENV=$(NODE_ENV) NODE_PATH=calypso/server$(ENV_PATH_SEP)calypso/client CALYPSO_SERVER=true npx webpack --config $(THIS_DIR)/webpack.config.js

	@echo "$(CYAN)$(CHECKMARK) Desktop built$(RESET)"

# Package App
package:
	@npx electron-builder build -$(BUILD_PLATFORM)

	@echo "$(CYAN)$(CHECKMARK) App built$(RESET)"

# Combined steps for building app 
build: build-source package

# Perform checks
checks: check-node-and-npm-version-parity secret secret-clientid

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

CALYPSO_NODE_VERSION := $(shell node -p "require('$(CALYPSO_DIR)/package.json').engines.node")
CALYPSO_NPM_VERSION := $(shell node -p "require('$(CALYPSO_DIR)/package.json').engines.npm")
DESKTOP_NODE_VERSION := $(shell node -p "require('$(THIS_DIR)/package.json').engines.node")
DESKTOP_NPM_VERSION := $(shell node -p "require('$(THIS_DIR)/package.json').engines.npm")

# Check that the current node & npm versions are the versions Calypso expects to ensure it is built safely.
check-node-and-npm-version-parity:
	@if [ ! $(CALYPSO_NODE_VERSION) = $(DESKTOP_NODE_VERSION) ] || \
		[ ! $(CALYPSO_NPM_VERSION) = $(DESKTOP_NPM_VERSION) ]; \
		then { \
			echo "Please ensure that wp-desktop is using the following versions of NPM and Node to match wp-calypso before continuing"; \
			printf " - Node: $(CALYPSO_NODE_VERSION)"; \
			if [ ! $(CALYPSO_NODE_VERSION) = $(DESKTOP_NODE_VERSION) ]; \
				then echo "$(RED) x$(RESET)"; else echo "$(GREEN) ✓$(RESET)"; \
			fi; \
			printf " - NPM: $(CALYPSO_NPM_VERSION)"; \
			if [ ! $(CALYPSO_NPM_VERSION) = $(DESKTOP_NPM_VERSION) ]; \
				then echo "$(RED) x$(RESET)"; else echo "$(GREEN) ✓$(RESET)"; \
			fi; \
			echo ""; \
			exit 1; \
		} \
	fi;
