 /**************************************************************************
 *  (C) Copyright ModusBox Inc. 2020 - All rights reserved.               *
 *                                                                        *
 *  This file is made available under the terms of the license agreement  *
 *  specified in the corresponding source code repository.                *
 *                                                                        *
 *  ORIGINAL AUTHOR:                                                      *
 *       Sridevi Miriyala - sridevi.miriyala@modusbox.com                   *
 **************************************************************************/

import * as dotenv from 'dotenv';

dotenv.config();

// TODO: ajv
export const config = {
  financePortalEndpoint: process.env.FINANCE_PORTAL_ENDPOINT,
  credentials: {
    admin: {
      username: process.env.ADMIN_USER_NAME,
      password: process.env.ADMIN_PASSWORD,
    },
    user: {
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
    },
  },
};
