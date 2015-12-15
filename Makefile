THIS_MAKEFILE_PATH := $(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR := $(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

NPM ?= $(NODE) $(shell which npm)
NPM_BIN = @$(shell npm bin)

RED=`tput setaf 1`
RESET=`tput sgr0`

START_APP := $(NPM_BIN)/electron .
CONFIG := $(THIS_DIR)/desktop/config.json
DESKTOP_CONFIG := $(THIS_DIR)/desktop-config
BUILDER := $(THIS_DIR)/build.js
BUILD_CONFIG := $(THIS_DIR)/resource/build-scripts/build-config-file.js
PACKAGE_MAS := $(THIS_DIR)/resource/build-scripts/package-mas.js
PACKAGE_DMG := $(THIS_DIR)/resource/build-scripts/package-dmg.js
PACKAGE_WIN32 := @$(NPM_BIN)/electron-builder
CERT_SPC := $(THIS_DIR)/resource/secrets/automattic-code.spc
CERT_PVK := $(THIS_DIR)/resource/secrets/automattic-code.pvk
CALYPSO_DIR := $(THIS_DIR)/calypso
CALYPSO_JS_STD := $(CALYPSO_DIR)/public/build-desktop.js
CALYPSO_JS_MAS := $(CALYPSO_DIR)/public/build-desktop.js
CALYPSO_CHANGES_STD := `find "$(CALYPSO_DIR)" -newer "$(CALYPSO_JS_STD)" \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.scss" \) -type f -print -quit | grep -v .min. | wc -l`
CALYPSO_CHANGES_MAS := `find "$(CALYPSO_DIR)" -newer "$(CALYPSO_JS_MAS)" \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.scss" \) -type f -print -quit | grep -v .min. | wc -l`
CALYPSO_BRANCH = $(shell git --git-dir ./calypso/.git branch | sed -n -e 's/^\* \(.*\)/\1/p')

# Just runs Electron with whatever version of Calypso exists
run: config-dev build-if-changed
	$(START_APP)

run-release: config-release build-if-changed
	$(START_APP)

run-mas: config-mas build-if-changed
	$(START_APP)

# Builds Calypso (desktop)
build: install
	@echo "Building Calypso (Desktop on branch $(RED)$(CALYPSO_BRANCH)$(RESET))"
	@CALYPSO_ENV=desktop make build -C $(THIS_DIR)/calypso/
	@rm $(THIS_DIR)/calypso/public/devmodules.*

build-if-not-exists:
	@if [ -f $(CALYPSO_JS_STD) ]; then true; else make build; fi

build-if-changed: build-if-not-exists
	@if [ $(CALYPSO_CHANGES_STD) -eq 0 ]; then true; else make build; fi;

# Builds Calypso (Mac App Store)
build-mas: install
	@echo "Building Calypso (Mac App Store on branch $(RED)$(CALYPSO_BRANCH)$(RESET))"
	@CALYPSO_ENV=desktop-mac-app-store make build -C $(THIS_DIR)/calypso/
	@rm $(THIS_DIR)/calypso/public/devmodules.*
	@cp $(CALYPSO_JS_MAS) $(CALYPSO_JS_STD)

build-mas-if-not-exists:
	@if [ -f $(CALYPSO_JS_MAS) ]; then true; else make build; fi

build-mas-if-changed: build-mas-if-not-exists
	@if [ $(CALYPSO_CHANGES_MAS) -eq 0 ]; then true; else make build-mas; fi;

# Build packages
osx: config-release build-if-changed
	@node $(BUILDER) darwin

linux: config-release build-if-changed
	@node $(BUILDER) linux

win32: config-release build-if-changed
	@node $(BUILDER) win32

mas: config-mas build-mas-if-changed
	@node $(BUILDER) mas

updater: config-updater
	@node $(BUILDER) darwin

# Packagers

package-win32: win32
	@$(PACKAGE_WIN32) ./release/WordPress.com-win32-ia32 --platform=win --out=./release --config=./resource/build-config/win32-package.json
	@node $(THIS_DIR)/resource/build-scripts/rename-with-version-win.js
	@node $(THIS_DIR)/resource/build-scripts/code-sign-win.js --spc=$(CERT_SPC) --pvk=$(CERT_PVK)

package-osx: osx
	@node $(PACKAGE_DMG)
	@ditto -c -k --sequesterRsrc --keepParent --zlibCompressionLevel 9 ./release/WordPress.com-darwin-x64/WordPress.com.app ./release/WordPress.com.app.zip
	@node $(THIS_DIR)/resource/build-scripts/rename-with-version-osx.js

package-mas: mas
	@node $(PACKAGE_MAS)

# Copy config files
config-dev: install
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-dev.json > $(CONFIG)

config-release: install
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-release.json > $(CONFIG)

config-mas: install
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-mac-app-store.json > $(CONFIG)

config-updater: install
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-updater.json > $(CONFIG)

# NPM
install: node_modules

node_modules/%:
	@$(NPM) install $(notdir $@)

node_modules: package.json
	@$(NPM) prune
	@$(NPM) install
	@touch node_modules

lint: node_modules/eslint node_modules/eslint-plugin-react node_modules/babel-eslint
	@$(NPM_BIN)/eslint ./desktop/

eslint: lint

.PHONY: run
