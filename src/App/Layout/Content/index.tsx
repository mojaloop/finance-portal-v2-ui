import React, { FC } from 'react';

export const Content: FC<unknown> = ({ children }) => {
  return <div className="layout__content">{children}</div>;
};
