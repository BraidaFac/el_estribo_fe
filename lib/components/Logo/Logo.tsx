import Image from "next/image";
import Link from "next/link";

const Logo = () => (
  <Link
    href="/"
    className="inline-flex items-center"
    aria-label="Inicio El Estribo"
  >
    <Image
      src="/icon.png"
      alt="El Estribo"
      width={100}
      height={100}
      className="h-22 w-22 object-contain"
      priority
    />
  </Link>
);

export default Logo;
