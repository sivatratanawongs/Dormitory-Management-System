import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,CircularProgress, IconButton, TablePagination } from '@mui/material';
import { Edit3, X, Check, Plus, History } from 'lucide-react';

// Local Imports
import { SettingService } from '../../../../../services/settingService'; 
import type{ IRoom, IRoomType } from '../../../../../type/room'
import { BillingFrontendService } from '../../../../../services/billingService';
import type { ITenantBillingHistory } from '../../../../../type/billing';
import { useLoading } from '../../../../../components/LoadingContext';

const RoomRow = ({ room, roomTypes, isEditing, onChange, onViewHistory }: { room: IRoom, roomTypes: IRoomType[], isEditing: boolean, onChange: <K extends keyof IRoom>(id: string, field: K, value: IRoom[K]) => void, onViewHistory: (id: string, num: string) => void}) => {
  
  const renderStatusBanner = (status: string) => {
    const isOccupied = status === 'มีผู้เช่า';
    return (
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        px: 1.5, py: 0.5, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
        bgcolor: isOccupied ? '#e8f5e9' : '#f1f5f9', 
        color: isOccupied ? '#2e7d32' : '#64748b',
        border: `1px solid ${isOccupied ? '#c8e6c9' : '#e2e8f0'}`, minWidth: '85px'
      }}>
        {status}
      </Box>
    );
  };

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>{room.roomNumber}</TableCell>
      <TableCell align="center">
        <TextField 
          size="small" type="number" disabled={!isEditing} value={room.floor}
          onChange={(e) => onChange(room.id, 'floor', Number.parseInt(e.target.value) || 0)}
          slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
          sx={{ 
            width: 70, 
            "& .MuiInputBase-root": { backgroundColor: isEditing ? "#fff" : "transparent" },
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
        />
      </TableCell>
      <TableCell>
        <TextField select fullWidth size="small" disabled={!isEditing} value={room.roomTypeId || ''} 
          onChange={(e) => onChange(room.id, 'roomTypeId', e.target.value)}
          sx={{ 
            minWidth: 130, 
            "& .MuiSelect-select": { py: 0.75 },
            "& .MuiInputBase-root": { backgroundColor: isEditing ? "#fff" : "transparent" }
          }}
        >
          {roomTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell align="center">
        <TextField 
          size="small" type="number" disabled={!isEditing} value={room.basePrice}
          onChange={(e) => onChange(room.id, 'basePrice', Number.parseInt(e.target.value) || 0)}
          slotProps={{
            htmlInput: {
              style: { textAlign: 'right' }
            }
          }}
          sx={{ 
            width: 120, 
            "& .MuiInputBase-root": { backgroundColor: isEditing ? "#fff" : "transparent" },
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
        />
      </TableCell>

      <TableCell>
        <TextField 
          size="small" disabled={!isEditing} value={room.description || ''}
          onChange={(e) => onChange(room.id, 'description', e.target.value)}
          fullWidth
          sx={{ "& .MuiInputBase-root.Mui-disabled": { backgroundColor: "#f1f5f9", "& fieldset": { border: 'none' } } }}
        />
      </TableCell>

      <TableCell align="center">{renderStatusBanner(room.status)}</TableCell>
      <TableCell align="center">
        <IconButton 
          size="small" 
          onClick={() => onViewHistory(room.id, room.roomNumber)}
          sx={{ color: '#64748b', '&:hover': { color: '#1e293b', bgcolor: '#f1f5f9' } }}
        >
          <History size={18} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const RoomPriceTab = () => {
  const { withLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [roomData, setRoomData] = useState<IRoom[]>([]);
  const [tempData, setTempData] = useState<IRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 12; 
  const [roomHistory, setRoomHistory] = useState<ITenantBillingHistory[]>([]);

  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    roomTypeId: '',
    basePrice: 0,
    description: '',
    floor: 1,
  });

  const loadInitialData = async () => {
    try {
      const [rooms, types] = await withLoading(Promise.all([
        SettingService.getRooms(),
        SettingService.getRoomTypes()
      ]));
      const sortedRooms = [...rooms].sort((a, b) => {
        return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' });
      });

      setRoomData(sortedRooms);
      setTempData(sortedRooms);
      setRoomTypes(types);
      if (types.length > 0) setNewRoom(prev => ({ ...prev, roomTypeId: types[0].id }));
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  useEffect(() => { loadInitialData(); }, [withLoading]);

  const handleRoomChange = <K extends keyof IRoom>( id: string, field: K, value: IRoom[K] ) => {
    setTempData(prev => 
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveAll = async () => {
    try {
      const updatedRooms = tempData.map(r => ({
        id: r.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        roomTypeId: r.roomTypeId,
        basePrice: r.basePrice,
        description: r.description
      }));

      await withLoading(SettingService.updateBulkRooms(updatedRooms));
      setRoomData([...tempData]);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddNewRoom = async () => {
    try {
      setOpenAddDialog(false);
      await withLoading(SettingService.addRoom(newRoom));
      await loadInitialData();
      
      setNewRoom({ roomNumber: '', floor: 1, roomTypeId: roomTypes[0]?.id || '', basePrice: 0, description: '' });
    } catch (error) {
      console.error(error);
    }
  }

  const handleViewHistory = async (roomId: string, roomNumber: string) => {
    try {
      setPage(0);
      setSelectedRoomNumber(roomNumber);
      const data = await withLoading(BillingFrontendService.getHistoryByRoom(roomId)); 
      
      setRoomHistory(data);
      setHistoryDialogOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const isFormValid = newRoom.roomNumber.trim() !== '' && newRoom.floor > 0 && newRoom.basePrice > 0;

  const formatThaiMonth = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('th-TH', {
      month: 'long',
      year: 'numeric',
    });
};
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>จัดการราคาและรายละเอียดห้องพัก</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditing ? (
            <>
              <Button variant="contained" color="success" startIcon={<Check size={18} />} onClick={handleSaveAll}>บันทึกการแก้ไข</Button>
              <Button variant="outlined" color="error" startIcon={<X size={18} />} onClick={() => setIsEditing(false)}>ยกเลิก</Button>
            </>
          ) : (
            <>
              <Button variant="outlined" startIcon={<Plus size={18} />} onClick={() => setOpenAddDialog(true)}>เพิ่มห้องพัก</Button>
              <Button variant="contained" startIcon={<Edit3 size={18} />} onClick={() => { setTempData([...roomData]); setIsEditing(true); }} sx={{ bgcolor: '#1e293b' }}>แก้ไข</Button>
            </>
          )}
      </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell align="center">เลขห้อง</TableCell>
              <TableCell align="center">ชั้น</TableCell>
              <TableCell align="center">ประเภท</TableCell>
              <TableCell align="center">ราคาเช่า (บาท)</TableCell>
              <TableCell>รายละเอียด/เฟอร์นิเจอร์</TableCell>
              <TableCell align="center">สถานะ</TableCell>
              <TableCell align="center">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(isEditing ? tempData : roomData).map((room) => (
              <RoomRow key={room.id} room={room} roomTypes={roomTypes} isEditing={isEditing} onChange={handleRoomChange} onViewHistory={handleViewHistory}/>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/*  AddRoom Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>เพิ่มห้องพักใหม่</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt:3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="เลขห้อง" fullWidth size="small" value={newRoom.roomNumber} onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })} />
                <TextField label="ชั้น" type="number" sx={{ width: '150px' }} size="small" value={newRoom.floor} onChange={(e) => setNewRoom({ ...newRoom, floor: Number.parseInt(e.target.value) || 0 })} />
            </Box>
            <TextField select label="ประเภท" fullWidth size="medium" value={newRoom.roomTypeId} onChange={(e) => setNewRoom({ ...newRoom, roomTypeId: e.target.value })}>
              {roomTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="ราคาเช่า" fullWidth size="small" type="number" value={newRoom.basePrice || ''} onChange={(e) => setNewRoom({ ...newRoom, basePrice: Number.parseInt(e.target.value) || 0 })} />
            <TextField label="รายละเอียด" fullWidth size="small" multiline rows={3} value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAddDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleAddNewRoom} variant="contained" disabled={!isFormValid} sx={{ bgcolor: '#1e293b' }}>เพิ่มห้องพัก</Button>
        </DialogActions>
      </Dialog>
      
      {/*  History Dialog */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={() => setHistoryDialogOpen(false)} 
        fullWidth
        maxWidth={false} 
        slotProps={{ 
          paper: { 
            sx: { 
              borderRadius: 4, 
              width: '70%', 
              height: '70%', 
              display: 'flex',
              flexDirection: 'column' 
            } 
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ประวัติบิล ห้อง {selectedRoomNumber}
          <IconButton onClick={() => setHistoryDialogOpen(false)}><X size={20} /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ flex: 1, overflowY: 'auto', px: 5 }}> 
          <TableContainer>
            <Table size="small" stickyHeader> 
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>รอบเดือน</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>น้ำ (หน่วย)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>ค่าน้ำ/หน่วย</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>ไฟ (หน่วย)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>ค่าไฟ/หน่วย</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>ยอดรวม</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      ไม่พบประวัติการออกบิล
                    </TableCell>
                  </TableRow>
                ) : (
                  roomHistory
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {formatThaiMonth(row.month)} 
                        </TableCell>
                        <TableCell align="center">{Math.max(0, row.waterUnitCurr - row.waterUnitPrev)}</TableCell>
                        <TableCell align="center">{row.waterRate}</TableCell>
                        <TableCell align="center">{Math.max(0, row.elecUnitCurr - row.elecUnitPrev)}</TableCell>
                        <TableCell align="center">{row.elecRate}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {row.totalAmount.toLocaleString()} ฿
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        {!historyLoading && roomHistory.length > 0 && (
          <Box sx={{ borderTop: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <TablePagination
              component="div"
              count={roomHistory.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[]} 
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} จากทั้งหมด ${count}`}
            />
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default RoomPriceTab;