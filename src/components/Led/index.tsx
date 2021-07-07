import React, { FC } from 'react';
import classnames from 'classnames';
import './Led.css';

interface LedProps {
  colorName: string;
}

const Led: FC<LedProps> = ({ colorName }) => <span className={classnames(['led', `led--${colorName}`])} />;

export default Led;
