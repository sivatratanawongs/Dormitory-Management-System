import html2canvas from 'html2canvas';
import { useEffect, useRef, useState } from "react";
import { ReceiptText, Send, X } from "lucide-react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { th } from "date-fns/locale";
import { format } from "date-fns";

//Service
import { BillingFrontendService } from "../../../../services/billingService";
import { SettingService, type IPaymentSetting, type ISystemSetting } from "../../../../services/settingService";
//Type 
import type { BillingRoomState, BillingStatus } from "../../../../type/billing";
import { TenantFrontendService } from "../../../../services/tenantService";

const BillingPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [openDialog, setOpenDialog] = useState(false);
  const [rooms, setRooms] = useState<BillingRoomState[]>([]);
  const [recordDate, setRecordDate] = useState<Date | null>(new Date()); 
  const billRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [billingMonth, setBillingMonth] = useState<Date | null>(new Date());
  const [systemSetting, setSystemSetting] = useState<ISystemSetting | null>(null);
  const [paymentSetting, setPaymentSetting] = useState<IPaymentSetting | null>(null);
  const getElecUnit = (room: BillingRoomState) => Math.max(0, (Number(room.currentElec) || 0) - room.prevElec);
  const getWaterUnit = (room: BillingRoomState) => Math.max(0, (Number(room.currentWater) || 0) - room.prevWater);

  const getThaiMonthYear = (date: Date | null) => {
    if (!date) return "";
    return format(date, 'MMMM yyyy', { locale: th });
  };

  const getElecCost = (room: BillingRoomState) => {
    if (!systemSetting) return 0;
    return getElecUnit(room) * systemSetting.elecRate;
  };

  const getWaterCost = (room: BillingRoomState) => {
    if (!systemSetting) return 0;
    const used = getWaterUnit(room);
    if (used <= systemSetting.waterMinUnit) {
      return systemSetting.waterMinUnit * systemSetting.waterRate; 
    }
    return used * systemSetting.waterRate;
  };

  const calculateTotal = (room: BillingRoomState) => {
    const commonFee = systemSetting?.commonFee || 0;
    return room.roomPrice + getElecCost(room) + getWaterCost(room) + commonFee;
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleConfirmAndSave = async () => {
      if (!systemSetting) return;
      
      try {
          // 1. กรองเฉพาะห้องที่มีผู้เช่า (เพราะห้องว่างเราอาจจะไม่ต้องบันทึกรูปบิล)
          const activeRooms = rooms.filter(room => room.tenantId !== null);
          const emptyRooms = rooms.filter(room => room.tenantId === null);

          const activeBillings = await Promise.all(activeRooms.map(async (room) => {
              const currentElecVal = room.currentElec === "" ? room.prevElec : Number(room.currentElec);
              const currentWaterVal = room.currentWater === "" ? room.prevWater : Number(room.currentWater);

              let base64Image = null;

              if (billRefs.current[room.id]) {
                  const element = billRefs.current[room.id];
                  if (element) {
                      const canvas = await html2canvas(element, {
                          scale: 1.5, // ลดลงเหลือ 1.5 เพื่อให้ส่ง 14 ห้องได้เร็วขึ้น
                          useCORS: true,
                          backgroundColor: "#ffffff",
                          logging: false // ปิด log เพื่อความสะอาดของ console
                      });
                      base64Image = canvas.toDataURL("image/jpeg", 0.7);
                  }
              }

              return {
                  roomId: room.id,
                  tenantId: room.tenantId,
                  month: format(billingMonth || new Date(), "yyyy-MM"),
                  elecUnitPrev: room.prevElec,
                  elecUnitCurr: currentElecVal,
                  waterUnitPrev: room.prevWater,
                  waterUnitCurr: currentWaterVal,
                  roomPrice: room.roomPrice,
                  elecRate: systemSetting.elecRate,
                  waterRate: systemSetting.waterRate,
                  totalAmount: calculateTotal(room),
                  status: "pending" as BillingStatus,
                  billImageData: base64Image // 📸 ส่งรูปไปด้วย
              };
          }));

          // 2. ข้อมูลสำหรับห้องว่าง (ถ้าต้องการบันทึกด้วย แต่ไม่ต้องมีรูป)
          const emptyBillings = emptyRooms.map(room => ({
              roomId: room.id,
              tenantId: null,
              month: format(billingMonth || new Date(), "yyyy-MM"),
              elecUnitPrev: room.prevElec,
              elecUnitCurr: room.prevElec,
              waterUnitPrev: room.prevWater,
              waterUnitCurr: room.prevWater,
              roomPrice: room.roomPrice,
              elecRate: systemSetting.elecRate,
              waterRate: systemSetting.waterRate,
              totalAmount: calculateTotal(room),
              status: "no_tenant" as BillingStatus,
              billImageData: null
          }));

          const allBillings = [...activeBillings, ...emptyBillings];

          if (allBillings.length === 0) return;
          
          // ส่งไปยัง Backend
          await BillingFrontendService.createBulk(allBillings);
          
          alert("บันทึกข้อมูลและส่งบิลเรียบร้อย!");
          setOpenDialog(false);
          globalThis.location.reload();

      } catch (error) {
          console.error("Save Error:", error);
          alert("เกิดข้อผิดพลาด: โปรดตรวจสอบว่าขนาดไฟล์ไม่ใหญ่เกินไปหรือ Server ดับ");
      }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [meterData, sysSetting, paySetting] = await Promise.all([
          BillingFrontendService.getLastReadings(),
          SettingService.getSettings(),
          SettingService.getPaymentSettings(),
          TenantFrontendService.getAllActiveTenants()
        ]);
        setSystemSetting(sysSetting);
        setPaymentSetting(paySetting);

        const formattedRooms: BillingRoomState[] = meterData.map((item) => ({
          id: item.roomId,
          tenantId: item.tenantId,
          roomNumber: item.roomNumber,
          tenantName: item.tenantName,
          roomPrice: item.basePrice,
          prevElec: item.lastElec,
          currentElec: "",
          prevWater: item.lastWater,
          currentWater: "",
        }));
        const sortedRooms = formattedRooms.toSorted((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
        setRooms(sortedRooms);
      } catch (error) {
        console.error(error);
      }
    };
    loadInitialData();
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            บันทึกมิเตอร์หอพัก
          </Typography>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' ,width: { xs: "100%", md: "auto" }}}>
            <DatePicker label="วันที่จดหน่วย" value={recordDate} onChange={(newValue) => setRecordDate(newValue)} format="dd/MM/yyyy" onOpen={() => {}} 
              slotProps={{
                field: { readOnly: true },
                textField: {
                  size: 'small',
                  onClick: (e) => {
                    const button = e.currentTarget.querySelector('button');
                    if (button) button.click();
                  },
                  sx: { 
                    width: 300, 
                    cursor: 'pointer',
                    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', cursor: 'pointer' },
                    '& input': { cursor: 'pointer' }
                  }
                }
              }}
            />
          <DatePicker label="รอบบิลประจำเดือน" views={['year', 'month']} value={billingMonth} onChange={(newValue) => setBillingMonth(newValue)} format="MM/yyyy"
            slotProps={{
              field: { readOnly: true },
              textField: {
                size: 'small',
                onClick: (e) => {
                  const button = e.currentTarget.querySelector('button');
                  if (button) button.click();
                },
                sx: { 
                  width: 300, 
                  cursor: 'pointer',
                  '& .MuiOutlinedInput-root': { cursor: 'pointer' },
                  '& input': { cursor: 'pointer' }
                }
              }
            }}
          />
          </Box>
        </LocalizationProvider>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#fff4e5' }}>
          <Typography variant="body2" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>ค่าไฟฟ้า</Typography>
          <Typography variant="h5" sx={{ fontWeight: '800', color: '#ed6c02' }}>
            {systemSetting?.elecRate} <small style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>บาท / หน่วย</small>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#e1f5fe' }}>
          <Typography variant="body2" sx={{ color: '#0288d1', fontWeight: 'bold' }}>ค่าน้ำประปา</Typography>
          <Typography variant="h5" sx={{ fontWeight: '800', color: '#0288d1' }}>
            {systemSetting?.waterRate} <small style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>บาท / หน่วย</small>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f0f4f8' }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 'bold' }}>น้ำขั้นต่ำ</Typography>
          <Typography variant="h5" sx={{ fontWeight: '800', color: '#334155' }}>
            {systemSetting?.waterMinUnit} <small style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>หน่วย</small>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f0f4f8' }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 'bold' }}>ค่าส่วนกลาง</Typography>
          <Typography variant="h5" sx={{ fontWeight: '800', color: '#334155' }}>
            {systemSetting?.commonFee} <small style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>บาท / เดือน</small>
          </Typography>
        </Paper>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>ห้อง</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>ราคาห้อง</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>หน่วยไฟ<br /> <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>(เดือนก่อน)</span></TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>หน่วยไฟ<br /><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>(เดือนนี้)</span></TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>หน่วยใช้</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#ed6c02', borderRight: '1px solid #e2e8f0' }}>ค่าไฟ<br /><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>(บาท)</span></TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0288d1' }}>หน่วยน้ำ<br /><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>(เดือนก่อน)</span></TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0288d1' }}>หน่วยน้ำ<br /><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>(เดือนนี้)</span></TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0288d1' }}>หน่วยใช้</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0288d1' }}>ค่าน้ำ<br /><span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>(บาท)</span></TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>ยอดสุทธิ</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} hover>
                <TableCell align="center"  sx={{ fontWeight: "bold" }}>{room.roomNumber}</TableCell>
                <TableCell  align="center">฿{room.roomPrice.toLocaleString()}</TableCell>
                <TableCell align="center">{room.prevElec}</TableCell>
                <TableCell align="center">
                  <TextField
                    size="small" type="number" value={room.currentElec}
                    onChange={(e) => handleInputChange(room.id, "currentElec", e.target.value)}
                    sx={{ width: 85, "& .MuiInputBase-input": { textAlign: "center" } }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#ed6c02" }}>{getElecUnit(room)}</TableCell>
                <TableCell align="center" sx={{ borderRight: "1px solid #e2e8f0" }}>{getElecCost(room).toLocaleString()}</TableCell>
                <TableCell align="center">{room.prevWater}</TableCell>
                <TableCell align="center">
                  <TextField
                    size="small" type="number" value={room.currentWater}
                    onChange={(e) => handleInputChange(room.id, "currentWater", e.target.value)}
                    sx={{ width: 85, "& .MuiInputBase-input": { textAlign: "center" } }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#0288d1" }}>{getWaterUnit(room)}</TableCell>
                <TableCell align="center">{getWaterCost(room).toLocaleString()}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", bgcolor: "rgba(241, 245, 249, 0.5)" }}>฿{calculateTotal(room).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained" startIcon={<ReceiptText size={20} />}
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: "#1e293b", borderRadius: 2, px: 4, py: 1.2, fontWeight: "bold" }}
        >
          ออกบิลและแจ้ง Line
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 }}}}>
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          พรีวิวบิลส่ง Line ประจำเดือน {getThaiMonthYear(billingMonth)}
          <IconButton onClick={() => setOpenDialog(false)}><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f1f5f9" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {rooms
            .filter((room) => room.tenantId !== null) 
            .map((room) => (
              <Box 
                key={room.id} 
                ref={(el: HTMLDivElement | null) => { billRefs.current[room.id] = el; }}
                sx={{ mb: 3 }}
              >
            <Paper key={room.id} sx={{ p: 0, borderRadius: 1, bgcolor: "white", border: "1px solid #e2e8f0", overflow: 'hidden' }}>
              <Box sx={{ p: 3, textAlign: "center", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: "bold", color: "#66b2b2", fontSize: "1.2rem" }}>หอพักบ้านจตุพร</Typography>
                <Typography sx={{ fontWeight: "bold", color: "#66b2b2", fontSize: "1.1rem" }}>ใบแจ้งค่าเช่าประจำเดือน {getThaiMonthYear(billingMonth)}</Typography>
              </Box>
              <Box sx={{ px: 3, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>                <Typography sx={{ fontSize: "1rem", color: "#0288d1", fontWeight: "bold" }}>
                  ห้องพัก เลขที่ {room.roomNumber} 
                </Typography>
                <Typography sx={{ fontSize: "1rem", color: "#1e293b", fontWeight: "bold" }}>
                  คุณ: {room.tenantName || 'ไม่ระบุชื่อ'} 
                </Typography>
              </Box>
                <TableContainer>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#4a8ead" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold", border: "1px solid #e2e8f0" }} align="center">คำอธิบาย</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold", border: "1px solid #e2e8f0" }} align="center">เดือนก่อน</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold", border: "1px solid #e2e8f0" }} align="center">เดือนนี้</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold", border: "1px solid #e2e8f0" }} align="center">หน่วยที่ใช้</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold", border: "1px solid #e2e8f0" }} align="center">ราคาต่อหน่วย</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold", border: "1px solid #e2e8f0" }} align="center">บาท</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* ค่าน้ำ */}
                      <TableRow>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }}>ค่าน้ำ</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{room.prevWater}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{room.currentWater || room.prevWater}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{getWaterUnit(room)}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{systemSetting?.waterRate}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="right">{getWaterCost(room).toLocaleString()}</TableCell>
                      </TableRow>
                      {/* ค่าไฟ */}
                      <TableRow>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }}>ค่าไฟฟ้า</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{room.prevElec}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{room.currentElec || room.prevElec}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{getElecUnit(room)}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{systemSetting?.elecRate}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="right">{getElecCost(room).toLocaleString()}</TableCell>
                      </TableRow>
                      {/* ค่าเช่า */}
                      <TableRow>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }}>ค่าเช่า</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center"></TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center"></TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center"></TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{room.roomPrice.toLocaleString()}</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0" }} align="right">{room.roomPrice.toLocaleString()}</TableCell>
                      </TableRow>
                      {/* ค่าส่วนกลาง (ถ้ามี) */}
                      {systemSetting?.commonFee !== 0 && (
                        <TableRow>
                          <TableCell sx={{ border: "1px solid #e2e8f0" }}>ค่าส่วนกลาง</TableCell>
                          <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center"></TableCell>
                          <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center"></TableCell>
                          <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center"></TableCell>
                          <TableCell sx={{ border: "1px solid #e2e8f0" }} align="center">{systemSetting?.commonFee.toLocaleString()}</TableCell>
                          <TableCell sx={{ border: "1px solid #e2e8f0" }} align="right">{systemSetting?.commonFee.toLocaleString()}</TableCell>
                        </TableRow>
                      )}
                      {/* หมายเหตุ */}
                      <TableRow>
                        <TableCell colSpan={4} sx={{ border: "1px solid #e2e8f0", fontSize: '0.8rem', color: 'text.secondary' }}>
                          น้ำประปา (1~{systemSetting?.waterMinUnit} หน่วย ={getWaterCost({ ...room, currentWater: String(room.prevWater) })})
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0", bgcolor: "#c5e0b4", fontWeight: "bold" }} align="center">ผลรวม</TableCell>
                        <TableCell sx={{ border: "1px solid #e2e8f0", bgcolor: "#c5e0b4", fontWeight: "bold" }} align="right">
                          {calculateTotal(room).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#0288d1", fontWeight: "bold", mb: 0.5 }}>
                      กรุณาชำระเงินภายในวันที่ 6 {getThaiMonthYear(billingMonth)}
                    </Typography>
                    
                    {paymentSetting ? (
                      <Box sx={{ textAlign: "left", py: 2, borderRadius: 2,flexWrap: 'wrap',display: 'flex',gap: 2}}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#334155", fontWeight: "bold" }}>
                          ช่องทางการชำระเงิน:
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#475569" }}>
                          ธนาคาร: {paymentSetting.bankName}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#475569" }}>
                          เลขบัญชี: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{paymentSetting.accountNumber}</span>
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#475569" }}>
                          ชื่อบัญชี: {paymentSetting.accountName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: "0.85rem", color: "red" }}>
                        *ยังไม่ได้ตั้งค่าข้อมูลการชำระเงิน
                      </Typography>
                    )}
                  </Box>
                  {paymentSetting?.qrCodeUrl && (
                    <Box sx={{ textAlign: "center", ml: 2 }}>
                      <img 
                        src={`${API_BASE_URL}${paymentSetting.qrCodeUrl}`} 
                        alt="QR Code สำหรับชำระเงิน"
                        style={{ width: '100%', maxWidth: '300px' }}
                      />
                      <Typography sx={{ fontSize: "0.65rem", color: "#64748b", mt: 0.5 }}>Scan เพื่อชำระ</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
              </Box>
            ))}
            
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            variant="contained" 
            fullWidth 
            startIcon={<Send size={18} />} 
            onClick={handleConfirmAndSave} 
            sx={{ bgcolor: "#00b900", borderRadius: 2, py: 1.5, fontWeight: "bold" }}
          >
            ยืนยันและบันทึกมิเตอร์ {rooms.length} ห้อง 
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingPage;