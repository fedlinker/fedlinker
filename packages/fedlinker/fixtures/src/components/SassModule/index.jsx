import React from 'react';
import styles from './index.module.scss';

export default function SassModule(props) {
  return <div className={styles.sassModule} {...props} />;
}
