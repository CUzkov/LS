#!/bin/bash

sudo docker-compose rm -f
sudo docker-compose up --build database redis server