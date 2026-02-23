#!/bin/bash
sudo --preserve-env=PATH -E bash -c "source /usr/local/share/nvm/nvm.sh && nvm install 24"
sudo --preserve-env=PATH -E uv pip install --upgrade --force-reinstall homeassistant
sudo --preserve-env=PATH -E uv pip show homeassistant | grep -i version: | cut -d ' ' -f 2 | sudo tee /config/.HA_VERSION
sudo --preserve-env=PATH -E container setup
yarn install --frozen-lockfile
