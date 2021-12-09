curl \
    -H 'content-type: application/json' \
    -H 'accept: application/json' \
    -X PUT \
    --data '{ "currency": "MMK", "limit": { "alarmPercentage": 10, "value": 20000, "type": "NUMBERWANG" } }' \
    'localhost:8000/api/ledger/participants/testfspmmk1/limits' 
