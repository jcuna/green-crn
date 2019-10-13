FROM debian:latest

RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - &&\
    apt-get install -y nodejs && \
    npm i -g npm

WORKDIR /app
