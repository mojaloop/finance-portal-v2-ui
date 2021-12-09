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
import users from '../../manifests/backend/users.json'

dotenv.config();

function ensureEnv(e: string): string {
  const result = process.env[e];
  assert.notStrictEqual(typeof result, 'undefined', `Required ${e} to be set in the environment`);
  return result as string;
}

const ingressHost = 'localhost';
const ingressPort = ensureEnv('INGRESS_PORT');
const voodooPort = 3030;

// TODO: ajv
export const config = {
  financePortalEndpoint: ensureEnv('FINANCE_PORTAL_ENDPOINT'),
  voodooEndpoint: `ws://${ingressHost}:${voodooPort}/voodoo`,
  reportBasePath: `http://${ingressHost}:${ingressPort}/report`,
  settlementsBasePath: `http://${ingressHost}:${ingressPort}/api/settlement`,
  ledgerBasePath: `http://${ingressHost}:${ingressPort}/api/ledger`,
  credentials: {
    admin: {
      username: users[0].username,
      password: users[0].password,
    },
    user: {
      username: users[1].username,
      password: users[1].password,
    },
  },
  voodooTimeoutMs: 30000,
};
