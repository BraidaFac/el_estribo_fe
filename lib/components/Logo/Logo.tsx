import Link from 'next/link';
import styles from './Logo.module.css';
const Logo = () => (
  <Link href="/">
    <span style={{ marginLeft: '-10px' }} className={styles.icon}></span>
  </Link>
);

export default Logo;
