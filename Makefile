ifeq ($(OS),Windows_NT)
	FILE_PATH_SEP := \
	ENV_PATH_SEP := ;
else
	FILE_PATH_SEP := /
	ENV_PATH_SEP := :
endif

/ = $(FILE_PATH_SEP)

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
BUILD_PLATFORM = 
DEBUG = 
TEST_PRODUCTION_BINARY = false
MINIFY_JS = true
NODE_ARGS = --max_old_space_size=8192

# Set default target
.DEFAULT_GOAL := build

# Build sources
# TODO: run tasks parallel when in dev mode
build-source: checks desktop$/config.json build-calypso build-desktop
	@echo "$(CYAN)$(CHECKMARK) All parts built$(RESET)"

# Start app
start: rebuild-deps
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

	$(MAKE) desktop$/config.json CONFIG_ENV=$(CONFIG_ENV)

	@npx concurrently -k \
	-n "Calypso,Desktop" \
	"$(MAKE) calypso-dev NODE_ENV=$(NODE_ENV) CALYPSO_ENV=$(CALYPSO_ENV)" \
	"wait-on http://localhost:3000 && $(MAKE) build-desktop NODE_ENV=$(NODE_ENV)" \

# Start app in dev mode
dev: NODE_ENV = development
dev: DEBUG = desktop:*
dev: 
	$(MAKE) start NODE_ENV=$(NODE_ENV) DEBUG=$(DEBUG)


BASE_CONFIG := $(THIS_DIR)/desktop-config/config-base.json
ENV_CONFIG := $(THIS_DIR)/desktop-config/config-$(CONFIG_ENV).json

.PHONY: desktop$/config.json
desktop$/config.json:
ifeq (,$(wildcard $(ENV_CONFIG)))
	$(warning Config file for environment "$(CONFIG_ENV)" does not exist. Ignoring environment.)
else
	$(eval EXTENDED = true)
endif
	@node -e "const base = require('$(BASE_CONFIG)'); let env; try { env = require('$(ENV_CONFIG)'); } catch(err) {} console.log( JSON.stringify( Object.assign( base, env ), null, 2 ) )" > $@
	
	@echo "$(GREEN)$(CHECKMARK) Config built $(if $(EXTENDED),(extended: config-$(CONFIG_ENV).json),)$(RESET)"

# Build calypso bundle
build-calypso: 
	@cd $(CALYPSO_DIR) && CALYPSO_ENV=$(CALYPSO_ENV) MINIFY_JS=$(MINIFY_JS) NODE_ARGS=$(NODE_ARGS) npm run -s build

	@echo "$(CYAN)$(CHECKMARK) Calypso built$(RESET)"

# Run Calypso server
calypso-dev: 
	@echo "$(CYAN)Starting Calypso...$(RESET)"

	@cd $(CALYPSO_DIR) && CALYPSO_ENV=$(CALYPSO_ENV) npm run -s start

# Build desktop bundle
build-desktop:
ifeq ($(NODE_ENV),development)
	@echo "$(CYAN)$(CHECKMARK) Starting Desktop Server...$(RESET)"
endif

	NODE_PATH=calypso$/server$(ENV_PATH_SEP)calypso$/client CALYPSO_SERVER=true npx webpack --config $(THIS_DIR)$/webpack.config.js

	@echo "$(CYAN)$(CHECKMARK) Desktop built$(RESET)"

# Package App
package:
	@npx electron-builder build -$(BUILD_PLATFORM)

	@echo "$(CYAN)$(CHECKMARK) App built$(RESET)"

# Combined steps for building app 
build: build-source package

# Perform checks
checks: check-node-version-parity secret


# Check for secret and confirm proper clientid for production release
secret:
ifneq (,$(wildcard $(CALYPSO_DIR)$/config$/secrets.json))
ifeq (release,$(CONFIG_ENV))
ifneq (43452,$(shell node -p "require('$(CALYPSO_DIR)$/config$/secrets.json').desktop_oauth_client_id"))
	$(error "desktop_oauth_client_id" must be "43452" in $(CALYPSO_DIR)$/config$/secrets.json)
endif
endif
else 
	$(error $(CALYPSO_DIR)$/config$/secrets.json does not exist)
endif


# Sed to strip leading v to ensure 'v1.2.3' and '1.2.3' can match.
# The .nvmrc file may contain either, `node --version` prints with 'v' prefix.
CALYPSO_NODE_VERSION := $(shell cat calypso/.nvmrc | sed -n 's/v\{0,1\}\(.*\)/\1/p')
CURRENT_NODE_VERSION := $(shell node --version | sed -n 's/v\{0,1\}\(.*\)/\1/p')

# Check that the current node & npm versions are the versions Calypso expects to ensure it is built safely.
check-node-version-parity:
ifneq ("$(CALYPSO_NODE_VERSION)", "$(CURRENT_NODE_VERSION)")
	$(error Please ensure that wp-desktop is using NodeJS $(CALYPSO_NODE_VERSION) to match wp-calypso before continuing. 	Current NodeJS version: $(CURRENT_NODE_VERSION))
else 
	@echo $(GREEN)$(CHECKMARK) Current NodeJS version is on par with Calypso \($(CALYPSO_NODE_VERSION)\) $(RESET)
endif

.PHONY: rebuild-deps
rebuild-deps:
	@npx electron-rebuild

test: CONFIG_ENV = test
test: rebuild-deps
	@echo "$(CYAN)Building test...$(RESET)"

	@$(MAKE) desktop$/config.json CONFIG_ENV=$(CONFIG_ENV)
	
	@NODE_PATH=calypso$/server$(ENV_PATH_SEP)calypso$/client npx webpack --config .$/webpack.config.test.js
	@CALYPSO_PATH=`pwd` npx electron-mocha --inline-diffs --timeout 15000 .$/build$/desktop-test.js

distclean: clean
	@cd calypso; npm run distclean
	@rm -rf .$/node_modules

clean:
	@cd calypso; npm run clean
	@rm -rf .$/release
	@rm -rf .$/build

.PHONY: test build-source
