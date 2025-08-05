import { Box } from "@mui/material";
import BaseUrl from "apis/baseUrl";
import DefaultProfile from "../assests/default/defaultProfile.jpg";
import { useEffect, useState } from "react";

const UserImage = ({ image, size = "60px" }) => {
  const [finalImage, setFinalImage] = useState(null);

  useEffect(() => {
    if (!image) {
      console.warn("No image provided, using default profile image.");
      setFinalImage(DefaultProfile);
      return;
    }

    const isExternal =
      image.startsWith("http://") || image.startsWith("https://");

    setFinalImage(isExternal ? image : `${BaseUrl}/assets/${image}`);
  }, [image]);

  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt="user"
        src={finalImage}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DefaultProfile;
        }}
      />
    </Box>
  );
};

export default UserImage;
