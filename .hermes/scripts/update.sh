#!/bin/bash
git pull
npm install
docker-compose restart
echo "Updated."
