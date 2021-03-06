import React, { FC, ReactNode } from 'react';
import classnames from 'classnames';
import './DataLabel.css';

type DataLabelProps = {
  children: ReactNode;
  size?: 's' | 'm' | 'l';
  underline?: boolean;
  bold?: boolean;
  highlight?: boolean;
  light?: boolean;
  className?: string;
  id?: string;
};

const DataLabel: FC<DataLabelProps> = ({
  children,
  size = 'm',
  underline = false,
  bold = false,
  highlight = false,
  light = false,
  className = '',
  id,
}) => {
  const dataLabelClassName = classnames([
    size === 'l' && 'data-label--large',
    size === 'm' && 'data-label--medium',
    size === 's' && 'data-label--small',
    highlight && 'data-label--highlight',
    bold && 'data-label--bold',
    light && 'data-label--light',
    underline && 'data-label--underline',
    className,
  ]);
  return (
    <span id={id} className={dataLabelClassName}>
      {children}
    </span>
  );
};

export default DataLabel;
