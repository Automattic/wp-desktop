#!/bin/bash

git submodule init

cached_hash=$(echo $(cat calypso-hash 2> /dev/null) || '')
current_hash=$(echo $(git rev-parse @:./calypso))

echo "Calypso cached SHA: $cached_hash"
echo "Calpyso current SHA: $current_hash"

if [ -f calypso-hash ] && [ "$cached_hash" = "$current_hash" ]; then
    echo "Using built calypso from cache for SHA: $current_hash"
else
    echo "Initializing calypso submodule with SHA: $current_hash"
    rm -rf calypso
    git submodule update
fi
