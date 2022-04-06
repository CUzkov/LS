#!/bin/bash

sudo docker-compose rm -f
sudo docker-compose up -d --build database redis server