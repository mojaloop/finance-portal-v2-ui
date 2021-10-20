#!/bin/bash
sed -i 's#__REMOTE_1_URL__#'"$REMOTE_1_URL"'#g' dist/runtime-env.js
sed -i 's#__REMOTE_1_URL__#'"$REMOTE_1_URL"'#g' dist/index.html

sed -i 's#__REMOTE_2_URL__#'"$REMOTE_2_URL"'#g' dist/runtime-env.js
sed -i 's#__REMOTE_2_URL__#'"$REMOTE_2_URL"'#g' dist/index.html

exec "$@"

