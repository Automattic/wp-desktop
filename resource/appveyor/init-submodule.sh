#!/bin/bash

git submodule init

cached_hash=$(echo $(cat calypso-hash 2> /dev/null) || '')
current_hash=$(echo $(git rev-parse @:./calypso))

echo "Calypso cached SHA: $cached_hash"
echo "Calpyso current SHA: $current_hash"

if [ -f calypso-hash ] && [ "$cached_hash" = "$current_hash" ]; then
    echo "Using cached calypso with SHA: $current_hash"
else
    echo "SHA mismatch, initializing calypso at SHA: $current_hash"
    rm -rf calypso
    git submodule update
fi
