import { Box } from "@mui/material";

const UserImage = ({ image, size = "60px" }) => {
  const isExternalUrl =
    image?.startsWith("http://") || image?.startsWith("https://");

  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt="user"
        src={isExternalUrl ? image : `http://localhost:3001/assets/${image}`}
      />
    </Box>
  );
};

export default UserImage;
