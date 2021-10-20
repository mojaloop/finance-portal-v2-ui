import React, { FC } from 'react';

type Page = {};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Page: FC<Page> = ({ children }) => {
  return <div className="layout__page">{children}</div>;
};
