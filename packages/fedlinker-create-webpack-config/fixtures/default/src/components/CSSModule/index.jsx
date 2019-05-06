import React from 'react';
import styles from './index.module.css';

export default function CSSModule(props) {
  return <div className={styles.cssModule} {...props} />;
}
