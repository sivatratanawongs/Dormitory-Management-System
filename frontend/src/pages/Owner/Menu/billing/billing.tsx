import html2canvas from "html2canvas";
import { useEffect, useRef, useState } from "react";
import { ReceiptText } from "lucide-react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { th } from "date-fns/locale";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//Service
import { BillingFrontendService } from "../../../../services/billingService";
import {
  SettingService,
  type IPaymentSetting,
  type ISystemSetting,
} from "../../../../services/settingService";
//Type
import type { BillingRoomState, BillingStatus, ICreateBilling } from "../../../../type/billing";
import { TenantFrontendService } from "../../../../services/tenantService";
import { useLoading } from "../../../../components/LoadingContext";
import BillingPreviewDialog from "./billingPreviewDialog";

const BillingPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { withLoading } = useLoading();
  const [rooms, setRooms] = useState<BillingRoomState[]>([]);
  const [recordDate, setRecordDate] = useState<Date | null>(new Date());
  const billRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [billingMonth, setBillingMonth] = useState<Date | null>(new Date());
  const [systemSetting, setSystemSetting] = useState<ISystemSetting | null>(
    null,
  );
  const [paymentSetting, setPaymentSetting] = useState<IPaymentSetting | null>(
    null,
  );
  const getElecUnit = (room: BillingRoomState) =>
    Math.max(0, (Number(room.currentElec) || 0) - room.prevElec);
  const getWaterUnit = (room: BillingRoomState) =>
    Math.max(0, (Number(room.currentWater) || 0) - room.prevWater);

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
    const activeRooms = rooms.filter((room) => room.tenantId !== null);
    const emptyRooms = rooms.filter((room) => room.tenantId === null);

    const activeBillings: ICreateBilling[] = await Promise.all(
      activeRooms.map(async (room) => {
        const currentElecVal = room.currentElec === "" ? room.prevElec : Number(room.currentElec);
        const currentWaterVal = room.currentWater === "" ? room.prevWater : Number(room.currentWater);
        
        let base64Image: string | null = null;
        if (billRefs.current[room.id]) {
          const element = billRefs.current[room.id];
          if (element) {
          const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          });
          base64Image = canvas.toDataURL("image/png");
          }
        }

        return {
          roomId: room.id,
          roomNumber: room.roomNumber,
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
          billImageData: base64Image,
        };
      })
    );

    const emptyBillings: ICreateBilling[] = emptyRooms.map((room) => ({
      roomId: room.id,
      roomNumber: room.roomNumber,
      tenantId: null, 
      month: format(billingMonth || new Date(), "yyyy-MM"),
      elecUnitPrev: room.prevElec,
      elecUnitCurr: room.prevElec,
      waterUnitPrev: room.prevWater,
      waterUnitCurr: room.prevWater,
      roomPrice: 0,
      elecRate: systemSetting.elecRate,
      waterRate: systemSetting.waterRate,
      totalAmount: 0,
      status: "no_tenant" as BillingStatus,
      billImageData: null,
    }));

    const allBillings: ICreateBilling[] = [...activeBillings, ...emptyBillings];
    if (allBillings.length === 0) return;

    await withLoading((async () => {
    try {
      await BillingFrontendService.createBulk(allBillings); 
      setOpenDialog(false);
      globalThis.location.reload();
    } catch (error: unknown) {
      console.error("Save Billing Error:", error);}
  })());
  } catch (error: unknown) {
    console.error("Process Error:", error);
  }
};

  const formatThaiDate = (date: Date | null, isMonthOnly = false) => {
    if (!date || Number.isNaN(date.getTime())) return "";
    const yearBE = date.getFullYear() + 543;
    if (isMonthOnly) {
      return `${format(date, "MMMM", { locale: th })} ${yearBE}`;
    }
    return `${format(date, "d MMMM", { locale: th })} ${yearBE}`;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [meterData, sysSetting, paySetting] = await withLoading(
          Promise.all([
            BillingFrontendService.getLastReadings(),
            SettingService.getSettings(),
            SettingService.getPaymentSettings(),
            TenantFrontendService.getAllActiveTenants(),
          ]),
        );
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
        const sortedRooms = formattedRooms.toSorted((a, b) =>
          a.roomNumber.localeCompare(b.roomNumber, undefined, {
            numeric: true,
          }),
        );
        setRooms(sortedRooms);
      } catch (error) {
        console.error(error);
      }
    };
    loadInitialData();
  }, [withLoading]);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";

    let finalUrl = "";
    if (path.startsWith("http")) {
      finalUrl = path;
    } else if (path.startsWith("data:")) {
      return path;
    } else {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
      finalUrl = `${baseUrl}${path}`;
    }
    const separator = finalUrl.includes("?") ? "&" : "?";
    return `${finalUrl}${separator}t=${new Date().getTime()}`;
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            บันทึกมิเตอร์หอพัก
          </Typography>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
              >
                วันที่จดหน่วย
              </Typography>
              <DatePicker
                selected={recordDate}
                onChange={(date: Date | null) => setRecordDate(date)}
                locale={th}
                value={formatThaiDate(recordDate)}
                customInput={
                  <TextField
                    size="small"
                    sx={{
                      width: 300,
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        borderRadius: 2,
                      },
                    }}
                  />
                }
              />
            </Box>
            <Box sx={{ position: "relative" }}>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
              >
                รอบบิลประจำเดือน
              </Typography>
              <DatePicker
                selected={billingMonth}
                onChange={(date: Date | null) => setBillingMonth(date)}
                locale={th}
                showMonthYearPicker
                value={formatThaiDate(billingMonth, true)}
                customInput={
                  <TextField
                    size="small"
                    sx={{
                      width: 300,
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "white",
                        borderRadius: 2,
                      },
                    }}
                  />
                }
              />
            </Box>
          </Box>
        </LocalizationProvider>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          gap: 2,
          mb: 4,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#fff4e5" }}>
          <Typography
            variant="body2"
            sx={{ color: "#ed6c02", fontWeight: "bold" }}
          >
            ค่าไฟฟ้า
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#ed6c02" }}>
            {systemSetting?.elecRate}{" "}
            <small style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
              บาท / หน่วย
            </small>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#e1f5fe" }}>
          <Typography
            variant="body2"
            sx={{ color: "#0288d1", fontWeight: "bold" }}
          >
            ค่าน้ำประปา
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#0288d1" }}>
            {systemSetting?.waterRate}{" "}
            <small style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
              บาท / หน่วย
            </small>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#f0f4f8" }}>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: "bold" }}
          >
            น้ำขั้นต่ำ
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#334155" }}>
            {systemSetting?.waterMinUnit}{" "}
            <small style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
              หน่วย
            </small>
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#f0f4f8" }}>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: "bold" }}
          >
            ค่าส่วนกลาง
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#334155" }}>
            {systemSetting?.commonFee}{" "}
            <small style={{ fontSize: "0.9rem", fontWeight: "normal" }}>
              บาท / เดือน
            </small>
          </Typography>
        </Paper>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                ห้อง
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                ราคาห้อง
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#ed6c02" }}
              >
                หน่วยไฟ
                <br />{" "}
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  (เดือนก่อน)
                </span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#ed6c02" }}
              >
                หน่วยไฟ
                <br />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  (เดือนนี้)
                </span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#ed6c02" }}
              >
                หน่วยใช้
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "#ed6c02",
                  borderRight: "1px solid #e2e8f0",
                }}
              >
                ค่าไฟ
                <br />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  (บาท)
                </span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#0288d1" }}
              >
                หน่วยน้ำ
                <br />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  (เดือนก่อน)
                </span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#0288d1" }}
              >
                หน่วยน้ำ
                <br />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  (เดือนนี้)
                </span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#0288d1" }}
              >
                หน่วยใช้
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#0288d1" }}
              >
                ค่าน้ำ
                <br />
                <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                  (บาท)
                </span>
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", bgcolor: "#f1f5f9" }}
              >
                ยอดสุทธิ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} hover>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  {room.roomNumber}
                </TableCell>
                <TableCell align="center">
                  ฿{room.roomPrice.toLocaleString()}
                </TableCell>
                <TableCell align="center">{room.prevElec}</TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    type="number"
                    value={room.currentElec}
                    onChange={(e) =>
                      handleInputChange(room.id, "currentElec", e.target.value)
                    }
                    sx={{
                      width: 85,
                      "& .MuiInputBase-input": { textAlign: "center" },
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", color: "#ed6c02" }}
                >
                  {getElecUnit(room)}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ borderRight: "1px solid #e2e8f0" }}
                >
                  {getElecCost(room).toLocaleString()}
                </TableCell>
                <TableCell align="center">{room.prevWater}</TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    type="number"
                    value={room.currentWater}
                    onChange={(e) =>
                      handleInputChange(room.id, "currentWater", e.target.value)
                    }
                    sx={{
                      width: 85,
                      "& .MuiInputBase-input": { textAlign: "center" },
                    }}
                  />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", color: "#0288d1" }}
                >
                  {getWaterUnit(room)}
                </TableCell>
                <TableCell align="center">
                  {getWaterCost(room).toLocaleString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: "rgba(241, 245, 249, 0.5)",
                  }}
                >
                  ฿{calculateTotal(room).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<ReceiptText size={20} />}
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: "#1e293b",
            borderRadius: 2,
            px: 4,
            py: 1.2,
            fontWeight: "bold",
          }}
        >
          ออกบิลและแจ้ง Line
        </Button>
      </Box>

      <BillingPreviewDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onConfirm={handleConfirmAndSave}
          rooms={rooms}
          billingMonth={billingMonth}
          systemSetting={systemSetting}
          paymentSetting={paymentSetting}
          billRefs={billRefs}
          getElecUnit={getElecUnit}
          getWaterUnit={getWaterUnit}
          getElecCost={getElecCost}
          getWaterCost={getWaterCost}
          calculateTotal={calculateTotal}
          getImageUrl={getImageUrl}
        />
    </Box>
  );
};

export default BillingPage;
