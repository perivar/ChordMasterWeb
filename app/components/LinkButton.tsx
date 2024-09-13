import { Link } from "@remix-run/react";

type LinkButtonProps = {
  title?: string;
  url?: string;
};

const LinkButton = ({ title, url }: LinkButtonProps) => {
  return <div className="mt-4">{url && <Link to={url}>{title}</Link>}</div>;
};

export default LinkButton;
