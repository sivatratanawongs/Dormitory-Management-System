import { Box, Typography, Paper, Chip, Button, IconButton, Alert, Stack } from '@mui/material';
import { Phone, LogOut, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Component
import MoveOutDialog from '../../../../components/MoveOutDialog';
import { useLoading } from '../../../../components/LoadingContext';

// Service 
import { SettingService } from '../../../../services/settingService'; 
import { TenantFrontendService } from '../../../../services/tenantService';

//Type
import type { IRoom } from '../../../../type/room'
import type { ITenant } from '../../../../type/tenant';

const TenantsPage = () => {
  const { withLoading } = useLoading();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [isMoveOutOpen, setIsMoveOutOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadAllData = async () => {
    try {
      setError(null);
      const [roomsData, tenantsResponse] = await withLoading(Promise.all([
        SettingService.getRooms(),
        TenantFrontendService.getAllActiveTenants()
      ]));
      
      const activeTenants = tenantsResponse.success ? tenantsResponse.data : [];
      const tenantMap = new Map((activeTenants || []).map(t => [t.roomId, t]));

      const mergedRooms = roomsData.map(room => {
        const tenantInfo = tenantMap.get(room.id);
        return {
          ...room,
          tenants: tenantInfo ? [tenantInfo as unknown as ITenant] : []
        } as IRoom;
      });

      const sortedRooms: IRoom[] = mergedRooms.toSorted((a, b) => 
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
      );
      setRooms(sortedRooms);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      console.error(err);
    }
  };

  const handleMoveOutConfirm = async () => {
    if (!selectedRoom?.tenants?.length) return;
    try {
      const tenantId = selectedRoom.tenants[0].id;
      
      await TenantFrontendService.moveOut(tenantId, { 
        roomId: selectedRoom.id 
      });
      
      await loadAllData(); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsMoveOutOpen(false);
    }
  };

  useEffect(() => { loadAllData() }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e293b' }}>จัดการผู้เช่า</Typography>
        <Chip label={`ทั้งหมด ${rooms.length} ห้อง`} variant="outlined" sx={{ fontWeight: 'bold', bgcolor: '#fff' }} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
        gap: 3 
      }}>
        {rooms.map((room) => {
          const isOccupied = room.status === 'มีผู้เช่า';
          const currentTenant = room.tenants && room.tenants.length > 0 ? room.tenants[0] : null;

          return (
            <Paper key={room.id} elevation={0} sx={{ 
              p: 2.5, borderRadius: 4, border: '1px solid #e2e8f0', position: 'relative',
              overflow: 'hidden', transition: 'all 0.3s', bgcolor: '#fff',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)', borderColor: '#94a3b8' }
            }}>
              <Box sx={{ 
                height: 6, width: '100%', position: 'absolute', top: 0, left: 0, 
                bgcolor: isOccupied ? '#10b981' : '#cbd5e1' 
              }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>ห้อง {room.roomNumber}</Typography>
                <Chip 
                  label={isOccupied ? 'มีผู้เช่า' : 'ว่าง'} 
                  size="small"
                  sx={{ 
                    fontWeight: 'bold', 
                    bgcolor: isOccupied ? '#ecfdf5' : '#f1f5f9',
                    color: isOccupied ? '#059669' : '#64748b'
                  }}
                />
              </Box>

              {isOccupied ? (
                <Box>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                      {currentTenant?.name || 'ไม่ระบุชื่อ'} 
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Phone size={14} /> 
                      {currentTenant?.phone || 'ไม่มีเบอร์โทร'}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth size="small" variant="outlined" 
                      onClick={() => navigate(`/owner/tenants-detail/${currentTenant?.id}`, { 
                        state: { tenant: currentTenant,roomNumber: room.roomNumber } 
                      })}
                      sx={{ borderRadius: 2, color: '#1e293b', borderColor: '#e2e8f0' }}
                    >
                      รายละเอียด
                    </Button>
                    <Button 
                      fullWidth 
                      size="small" 
                      variant="outlined" 
                      color="error" 
                      startIcon={<LogOut size={14} />}
                      onClick={() => {
                        setSelectedRoom(room); 
                        setIsMoveOutOpen(true);
                      }}
                      sx={{ borderRadius: 2, borderColor: '#fee2e2' }}
                    >
                      ย้ายออก
                    </Button>
                    <IconButton 
                      size="small" 
                      disabled={!currentTenant?.phone}
                      sx={{ bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 2, px: 1.5 }}
                      onClick={() => currentTenant?.phone && window.open(`tel:${currentTenant.phone}`)}
                    >
                      <Phone size={16} color={currentTenant?.phone ? "#0f172a" : "#cbd5e1"} />
                    </IconButton>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ py: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<ClipboardList size={16} />}
                    onClick={() => { 
                      navigate('/owner/contracts', { 
                        state: { 
                          roomNumber: room.roomNumber, 
                          roomId: room.id, 
                          price: room.basePrice,
                          floor: room.floor,
                        } 
                      }); 
                    }}
                    sx={{ bgcolor: '#fff', color: '#1e293b', '&:hover': { bgcolor: '#e2e8f0' }, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
                      border: '1px solid #e2e8f0', fontWeight: 'bold' }}
                  >
                    ทำสัญญาใหม่
                  </Button>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
      <MoveOutDialog 
        key={selectedRoom?.id || 'none'} 
        open={isMoveOutOpen}
        onClose={() => setIsMoveOutOpen(false)}
        room={selectedRoom}
        onConfirm={handleMoveOutConfirm}
      />
    </Box>
  );
};

export default TenantsPage;