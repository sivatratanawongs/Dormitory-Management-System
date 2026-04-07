import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { Edit3, X, Check, Zap, Droplets, Settings2, Home } from 'lucide-react';
import { SettingService, type ISystemSetting } from '../../../../../services/settingService';
import { type ITempUtilityData } from '../models/moedel'

import { useLoading } from '../../../../../components/LoadingContext';

interface RateHistory {
  id: string;
  type: 'ไฟ' | 'น้ำ' | 'ส่วนกลาง' | 'น้ำขั้นต่ำ';
  oldRate: number;
  newRate: number;
  changedDate: Date;
}

const UtilityTab = () => {
  const { withLoading } = useLoading();

  const [isEditing, setIsEditing] = useState(false);
  const [utilityData, setUtilityData] = useState({
    electricityRate: 0,
    waterRate: 0,
    commonFee: 0,
    minWaterUnit: 0,
  });
  const [tempData, setTempData] = useState<ITempUtilityData>({ ...utilityData });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await withLoading(SettingService.getSettings());
        const mappedData = {
          electricityRate: data.elecRate,
          waterRate: data.waterRate,
          commonFee: data.commonFee,
          minWaterUnit: data.waterMinUnit,
        };
        setUtilityData(mappedData);
        setTempData(mappedData);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [withLoading]);
  
  const handleFieldChange = (field: keyof ITempUtilityData, value: string) => {
      setTempData((prev) => ({
        ...prev,
        [field]: value === "" ? "" : Number.parseFloat(value),
      }));
  };

  const handleStartEdit = () => {
    setTempData({ ...utilityData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const dataToSave: ISystemSetting = {
        elecRate: Number(tempData.electricityRate),
        waterRate: Number(tempData.waterRate),
        commonFee: Number(tempData.commonFee),
        waterMinUnit: Number(tempData.minWaterUnit),
      };
      setIsEditing(false);
      await withLoading(SettingService.updateSettings(dataToSave));
      
      const newLogs: RateHistory[] = [];
      if (newLogs.length > 0) {
        console.log(newLogs);
      }
      const fields: Array<{ key: keyof typeof utilityData, label: RateHistory['type'] }> = [
        { key: 'electricityRate', label: 'ไฟ' },
        { key: 'waterRate', label: 'น้ำ' },
        { key: 'commonFee', label: 'ส่วนกลาง' },
        { key: 'minWaterUnit', label: 'น้ำขั้นต่ำ' }
      ];

      fields.forEach(field => {
        const newVal = Number(tempData[field.key]);
        if (newVal !== utilityData[field.key]) {
          newLogs.push({
            id: Date.now().toString() + field.key,
            type: field.label,
            oldRate: utilityData[field.key],
            newRate: newVal,
            changedDate: new Date(),
          });
        }
      });
      setUtilityData({
        electricityRate: Number(tempData.electricityRate),
        waterRate: Number(tempData.waterRate),
        commonFee: Number(tempData.commonFee),
        minWaterUnit: Number(tempData.minWaterUnit),
      });
      
    } catch (error) {
      console.error(error);
    }
  };

  const numberFieldStyle = {
    "& .MuiInputBase-root.Mui-disabled": {
      backgroundColor: "#f1f5f9",
      color: "#1e293b",
      fontWeight: 'bold',
      "& fieldset": { border: 'none' }
    },
    "& .MuiInputBase-root": {
      backgroundColor: isEditing ? "#fff" : "transparent",
      transition: 'all 0.2s',
      borderRadius: 2
    },
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      display: "none",
      margin: 0,
    },
    "& input[type=number]": {
      MozAppearance: "textfield",
      textAlign: 'right',
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>ตั้งค่าอัตราค่าน้ำ - ค่าไฟ</Typography>
          <Typography variant="body2" color="text.secondary">กำหนดราคาต่อหน่วยสำหรับการคำนวณบิลรายเดือน</Typography>
        </Box>
        
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="success" startIcon={<Check size={18} />} onClick={handleSave} sx={{ borderRadius: 2 }}>บันทึก</Button>
            <Button variant="outlined" color="error" startIcon={<X size={18} />} onClick={() => setIsEditing(false)} sx={{ borderRadius: 2 }}>ยกเลิก</Button>
          </Box>
        ) : (
          <Button variant="contained" startIcon={<Edit3 size={18} />} onClick={handleStartEdit} sx={{ bgcolor: '#1e293b', borderRadius: 2, '&:hover': { bgcolor: '#334155' } }}>แก้ไขอัตราค่าบริการ</Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>

        {/* อัตราค่าไฟ */}
        <Box sx={{ flex: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Zap size={16} color="#f59e0b" /> อัตราค่าไฟฟ้า
          </Typography>
          <TextField
            fullWidth type="number" disabled={!isEditing}
            value={isEditing ? tempData.electricityRate : utilityData.electricityRate}
            onChange={(e) => handleFieldChange('electricityRate', e.target.value)}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">บาท / หน่วย</InputAdornment>,
              },
            }}
            sx={numberFieldStyle}
          />
        </Box>

        {/* อัตราค่าน้ำ */}
        <Box sx={{ flex: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Droplets size={16} color="#3b82f6" /> อัตราค่าน้ำประปา
          </Typography>
          <TextField
            fullWidth type="number" disabled={!isEditing}
            value={isEditing ? tempData.waterRate : utilityData.waterRate}
            onChange={(e) => handleFieldChange('waterRate', e.target.value)}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">บาท / หน่วย</InputAdornment>,
              },
            }}
            sx={numberFieldStyle}
          />
        </Box>

        {/* ค่าบริการส่วนกลาง */}
        <Box sx={{ flex: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Home size={16} color="#6366f1" /> ค่าบริการส่วนกลาง (รายเดือน)
          </Typography>
          <TextField
            fullWidth type="number" disabled={!isEditing}
            value={isEditing ? tempData.commonFee : utilityData.commonFee}
            onChange={(e) => handleFieldChange('commonFee', e.target.value)}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
              },
            }}
            sx={numberFieldStyle}
          />
        </Box>

        {/* ค่าน้ำขั้นต่ำ */}
        <Box sx={{ flex: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings2 size={16} color="#14b8a6" /> ค่าน้ำขั้นต่ำ (ต่อเดือน)
          </Typography>
          <TextField
            fullWidth type="number" disabled={!isEditing}
            value={isEditing ? tempData.minWaterUnit : utilityData.minWaterUnit}
            onChange={(e) => handleFieldChange('minWaterUnit', e.target.value)}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">หน่วย</InputAdornment>,
              },
            }}
            sx={numberFieldStyle}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UtilityTab;