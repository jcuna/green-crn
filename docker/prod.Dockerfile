FROM python:3.7.4-alpine
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY ./api /usr/src/app
COPY ./docker/supervisord.conf /etc/supervisord.conf
WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/log

RUN apk add --no-cache bash ssmtp jpeg-dev zlib-dev postgresql-libs

RUN apk add --no-cache --virtual .build-deps gcc libffi-dev musl-dev postgresql-dev \
    && pip install -r requirements.txt --no-cache-dir \
    && apk --purge del .build-deps
