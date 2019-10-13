#!/bin/sh

cd $APP_PATH

npm install

if [ ! -d "$APP_PATH/log" ]; then
    mkdir "$APP_PATH/log"
fi

if [ "$APP_ENV" = "development" ]; then
    npm run start:dev > "$APP_PATH/log/build.log" 2>&1
else
    #rm -rf css && rm -rf js && rm -rf node_modules &&
    npm run build && cp -r . /static_files && printf "success...\n"
fi
