#!/bin/sh

# Run the script before starting the server
sh dist/loadRuntimeConfig.sh

# This will exec the CMD from your Dockerfile, i.e. "npm start"
exec "$@"
