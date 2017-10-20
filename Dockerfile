FROM	debian:stretch

MAINTAINER Automattic

WORKDIR /wp-desktop

# Version Numbers
ENV NVM_VERSION 0.33.2

# Install dependencies
RUN	apt-get -y update && apt-get -y install gnupg && \
	  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN	echo "deb http://download.mono-project.com/repo/debian stretch main" | tee /etc/apt/sources.list.d/mono-official.list
RUN	dpkg --add-architecture i386 
RUN     apt-get -y update && apt-get -y install \
          wget \
          git \
          python \
          make \
          build-essential \
	  curl \
          ruby ruby-dev \
	  nsis mono-devel wine wine32 \
	  unzip
RUN	gem install fpm

# Configure non-root account
RUN	useradd -m distiller

RUN	chown -R distiller /wp-desktop
USER    distiller

# Install nvm as user
RUN     curl -o- https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash

# Install the current version of NodeJS from .nvmrc
ADD	.nvmrc	/home/distiller
ENV	NVM_DIR /home/distiller/.nvm
RUN	cd $HOME && \
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || \
	nvm install
RUN	echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' >> $HOME/.bashrc
