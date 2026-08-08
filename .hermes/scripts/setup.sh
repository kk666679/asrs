#!/bin/bash
npm install
cp .env.example .env
docker-compose up -d
echo "Done! Run 'npm run hermes -- \"Move SKU-1234 to Zone-B\"' to test."
