#!/usr/bin/env bash

if [[ "$1" != "" && "$1" != "stop" && "$1" != "ssh" && "$1" != "build" && "$1" != "test" && "$1" != "run" \
  && "$1" != "test-cov" ]]; then

    printf "Bad argument ${1}.\n"
    printf "Options:\n"
    printf "\t<no args>          -- Starts or restarts service\n"
    printf "\t<stop>             -- Stops serice\n"
    printf "\t<ssh>              -- Logs into containers bash console\n"
    printf "\t<build>            -- Builds a prod ready docker image\n"
    printf "\t<test>             -- Runs pytest on the api\n"
    printf "\t<test-cov>         -- Runs pytest on the api with coverage\n"
    printf "\t<run>              -- Runs an arbitrary command in the api container\n"
    exit 1;
fi

LATEST_API=1.3
APP_NAME="green-crn"
API_IMG_NAME="$APP_NAME-api"
API_CONTAINER_NAME="docker_api_"

get_container_id() {

    CONTAINER_SSH=$1
    IMAGE_NAME=$(docker ps --format '{{.Names}} {{.Image}}' | grep $CONTAINER_SSH | grep -oE "^[1-9_a-zA-Z]+")
    echo $(docker ps -a -q --filter name="$IMAGE_NAME" --format="{{.ID}}")
}

run_tests() {
    CONTAINER_ID=$(get_container_id ${API_CONTAINER_NAME})
    FLAGS="-ra"
    APPEND="${@:2}"
    if [[ "$2" == "--flags" ]]; then
      FLAGS="$FLAGS $3"
      APPEND="${@:4}"
    fi
    COMMAND="pytest $FLAGS tests/$APPEND"
    printf "%s\n" "$COMMAND"

    docker exec -ti "$CONTAINER_ID" bash -c \
        "PYTHONDONTWRITEBYTECODE=1 APP_SETTINGS_PATH='/tmp/settings.py' $COMMAND"
    exit $?
}

if [[ ! -f "./docker/docker-compose.yml" ]]; then
    printf "Call me from isc-api's root directory.\n"
    exit 1
fi

if [[ "$1" == "test" ]]; then
    run_tests "${@:0}"
fi

if [[ "$1" == "test-cov" ]]; then
    run_tests "${@:0}" " --cov=. --cov-config=tests/.coveragerc"
fi

if [[ "$1" == "run" ]]; then
    CONTAINER_ID=$(get_container_id ${API_CONTAINER_NAME})
    docker exec -ti "$CONTAINER_ID" bash -c "${@:2}"
    exit $?
fi

if [[ "$1" == "ssh" ]]; then
    if [[ "$2" = "" ]]; then
        CONTAINER_SSH=$API_CONTAINER_NAME
    else
        CONTAINER_SSH="$2"
    fi

    CONTAINER_ID=$(get_container_id ${CONTAINER_SSH})

    if [[ ! -z "$CONTAINER_ID" ]]; then
        docker exec -ti "$CONTAINER_ID" /bin/bash
    else
        printf "Could not find container, is it even running?\n"
        exit 1
    fi
    exit
fi

if [[ "$1" == "build" ]]; then
  if [[ ! -f ./api/config/settings.py ]]; then
    printf "No prod settings.py file to build with config\n"
    exit 1
  fi

  docker rmi $(docker images | grep $API_IMG_NAME | grep -oE [0123456789abcdef]{12}) 2> /dev/null
  docker build -t "$API_IMG_NAME:$LATEST_API" -f ./docker/prod.Dockerfile .
  [[ $? -eq 0 ]] && docker images "$API_IMG_NAME:$LATEST_API" && exit 0 || exit 1

fi


if [[ ! -d "db" ]]; then
  mkdir -p 'db'
fi


if [[ "$1" == "stop" ]]; then
    APP_NAME=$APP_NAME API_IMG=${API_IMG_NAME}:${LATEST_API} docker-compose -f docker/docker-compose.yml down
    exit;
fi

if [[ "$1" == "" ]]; then
    APP_NAME=$APP_NAME API_IMG=${API_IMG_NAME}:${LATEST_API} docker-compose -f docker/docker-compose.yml down > /dev/null 2>&1

    if [[ "$(docker images -q "$API_IMG_NAME:$LATEST_API" 2> /dev/null)" = "" ]]; then
        printf "New image version found! need to rebuild\n"
        docker rmi $(docker images | grep $API_IMG_NAME | grep -oE [0123456789abcdef]{12}) 2> /dev/null
        docker build -t "$API_IMG_NAME:$LATEST_API" -f ./docker/Dockerfile ./api
    fi
    FILES="-f docker/docker-compose.yml"
    if [[ -f "docker/docker-compose-override.yml" ]]; then
        FILES="$FILES -f docker/docker-compose-override.yml"
    fi
   APP_NAME=$APP_NAME API_IMG=${API_IMG_NAME}:${LATEST_API} docker-compose $(echo "$FILES up -d");
fi;


printf "\nhttp://%s.localhost/\n" $APP_NAME
printf "http://portainer.localhost/\n"
printf "http://mailhog.localhost/\n"
printf "http://supervisor.localhost/\n"
printf "http://crons.localhost/\n"
printf "http://localhost:8080/\n"

exit 0
