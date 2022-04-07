#!/bin/bash
sudo docker system prune -f
sudo docker-compose -f ./docker-compose.db-and-redis.dev.yml --env-file ./.env.dev up --build database redis
