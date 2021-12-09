#!/bin/sh
# voodooVrOj2LrbqF5Hf9NaZwZDW6DY
# curl \
#     -i \
#     -X PUT \
#     -H 'accept: application/json' \
#     -H 'content-type: application/json' \
#     --data '{ "state": "PS_TRANSFERS_RESERVED", "reason": "any", "externalReference": "whatever" }' \
#     'localhost:8000/api/settlement/v2/settlements/3/participants/11/accounts/19'
# voodooe7LLivm98FsaI8j0eTvnpF3m
curl \
    -i \
    -X PUT \
    -H 'accept: application/json' \
    -H 'content-type: application/json' \
    --data '{ "state": "PS_TRANSFERS_RESERVED", "reason": "any", "externalReference": "whatever" }' \
    'localhost:8000/api/settlement/v2/settlements/3/participants/12/accounts/21'
