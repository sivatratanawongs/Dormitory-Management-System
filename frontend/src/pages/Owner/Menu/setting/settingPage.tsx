import { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import { Zap, CreditCard, Home } from 'lucide-react';

// Component
import UtilityTab from './tabs/utilityTab';
import RoomPriceTab from './tabs/roomPriceTab';
import PaymentAccountTab from './tabs/paymentAccountTab';

const SettingPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 2, p: 2 }}>
      <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            sx={{
              '& .MuiTab-root': { py: 2, fontWeight: 'bold' },
              '& .Mui-selected': { color: '#1976d2' }
            }}
          >
            <Tab icon={<Zap size={18} />} label="ค่าน้ำ/ไฟ" iconPosition="start" />
            <Tab icon={<Home size={18} />} label="ราคาห้องพัก" iconPosition="start" />
            <Tab icon={<CreditCard size={18} />} label="บัญชีรับเงิน" iconPosition="start" />
          </Tabs>
        </Box>

        <CustomTabPanel value={tabValue} index={0}>
          <UtilityTab />
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={1}>
          <RoomPriceTab />
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={2}>
          <PaymentAccountTab />
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};

interface TabPanelProps { 
  readonly children?: React.ReactNode; 
  readonly value: number; 
  readonly index: number; 
}

function CustomTabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default SettingPage;