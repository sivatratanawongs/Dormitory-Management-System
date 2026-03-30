import { UserMinus, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack } from '@mui/material';
import type { IRoom } from '../type/room';

interface MoveOutDialogProps {
  open: boolean;
  onClose: () => void;
  room: IRoom | null;
  onConfirm: () => Promise<void>; // ปรับให้ไม่ต้องรับ parameter
}

const MoveOutDialog = ({ open, onClose, room, onConfirm }: MoveOutDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  const currentTenant = room.tenants?.[0];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: '28px', width: '100%', maxWidth: 400, p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pt: 3 }}>
        <Box sx={{ 
          bgcolor: '#fee2e2', 
          p: 2, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 1
        }}>
          <UserMinus size={32} color="#ef4444" />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
          ยืนยันการย้ายออก
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2} sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>
            คุณต้องการยืนยันการย้ายออกของ <br/>
            <strong style={{ color: '#1e293b' }}>{currentTenant?.name || 'ไม่ระบุชื่อ'}</strong> ใช่หรือไม่?
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#fff7ed', 
            borderRadius: 3, 
            border: '1px solid #ffedd5',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textAlign: 'left'
          }}>
            <AlertTriangle size={20} color="#f97316" />
            <Typography variant="body2" color="#9a3412" sx={{ fontWeight: 500 }}>
              การดำเนินการนี้จะเปลี่ยนสถานะห้อง <strong>{room.roomNumber}</strong> เป็นห้องว่างทันที
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          fullWidth
          onClick={onClose} 
          sx={{ 
            color: '#64748b', 
            fontWeight: 700, 
            py: 1.5,
            borderRadius: 3,
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          ยกเลิก
        </Button>
        <Button 
          fullWidth
          variant="contained" 
          onClick={handleConfirm}
          disabled={loading}
          sx={{ 
            borderRadius: 3, 
            py: 1.5,
            fontWeight: 700, 
            bgcolor: '#ef4444', 
            boxShadow: '0 4px 6px -1px rgb(239 68 68 / 0.2)',
            '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' } 
          }}
        >
          {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveOutDialog;