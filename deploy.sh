#!/bin/bash

sudo docker stop $(docker ps -a -q)
sudo docker rmi $(docker images -a -q)
sudo docker rm $(docker ps -a -q)

sudo docker images -a
sudo docker container prune -f
sudo docker-compose rm -f
sudo docker-compose up -d --build database redis server spa
