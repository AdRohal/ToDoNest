import React from 'react';
import './App.css';

const BackgroundWrapper = ({ children }) => {
  return <div className="background">{children}</div>;
};

export default BackgroundWrapper;