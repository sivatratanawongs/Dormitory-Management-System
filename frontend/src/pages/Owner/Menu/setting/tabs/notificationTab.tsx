import { useState } from 'react';
import { 
  Box, Typography, TextField, Button,
  Switch, FormControlLabel, Divider, Card, CardContent, InputAdornment 
} from '@mui/material';
import { Edit3, X, Check, BellRing, Link as LinkIcon, MessageSquare, ShieldCheck } from 'lucide-react';

const NotificationTab = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [notifySettings, setNotifySettings] = useState({
    lineToken: 'ln_abc1234567890xyz',
    notifyOnMaintenance: true,
    notifyOnMoveOut: true,
    notifyOnPayment: true
  });

  const [tempSettings, setTempSettings] = useState({ ...notifySettings });

  const handleStartEdit = () => {
    setTempSettings({ ...notifySettings });
    setIsEditing(true);
  };

  const handleSave = () => {
    setNotifySettings({ ...tempSettings });
    setIsEditing(false);
  
  };

  const textFieldStyle = {
    "& .MuiInputBase-root.Mui-disabled": {
      backgroundColor: "#f1f5f9",
      color: "#64748b",
      "& fieldset": { border: 'none' }
    },
    "& .MuiInputBase-root": {
      backgroundColor: isEditing ? "#fff" : "transparent",
      transition: 'all 0.2s'
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>การแจ้งเตือนผ่าน Line Notify</Typography>
          <Typography variant="body2" color="text.secondary">เชื่อมต่อระบบแจ้งเตือนเข้ากับกลุ่ม Line ของผู้ดูแล</Typography>
        </Box>
        
        {!isEditing ? (
          <Button 
            variant="contained" 
            startIcon={<Edit3 size={18} />} 
            onClick={handleStartEdit}
            sx={{ bgcolor: '#1e293b', borderRadius: 2 }}
          >
            แก้ไขการเชื่อมต่อ
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="success" startIcon={<Check size={18} />} onClick={handleSave} sx={{ borderRadius: 2 }}>
              บันทึก
            </Button>
            <Button variant="outlined" color="error" startIcon={<X size={18} />} onClick={() => setIsEditing(false)} sx={{ borderRadius: 2 }}>
              ยกเลิก
            </Button>
          </Box>
        )}
      </Box>

      {/* ส่วนการตั้งค่า Token */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ maxWidth: 600 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Line Notify Token</Typography>
          <TextField
            fullWidth
            type="password"  
            disabled={!isEditing}
            value={isEditing ? tempSettings.lineToken : notifySettings.lineToken}
            onChange={(e) => setTempSettings({ ...tempSettings, lineToken: e.target.value })}
            placeholder="ใส่รหัส Token จาก Line Notify"
            InputProps={{
              startAdornment: <InputAdornment position="start"><LinkIcon size={18} /></InputAdornment>,
            }}
            sx={textFieldStyle}
          />
          <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1, cursor: 'pointer', textDecoration: 'underline' }}>
            วิธีขอรับ Line Token สำหรับเจ้าของหอพัก
          </Typography>
        </Box>

        <Divider />

        {/* ส่วนการตั้งค่าเปิด-ปิดรายหัวข้อ */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>หัวข้อที่ต้องการให้แจ้งเตือน</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isEditing ? tempSettings.notifyOnMaintenance : notifySettings.notifyOnMaintenance} 
                  disabled={!isEditing}
                  onChange={(e) => setTempSettings({ ...tempSettings, notifyOnMaintenance: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageSquare size={16} /> <Typography variant="body2">เมื่อมีการแจ้งซ่อมจากผู้เช่า</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch 
                  checked={isEditing ? tempSettings.notifyOnMoveOut : notifySettings.notifyOnMoveOut} 
                  disabled={!isEditing}
                  onChange={(e) => setTempSettings({ ...tempSettings, notifyOnMoveOut: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BellRing size={16} /> <Typography variant="body2">เมื่อมีการแจ้งย้ายออกล่วงหน้า</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch 
                  checked={isEditing ? tempSettings.notifyOnPayment : notifySettings.notifyOnPayment} 
                  disabled={!isEditing}
                  onChange={(e) => setTempSettings({ ...tempSettings, notifyOnPayment: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldCheck size={16} /> <Typography variant="body2">เมื่อมีรายการแจ้งชำระเงินใหม่</Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Box>

      {/* หมายเหตุ */}
      <Box sx={{ mt: 4 }}>
        <Card variant="outlined" sx={{ bgcolor: '#f0fdf4', borderColor: '#bbf7d0', borderRadius: 3 }}>
          <CardContent sx={{ display: 'flex', gap: 2 }}>
            <BellRing color="#16a34a" size={24} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#166534' }}>ทำไมต้องใช้ Line Notify?</Typography>
              <Typography variant="body2" color="#14532d">
                เพื่อไม่ให้คุณพลาดเหตุการณ์สำคัญ ระบบจะส่งข้อความเข้ากลุ่ม Line ทันทีที่มีกิจกรรมจากผู้เช่า 
                คุณไม่จำเป็นต้องเปิดหน้าเว็บเช็คตลอดเวลา
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NotificationTab;