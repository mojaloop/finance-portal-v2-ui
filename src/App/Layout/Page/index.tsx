import React, { FC } from 'react';

type Page = {};

export const Page: FC<Page> = ({ children }) => {
  return <div className="layout__page">{children}</div>;
};
