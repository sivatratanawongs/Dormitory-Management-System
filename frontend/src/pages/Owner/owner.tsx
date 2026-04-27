import { Box, Toolbar, AppBar, Typography, Paper, Container } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {  Calculator, UserCircle, Settings, Home, History } from "lucide-react";

const menuItems = [
  { title: "ประวัติค่าห้อง", icon: <History size={24} />, path: "/owner/history" },
  { title: "บันทึกมิเตอร์", icon: <Calculator size={24} />, path: "/owner/billings" },
  { title: "ผู้เช่า", icon: <UserCircle size={24} />, path: "/owner/tenants" },
  { title: "ตั้งค่า", icon: <Settings size={24} />, path: "/owner/settings" },
];

const OwnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AppBar position="fixed" sx={{ bgcolor: "#0f172a", boxShadow: "none", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            onClick={() => navigate("/owner/billings")}
            sx={{
              fontWeight: "bold",
              display: "flex", 
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer"
            }}
          >
            <Home size={24} color="#38bdf8" />
            <Box component="span" sx={{ display: { xs: "none", sm: "block" } }}>หอพักบ้านจตุพร</Box>
          </Typography>

          <Box sx={{ display: "flex", gap: { xs: 0.5, md: 2 } }}>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path); 
              
              return (
                <Box
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: { xs: "80px", md: "120px" }, 
                    px: 1,
                    py: 1,
                    cursor: "pointer",
                    borderRadius: 2,
                    transition: "0.2s",
                    color: isActive ? "#38bdf8" : "#94a3b8",
                    bgcolor: isActive ? "rgba(56, 189, 248, 0.1)" : "transparent",
                    "&:hover": {
                      color: "#f8fafc",
                      bgcolor: "rgba(255,255,255,0.05)",
                    },
                  }}
                >
                  {item.icon}
                  <Typography
                    variant="caption"
                    sx={{ 
                      fontWeight: isActive ? "bold" : "normal", 
                      mt: 0.5,
                      fontSize: { xs: "0.7rem", md: "0.75rem" } 
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, flexGrow: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 4 },
            borderRadius: { xs: 2, md: 4 },
            border: "1px solid #e2e8f0",
            minHeight: "80vh",
            bgcolor: "#ffffff",
          }}
        >
          <Outlet /> 
        </Paper>
      </Container>
    </Box>
  );
};

export default OwnerLayout;
