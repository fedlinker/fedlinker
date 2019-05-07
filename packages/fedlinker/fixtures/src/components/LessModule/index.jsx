import React from 'react';
import styles from './index.module.less';

export default function LessModule(props) {
  return <div className={styles.lessModule} {...props} />;
}
