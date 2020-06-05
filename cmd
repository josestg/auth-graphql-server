#!/bin/bash

if [ $# -eq 0 ]
  then
    printf "No arguments supplied\n"
    printf "commands: \n\n"
    printf "\tbuild \t\t: docker build -t ts-server-graphql.\n"
    printf "\tup \t\t: docker-compose up -d\n"
    printf "\tdown \t\t: docker-compose down\n"
    printf "\tlog \t\t: docker-compose logs\n"

    exit 1
fi

arg=$1
if [[ $arg == "build" ]]
then
  eval "docker build -t ts-server-graphql ."
elif [[ $arg == "up" ]]
then
  eval "docker-compose up -d"
elif [[ $arg == "down" ]]
then
  eval "docker-compose down"
elif [[ $arg == "log" ]]
then
  eval "docker-compose logs"
else
  echo "$arg is not command."
fi