THIS_MAKEFILE_PATH := $(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR := $(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

NPM ?= $(NODE) $(shell which npm)
NPM_BIN = $(shell npm bin)

RED=`tput setaf 1`
RESET=`tput sgr0`

START_APP := @$(NPM_BIN)/electron .
ELECTRON_TEST := ELECTRON_PATH=$(NPM_BIN)/electron $(NPM_BIN)/electron-mocha
CONFIG := $(THIS_DIR)/desktop/config.json
DESKTOP_CONFIG := $(THIS_DIR)/desktop-config
BUILDER := $(THIS_DIR)/builder.js
BUILD_CONFIG := $(THIS_DIR)/resource/build-scripts/build-config-file.js
PACKAGE_MAS := $(THIS_DIR)/resource/build-scripts/package-mas.js
PACKAGE_DMG := $(THIS_DIR)/resource/build-scripts/package-dmg.js
PACKAGE_WIN32 := @$(NPM_BIN)/electron-builder
CERT_SPC := $(THIS_DIR)/resource/secrets/automattic-code.spc
CERT_PVK := $(THIS_DIR)/resource/secrets/automattic-code.pvk
CALYPSO_DIR := $(THIS_DIR)/calypso
CALYPSO_JS := $(CALYPSO_DIR)/public/build.js
CALYPSO_JS_STD := $(CALYPSO_DIR)/public/build-desktop.js
CALYPSO_JS_MAS := $(CALYPSO_DIR)/public/build-desktop-mac-app-store.js
CALYPSO_CHANGES_STD := `find "$(CALYPSO_DIR)" -newer "$(CALYPSO_JS_STD)" \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.scss" \) -type f -print -quit | grep -v .min. | wc -l`
CALYPSO_CHANGES_MAS := `find "$(CALYPSO_DIR)" -newer "$(CALYPSO_JS_MAS)" \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.scss" \) -type f -print -quit | grep -v .min. | wc -l`
CALYPSO_BRANCH = $(shell git --git-dir ./calypso/.git branch | sed -n -e 's/^\* \(.*\)/\1/p')
FLAT_MODULE_CHECK := $(THIS_DIR)/node_modules/glob
FLAT_CALYPSO_CHECK := $(CALYPSO_DIR)/node_modules/glob

# check for secret
secret:
	@test -s $(THIS_DIR)/calypso/config/secrets.json || { echo "calypso/config/secrets.json not found. Required file, see docs/secrets.md"; exit 1; }

# Just runs Electron with whatever version of Calypso exists
run: config-dev build-if-changed
	@cp $(CALYPSO_JS_STD) $(CALYPSO_JS)
	$(START_APP)

run-release: config-release build-if-changed
	@cp $(CALYPSO_JS_STD) $(CALYPSO_JS)
	$(START_APP)

run-mas: config-mas build-mas-if-changed
	@cp $(CALYPSO_JS_MAS) $(CALYPSO_JS)
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
build-mas: install electron-rebuild
	@echo "Building Calypso (Mac App Store on branch $(RED)$(CALYPSO_BRANCH)$(RESET))"
	@CALYPSO_ENV=desktop-mac-app-store make build -C $(THIS_DIR)/calypso/
	@rm $(THIS_DIR)/calypso/public/devmodules.*

build-mas-if-not-exists:
	@if [ -f $(CALYPSO_JS_MAS) ]; then true; else make build-mas; fi

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

package-linux: linux
	@node $(THIS_DIR)/resource/build-scripts/package-linux.js

# Copy config files
config-dev: install
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-dev.json > $(CONFIG)

config-release: install secret
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-release.json > $(CONFIG)

config-mas: install secret
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-mac-app-store.json > $(CONFIG)

config-test: install secret
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-test.json > $(CONFIG)

config-updater: install secret
	@node $(BUILD_CONFIG) $(DESKTOP_CONFIG)/config-updater.json > $(CONFIG)

# NPM
install: node_modules
	@if [ -d $(FLAT_MODULE_CHECK) ] && [ -d $(FLAT_CALYPSO_CHECK) ]; then true; else echo "$(RED)You need to delete node_modules and calypso/node_modules and install again with NPM > 3$(RESET)"; exit 1; fi

node_modules/%:
	@$(NPM) install $(notdir $@)

node_modules: package.json
	@$(NPM) prune
	@$(NPM) install
	@touch node_modules

electron-rebuild:
	@$(NPM_BIN)/electron-rebuild

lint: node_modules/eslint node_modules/eslint-plugin-react node_modules/babel-eslint
	@$(NPM_BIN)/eslint ./desktop/

eslint: lint

# Testing
test: config-test
	@$(ELECTRON_TEST) --inline-diffs --timeout 5000 desktop/test

test-osx: osx
	@rm -rf ./release/WordPress.com-darwin-x64-unpacked
	@$(NPM_BIN)/asar e ./release/WordPress.com-darwin-x64/WordPress.com.app/Contents/Resources/app.asar ./release/WordPress.com-darwin-x64-unpacked
	@mkdir ./release/WordPress.com-darwin-x64-unpacked/node_modules/electron-mocha
	@cp -R ./node_modules/electron-mocha ./release/WordPress.com-darwin-x64-unpacked/node_modules/
	@NODE_PATH=./release/WordPress.com-darwin-x64-unpackaged/node_modules ELECTRON_PATH=$(NPM_BIN)/electron ./release/WordPress.com-darwin-x64-unpacked/node_modules/electron-mocha/bin/electron-mocha --inline-diffs --timeout 5000 ./resource/test/osx.js

.PHONY: run test
