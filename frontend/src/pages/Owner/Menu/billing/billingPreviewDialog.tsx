import { Send, X } from "lucide-react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import type { BillingRoomState } from "../../../../type/billing";
import type { IPaymentSetting, ISystemSetting } from "../../../../services/settingService";

interface BillingPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rooms: BillingRoomState[];
  billingMonth: Date | null;
  systemSetting: ISystemSetting | null;
  paymentSetting: IPaymentSetting | null;
  billRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
  getElecUnit: (room: BillingRoomState) => number;
  getWaterUnit: (room: BillingRoomState) => number;
  getElecCost: (room: BillingRoomState) => number;
  getWaterCost: (room: BillingRoomState) => number;
  calculateTotal: (room: BillingRoomState) => number;
  getImageUrl: (path: string | null | undefined) => string;
}

const BillingPreviewDialog = ({
  open,
  onClose,
  onConfirm,
  rooms,
  billingMonth,
  systemSetting,
  paymentSetting,
  billRefs,
  getElecUnit,
  getWaterUnit,
  getElecCost,
  getWaterCost,
  calculateTotal,
  getImageUrl,
}: BillingPreviewDialogProps) => {
  const getThaiMonthYear = (date: Date | null) => {
    if (!date) return "";
    return format(date, "MMMM yyyy", { locale: th });
  };

  const formatThaiDate = (date: Date | null, isMonthOnly = false) => {
    if (!date || Number.isNaN(date.getTime())) return "";
    const yearBE = date.getFullYear() + 543;
    if (isMonthOnly) {
      return `${format(date, "MMMM", { locale: th })} ${yearBE}`;
    }
    return `${format(date, "d MMMM", { locale: th })} ${yearBE}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4 } } }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        พรีวิวบิลส่ง Line ประจำเดือน {getThaiMonthYear(billingMonth)}
        <IconButton onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#f1f5f9" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {rooms
            .filter((room) => room.tenantId !== null)
            .map((room) => (
              <Box
                key={room.id}
                ref={(el: HTMLDivElement | null) => {
                  billRefs.current[room.id] = el;
                }}
                sx={{ mb: 3 }}
              >
                <Paper
                  key={room.id}
                  ref={(el: HTMLDivElement | null) => {
                    billRefs.current[room.id] = el;
                  }}
                  elevation={3}
                  sx={{
                    borderRadius: 1,
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    m: 1,
                    p: 1,
                  }}
                >
                  <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fff" }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: "#66b2b2",
                        fontSize: "1.2rem",
                      }}
                    >
                      หอพักบ้านจตุพร
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: "#66b2b2",
                        fontSize: "1.1rem",
                      }}
                    >
                      ใบแจ้งค่าเช่าประจำเดือน {getThaiMonthYear(billingMonth)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      px: 3,
                      mb: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        color: "#0288d1",
                        fontWeight: "bold",
                      }}
                    >
                      ห้องพัก เลขที่ {room.roomNumber}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        color: "#1e293b",
                        fontWeight: "bold",
                      }}
                    >
                      คุณ: {room.tenantName || "ไม่ระบุชื่อ"}
                    </Typography>
                  </Box>

                  <TableContainer>
                    <Table size="small" sx={{ borderCollapse: "collapse" }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#4a8ead" }}>
                          {["คำอธิบาย", "เดือนก่อน", "เดือนนี้", "หน่วยที่ใช้", "ราคาต่อหน่วย", "บาท"].map((label) => (
                            <TableCell
                              key={label}
                              sx={{
                                color: "white",
                                fontWeight: "bold",
                                border: "1px solid #e2e8f0",
                              }}
                              align="center"
                            >
                              {label}
                            </TableCell>
                          ))}
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

                        {/* ค่าส่วนกลาง */}
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

                        {/* หมายเหตุ + ผลรวม */}
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            sx={{
                              border: "1px solid #e2e8f0",
                              fontSize: "0.8rem",
                              color: "text.secondary",
                            }}
                          >
                            น้ำประปา (1~{systemSetting?.waterMinUnit} หน่วย ={" "}
                            {getWaterCost({ ...room, currentWater: String(room.prevWater) })})
                          </TableCell>
                          <TableCell
                            sx={{
                              border: "1px solid #e2e8f0",
                              bgcolor: "#c5e0b4",
                              fontWeight: "bold",
                            }}
                            align="center"
                          >
                            ผลรวม
                          </TableCell>
                          <TableCell
                            sx={{
                              border: "1px solid #e2e8f0",
                              bgcolor: "#c5e0b4",
                              fontWeight: "bold",
                            }}
                            align="right"
                          >
                            {calculateTotal(room).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <Box sx={{ textAlign: "left" }}>
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: "#0288d1",
                          fontWeight: "bold",
                          mb: 0.5,
                        }}
                      >
                        กรุณาชำระเงินภายในวันที่ 6 {formatThaiDate(billingMonth, true)}
                      </Typography>

                      {paymentSetting ? (
                        <Box
                          sx={{
                            textAlign: "left",
                            py: 2,
                            borderRadius: 2,
                            flexWrap: "wrap",
                            display: "flex",
                            gap: 2,
                          }}
                        >
                          <Typography sx={{ fontSize: "0.85rem", color: "#334155", fontWeight: "bold" }}>
                            ช่องทางการชำระเงิน:
                          </Typography>
                          <Typography sx={{ fontSize: "0.85rem", color: "#475569" }}>
                            ธนาคาร: {paymentSetting.bankName}
                          </Typography>
                          <Typography sx={{ fontSize: "0.85rem", color: "#475569" }}>
                            เลขบัญชี:{" "}
                            <span style={{ fontWeight: "bold", color: "#0f172a" }}>
                              {paymentSetting.accountNumber}
                            </span>
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
                          src={getImageUrl(paymentSetting?.qrCodeUrl)}
                          alt="QR Code"
                          crossOrigin="anonymous"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "contain",
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                        <Typography sx={{ fontSize: "0.5rem", color: "#64748b", mt: 0.5 }}>
                          Scan เพื่อชำระ
                        </Typography>
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
          onClick={onConfirm}
          sx={{
            bgcolor: "#00b900",
            borderRadius: 2,
            py: 1.5,
            fontWeight: "bold",
          }}
        >
          ยืนยันและบันทึกมิเตอร์ {rooms.length} ห้อง
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillingPreviewDialog;