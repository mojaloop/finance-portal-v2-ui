 /**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Sridevi Miriyala - sridevi.miriyala@modusbox.com                   *
 **************************************************************************/

require('dotenv').config();
const env = require('env-var');

module.exports = {
    financePortalEndpoint: env.get('FINANCE_PORTAL_ENDPOINT').asString(),
    credentials: {
        admin: {
            username: env.get('ADMIN_USER_NAME').asString(),
            password: env.get('ADMIN_PASSWORD').asString(),
        },
        user: {
            username: env.get('USER_NAME').asString(),
            password: env.get('PASSWORD').asString(),
        },
    },
};
