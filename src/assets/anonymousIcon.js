import incognitoIcon from "./incognito.svg";

const AnonymousIcon = ({ size = 16, className = "" }) => {
  return (
    <img
      src={incognitoIcon}
      alt="Anonymous"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default AnonymousIcon;
