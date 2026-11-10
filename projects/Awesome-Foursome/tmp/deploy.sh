#!/bin/bash
WD="/home/team3/app"
COMPOSE_FILE="remote-compose.yaml"
REPO_URL="https://raw.git.ntnu.no/iselinch/Awesome-Foursome/refs/heads/main/"

# access compose.yaml
curl -sS "${REPO_URL}/${COMPOSE_FILE}"

# stop the project
docker compose -f "${WD}/${COMPOSE_FILE}" down
# start the project
docker compose -f "${WD}/${COMPOSE_FILE}" up