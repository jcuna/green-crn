FROM python:3.7.4-alpine
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY ./requirements.txt /build/requirements.txt
WORKDIR /usr/src/app

RUN python -m pip install --upgrade pip

RUN apk add --no-cache \
            # Virtual Framebuffer 'fake' X server
            xvfb \
            # Additionnal dependencies for better PDF rendering
            ttf-freefont \
            fontconfig \
            dbus

RUN apk add --no-cache bash jpeg-dev zlib-dev wkhtmltopdf

RUN apk add --no-cache postgresql-libs \
    && apk add --no-cache --virtual .build-deps gcc libffi-dev musl-dev postgresql-dev \
    && pip install pydevd-pycharm~=201.6487.18 \
    && pip install -r /build/requirements.txt --no-cache-dir \
    && apk --purge del .build-deps
