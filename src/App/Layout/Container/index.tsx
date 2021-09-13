import React, { FC } from 'react';

export const Container: FC<unknown> = ({ children }) => {
  return <div className="layout__container">{children}</div>;
};
