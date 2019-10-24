FROM python:3.7.4-alpine
MAINTAINER Jon Cuna <jcuna@joncuna.com>

COPY ./requirements.txt /build/requirements.txt
WORKDIR /usr/src/app

RUN python -m pip install --upgrade pip

RUN apk add --no-cache bash ssmtp jpeg-dev zlib-dev \
    && sed -i 's/^\(mailhub=\).*$/\1mailhog:1025/' /etc/ssmtp/ssmtp.conf \
    && echo "FromLineOverride=YES" >> /etc/ssmtp/ssmtp.conf

RUN apk add --no-cache postgresql-libs \
    && apk add --no-cache --virtual .build-deps gcc libffi-dev musl-dev postgresql-dev \
    && pip install pydevd-pycharm~=191.7479.19 \
    && pip install -r /build/requirements.txt --no-cache-dir \
    && apk --purge del .build-deps
