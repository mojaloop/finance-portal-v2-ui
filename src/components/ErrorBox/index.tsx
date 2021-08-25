import React, { FC } from 'react';
// @ts-ignore
import { MessageBox } from '@modusbox/modusbox-ui-components/dist/index';

const ErrorBox: FC<unknown> = ({ children }) => (
  <MessageBox kind="danger" icon="warning-sign" size={20} fontSize={14}>
    {children}
  </MessageBox>
);
export default ErrorBox;
