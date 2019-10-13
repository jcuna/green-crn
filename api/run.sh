#!/bin/sh

cd ${APP_PATH}

if [ ! -d "$APP_PATH/log" ]; then
    mkdir "$APP_PATH/log"
fi

if [ "$APP_ENV" = "development" ]; then
    rm -rf log/*

    #supervisord

    while true
    do
        python3 app.py >> "$APP_PATH/log/app.log" 2>&1
        sleep 2
    done
    # for prod like behavior
    #gunicorn --worker-class eventlet --bind :5000 wsgi:app --reload --timeout 300 --log-level=debug --log-file=- >> "$APP_PATH/log/app.log" 2>&1
else
    export APP_ENV='production'
    gunicorn --worker-class eventlet --bind :5000 wsgi:app --log-level info
fi
