# TODO: Building w/ Ubuntu to support/install
# git >= 2.13, which is required by Husky for 
# Calypso. Ubuntu is much slower to build than
# the default Alpine "node" image, but perhaps
# we can publish it to enable faster builds.
FROM node:10.16.3

ENV MINIFY_JS=true
ENV CALYPSO_ENV=desktop
ENV CALYPSO_SERVER=true

ARG node_args=--max_old_space_size=8192
ENV NODE_ARGS=$node_args