import  { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Button, Card, CardMedia, IconButton, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Edit3, X, Check, Upload, Trash2 } from "lucide-react";
import { SettingService, type IPaymentSetting } from "../../../../../services/settingService";
import { useLoading } from '../../../../../components/LoadingContext';

const BANKS = [
  { name: "กสิกรไทย", logo: "/assets/banks/KBANK.jpg" },
  { name: "ไทยพาณิชย์", logo: "/assets/banks/SCB.jpg" },
  { name: "กรุงเทพ", logo: "/assets/banks/BBL.jpg" },
  { name: "กรุงไทย", logo: "/assets/banks/KTB.jpg" },
  { name: "ออมสิน", logo: "/assets/banks/GSB.jpg" },
  { name: "ทีเอ็มบีธนชาต", logo: "/assets/banks/ttb.jpg" },
];

const PaymentAccountTab = () => {
  const { withLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accountInfo, setAccountInfo] = useState<IPaymentSetting>({
    accountName: "",
    bankName: "",
    accountNumber: "",
    qrCodeUrl: null,
  });

  const [tempInfo, setTempInfo] = useState<IPaymentSetting>({ ...accountInfo });

  const handleStartEdit = () => {
    setTempInfo({ ...accountInfo });
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempInfo({ ...tempInfo, qrCodeUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("accountName", tempInfo.accountName || "");
      formData.append("bankName", tempInfo.bankName || "");
      formData.append("accountNumber", tempInfo.accountNumber || "");

      if (selectedFile) {
        formData.append("qrImage", selectedFile);
      }
      const updated = await SettingService.updatePaymentSettings(formData);
      
      setAccountInfo(updated);
      setIsEditing(false);
      setSelectedFile(null);
    }catch (error) {
      console.error(error);
    }
  };
  
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("data:")) return path;
    if (path.startsWith("http")) return path; 
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    return `${baseUrl}${path}`;
  };
  
  const textFieldStyle = {
    "& .MuiInputBase-root.Mui-disabled": {
      backgroundColor: "#f1f5f9",
      color: "#1e293b",
      fontWeight: "bold",
      "& fieldset": { border: "none" },
    },
    "& .MuiInputBase-root": {
      backgroundColor: isEditing ? "#fff" : "transparent",
      transition: "all 0.2s",
      borderRadius: 2,
    },
  };

  const currentQrCode = isEditing ? tempInfo.qrCodeUrl : accountInfo.qrCodeUrl;
  const overlayBgColor = currentQrCode ? "rgba(0,0,0,0.4)" : "transparent";
  const displayQrCode = isEditing ? tempInfo.qrCodeUrl : accountInfo.qrCodeUrl;
  const qrImageUrl = getImageUrl(displayQrCode);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await withLoading(SettingService.getPaymentSettings());
        setAccountInfo(data);
        setTempInfo(data);
      }catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [withLoading]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          ข้อมูลบัญชีธนาคาร
        </Typography>

        {isEditing ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Check size={18} />}
              onClick={handleSave}
              sx={{ borderRadius: 2 }}
            >
              บันทึก
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<X size={18} />}
              onClick={() => setIsEditing(false)}
              sx={{ borderRadius: 2 }}
            >
              ยกเลิก
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<Edit3 size={18} />}
            onClick={handleStartEdit}
            sx={{
              bgcolor: "#1e293b",
              borderRadius: 2,
              "&:hover": { bgcolor: "#334155" },
            }}
          >
            แก้ไขข้อมูลบัญชี
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="ชื่อบัญชี"
            fullWidth
            disabled={!isEditing}
            value={
              isEditing
                ? (tempInfo.accountName ?? "")
                : (accountInfo.accountName ?? "")
            }
            onChange={(e) =>
              setTempInfo({ ...tempInfo, accountName: e.target.value })
            }
            sx={textFieldStyle}
          />

          <TextField
            select
            label="ธนาคาร"
            fullWidth
            disabled={!isEditing}
            value={
              isEditing
                ? (tempInfo.bankName ?? "")
                : (accountInfo.bankName ?? "")
            }
            onChange={(e) =>
              setTempInfo({ ...tempInfo, bankName: e.target.value })
            }
            sx={textFieldStyle}
            slotProps={{
              select: {
                renderValue: (selected) => {
                  const bank = BANKS.find((b) => b.name === selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {bank && (
                        <img
                          src={bank.logo}
                          alt=""
                          style={{ width: 24, height: 24, objectFit: "contain" }}
                        />
                      )}
                      {selected as string}
                    </Box>
                  );
                },
              }
            }}
          >
            {BANKS.map((bank) => (
              <MenuItem key={bank.name} value={bank.name}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    style={{ width: 24, height: 24, objectFit: "contain" }}
                  />
                </ListItemIcon>
                <ListItemText primary={bank.name} />
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="เลขที่บัญชี"
            fullWidth
            disabled={!isEditing}
            value={
              isEditing
                ? (tempInfo.accountNumber ?? "")
                : (accountInfo.accountNumber ?? "")
            }
            onChange={(e) =>
              setTempInfo({ ...tempInfo, accountNumber: e.target.value })
            }
            sx={textFieldStyle}
          />
        </Box>

        <Box sx={{ width: { xs: "100%", md: 300 } }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontWeight: "bold", color: "#475569" }}
          >
            รูปภาพ QR Code
          </Typography>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              position: "relative",
              bgcolor: "#f8fafc",
              overflow: "hidden",
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderStyle:
                isEditing && !tempInfo.qrCodeUrl ? "dashed" : "solid",
            }}
          >
            {displayQrCode ? (
              <CardMedia
                component="img"
                height="250"
                image={qrImageUrl || ""}
                alt="QR Code"
                sx={{ objectFit: "contain", p: 2 }}
              />
            ) : (
              <Box sx={{ textAlign: "center", color: "#94a3b8" }}>
                <Upload size={48} strokeWidth={1} />
                <Typography variant="caption" display="block">
                  ยังไม่มีรูป QR Code
                </Typography>
              </Box>
            )}

            {isEditing && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: overlayBgColor,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Upload size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderRadius: 5, boxShadow: 3 }}
                >
                  {tempInfo.qrCodeUrl ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
                </Button>

                {tempInfo.qrCodeUrl && (
                  <IconButton
                    size="small"
                    sx={{
                      color: "#ff4d4f",
                      bgcolor: "#fff",
                      "&:hover": { bgcolor: "#fff0f0" },
                      boxShadow: 2,
                    }}
                    onClick={() => {
                      setTempInfo({ ...tempInfo, qrCodeUrl: null });
                      setSelectedFile(null);
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentAccountTab;
