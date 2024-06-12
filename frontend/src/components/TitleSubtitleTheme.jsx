import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "./ColorTheme";

const Header = ({ title, subtitle }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return ( 
        <Box mb="30px">
            <Typography
                variant="h3"
                color={colors.grey[100]}
                fontWeight="bold"
                // sx={{ m: "0 0 5px 0" }}
            >
                {title}
            </Typography>

            <Typography variant="h6" fontSize={"16px"} fontWeight="bold" color="#3eb3ed">
                {subtitle}
            </Typography>
        </Box>
    );
};

export default Header;