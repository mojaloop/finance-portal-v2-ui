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
import * as assert from 'assert';

dotenv.config();

function ensureEnv(e: string): string {
  const result = process.env[e];
  assert.notStrictEqual(typeof result, 'undefined', `Required ${e} to be set in the environment`);
  return result as string;
}

// TODO: ajv
export const config = {
  financePortalEndpoint: ensureEnv('FINANCE_PORTAL_ENDPOINT'),
  credentials: {
    admin: {
      username: ensureEnv('ADMIN_USER_NAME'),
      password: ensureEnv('ADMIN_PASSWORD'),
    },
    user: {
      username: ensureEnv('USER_NAME'),
      password: ensureEnv('PASSWORD'),
    },
  },
};
