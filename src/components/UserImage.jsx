import { Box } from "@mui/material";
import BaseUrl from "apis/baseUrl";

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
        src={isExternalUrl ? image : `${BaseUrl}/assets/${image}`}
      />
    </Box>
  );
};

export default UserImage;
