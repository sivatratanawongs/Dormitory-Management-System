import { useEffect, useState, useMemo } from "react";
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
  TextField,
  Chip,
} from "@mui/material";
import { History } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { th } from "date-fns/locale";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { BillingFrontendService } from "../../../../services/billingService";
import {
  SettingService,
  type ISystemSetting,
} from "../../../../services/settingService";
import { useLoading } from "../../../../components/LoadingContext";
import type { BillingStatus, ITenantBillingHistory } from "../../../../type/billing";

const formatThaiMonthYear = (date: Date | null): string => {
  if (!date || Number.isNaN(date.getTime())) return "";
  const yearBE = date.getFullYear() + 543;
  return `${format(date, "MMMM", { locale: th })} ${yearBE}`;
};

const statusLabel: Record<BillingStatus, { label: string; color: "default" | "warning" | "success" | "error" | "info" }> = {
  pending:   { label: "รอชำระ",   color: "warning" },
  paid:      { label: "ชำระแล้ว", color: "success" },
  cancelled: { label: "ยกเลิก",   color: "error"   },
  no_tenant: { label: "ห้องว่าง",  color: "default" },
};

const HistoryPage = () => {
  const { withLoading } = useLoading();

  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [records, setRecords] = useState<ITenantBillingHistory[]>([]);
  const [systemSetting, setSystemSetting] = useState<ISystemSetting | null>(null);

  const activeRecords = useMemo(
    () => records.filter((r) => r.status !== "no_tenant"),
    [records],
  );

  const summary = useMemo(() => {
    const elecUnits = activeRecords.reduce(
      (s, r) => s + Math.max(0, r.elecUnitCurr - r.elecUnitPrev),
      0,
    );
    const waterUnits = activeRecords.reduce(
      (s, r) => s + Math.max(0, r.waterUnitCurr - r.waterUnitPrev),
      0,
    );
    const elecCost = activeRecords.reduce(
      (s, r) => s + Math.max(0, r.elecUnitCurr - r.elecUnitPrev) * r.elecRate,
      0,
    );
    const waterCost = activeRecords.reduce((s, r) => {
      const used = Math.max(0, r.waterUnitCurr - r.waterUnitPrev);
      const minUnit = systemSetting?.waterMinUnit ?? 0;
      const rate = r.waterRate;
      return s + (used <= minUnit ? minUnit * rate : used * rate);
    }, 0);
    const total = activeRecords.reduce((s, r) => s + r.totalAmount, 0);
    return { elecUnits, waterUnits, elecCost, waterCost, total };
  }, [activeRecords, systemSetting]);


  useEffect(() => {
    const load = async () => {
      if (!selectedMonth) return;
      const monthStr = format(selectedMonth, "yyyy-MM");
      try {
        const [data, sysSetting] = await withLoading(
          Promise.all([
            BillingFrontendService.getByMonth(monthStr), 
            SettingService.getSettings(),
          ]),
        );
        setSystemSetting(sysSetting);

        const sorted: ITenantBillingHistory[] = [...data].sort((a, b) =>
          (a.room?.roomNumber ?? "").localeCompare(b.room?.roomNumber ?? "", undefined, { numeric: true }),
        );
        setRecords(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [selectedMonth, withLoading]);

  const cellSx = { py: 1.2 };
  const headerSx = { fontWeight: "bold", py: 1.5 };

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
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <History size={28} />
          ประวัติค่าห้อง
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={th}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              เลือกเดือน
            </Typography>
            <DatePicker
              selected={selectedMonth}
              onChange={(date: Date | null) => setSelectedMonth(date)}
              locale={th}
              showMonthYearPicker
              value={formatThaiMonthYear(selectedMonth)}
              customInput={
                <TextField
                  size="small"
                  sx={{
                    width: 240,
                    "& .MuiOutlinedInput-root": { bgcolor: "white", borderRadius: 2 },
                  }}
                />
              }
            />
          </Box>
        </LocalizationProvider>
      </Box>

      {/* ── Summary cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#fff4e5" }}>
          <Typography variant="body2" sx={{ color: "#ed6c02", fontWeight: "bold" }}>
            รวมหน่วยไฟที่ใช้
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#ed6c02" }}>
            {summary.elecUnits.toLocaleString()}{" "}
            <small style={{ fontSize: "0.9rem", fontWeight: "normal" }}>หน่วย</small>
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#e1f5fe" }}>
          <Typography variant="body2" sx={{ color: "#0288d1", fontWeight: "bold" }}>
            รวมหน่วยน้ำที่ใช้
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#0288d1" }}>
            {summary.waterUnits.toLocaleString()}{" "}
            <small style={{ fontSize: "0.9rem", fontWeight: "normal" }}>หน่วย</small>
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#fff4e5" }}>
          <Typography variant="body2" sx={{ color: "#ed6c02", fontWeight: "bold" }}>
            รวมค่าไฟ
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#ed6c02" }}>
            ฿{summary.elecCost.toLocaleString()}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#e1f5fe" }}>
          <Typography variant="body2" sx={{ color: "#0288d1", fontWeight: "bold" }}>
            รวมค่าน้ำ
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#0288d1" }}>
            ฿{summary.waterCost.toLocaleString()}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "#e8f5e9" }}>
          <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
            รวมยอดสุทธิทั้งหมด
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "800", color: "#2e7d32" }}>
            ฿{summary.total.toLocaleString()}
          </Typography>
        </Paper>
      </Box>

      {/* ── Table ── */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell align="center" sx={headerSx}>ห้อง</TableCell>
              <TableCell align="center" sx={headerSx}>ผู้เช่า</TableCell>
              <TableCell align="center" sx={headerSx}>ราคาห้อง</TableCell>

              {/* Electricity group */}
              <TableCell align="center" sx={{ ...headerSx, color: "#ed6c02" }}>
                หน่วยไฟ (ก่อน)
              </TableCell>
              <TableCell align="center" sx={{ ...headerSx, color: "#ed6c02" }}>
                หน่วยไฟ (หลัง)
              </TableCell>
              <TableCell align="center" sx={{ ...headerSx, color: "#ed6c02" }}>
                ใช้ (หน่วย)
              </TableCell>
              <TableCell
                align="center"
                sx={{ ...headerSx, color: "#ed6c02", borderRight: "1px solid #e2e8f0" }}
              >
                ค่าไฟ (บาท)
              </TableCell>

              {/* Water group */}
              <TableCell align="center" sx={{ ...headerSx, color: "#0288d1" }}>
                หน่วยน้ำ (ก่อน)
              </TableCell>
              <TableCell align="center" sx={{ ...headerSx, color: "#0288d1" }}>
                หน่วยน้ำ (หลัง)
              </TableCell>
              <TableCell align="center" sx={{ ...headerSx, color: "#0288d1" }}>
                ใช้ (หน่วย)
              </TableCell>
              <TableCell align="center" sx={{ ...headerSx, color: "#0288d1" }}>
                ค่าน้ำ (บาท)
              </TableCell>

              {/* Status & Total */}
              <TableCell align="center" sx={headerSx}>สถานะ</TableCell>
              <TableCell align="right" sx={{ ...headerSx, bgcolor: "#f1f5f9" }}>
                ยอดสุทธิ
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  ไม่พบข้อมูลในเดือนที่เลือก
                </TableCell>
              </TableRow>
            ) : (
              <>
                {records.map((room) => {
                  const elecUsed = Math.max(0, room.elecUnitCurr - room.elecUnitPrev);
                  const waterUsed = Math.max(0, room.waterUnitCurr - room.waterUnitPrev);
                  const elecCost = elecUsed * room.elecRate;
                  const minUnit = systemSetting?.waterMinUnit ?? 0;
                  const waterCost =
                    waterUsed <= minUnit
                      ? minUnit * room.waterRate
                      : waterUsed * room.waterRate;
                  const isVacant = room.status === "no_tenant";
                  const st = statusLabel[room.status] ?? { label: room.status, color: "default" };

                  return (
                    <TableRow
                      key={room.id}
                      hover
                      sx={{ opacity: isVacant ? 0.45 : 1 }}
                    >
                      <TableCell align="center" sx={{ ...cellSx, fontWeight: "bold" }}>
                        {room.room?.roomNumber ?? "—"}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {room.tenantId ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {room.tenantId.name}
                            </Typography>
                            {room.tenantId.nickname && (
                              <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: 'italic' }}>
                                ({room.tenantId.nickname})
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <em style={{ color: "#94a3b8" }}>ว่าง</em>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {isVacant ? "—" : `฿${room.roomPrice.toLocaleString()}`}
                      </TableCell>

                      {/* Electricity */}
                      <TableCell align="center" sx={cellSx}>{room.elecUnitPrev}</TableCell>
                      <TableCell align="center" sx={cellSx}>{isVacant ? "—" : room.elecUnitCurr}</TableCell>
                      <TableCell align="center" sx={{ ...cellSx, fontWeight: "bold", color: "#ed6c02" }}>
                        {isVacant ? "—" : elecUsed}
                      </TableCell>
                      <TableCell align="center" sx={{ ...cellSx, borderRight: "1px solid #e2e8f0" }}>
                        {isVacant ? "—" : elecCost.toLocaleString()}
                      </TableCell>

                      {/* Water */}
                      <TableCell align="center" sx={cellSx}>{room.waterUnitPrev}</TableCell>
                      <TableCell align="center" sx={cellSx}>{isVacant ? "—" : room.waterUnitCurr}</TableCell>
                      <TableCell align="center" sx={{ ...cellSx, fontWeight: "bold", color: "#0288d1" }}>
                        {isVacant ? "—" : waterUsed}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {isVacant ? "—" : waterCost.toLocaleString()}
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={cellSx}>
                        <Chip label={st.label} color={st.color} size="small" />
                      </TableCell>

                      {/* Total */}
                      <TableCell
                        align="right"
                        sx={{ ...cellSx, fontWeight: "bold", bgcolor: "rgba(241,245,249,0.5)" }}
                      >
                        {isVacant ? "—" : `฿${room.totalAmount.toLocaleString()}`}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* ── Summary row ── */}
                {activeRecords.length > 0 && (
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell
                      colSpan={2}
                      sx={{ fontWeight: "bold", py: 1.5, pl: 2 }}
                    >
                      สรุปรวม ({activeRecords.length} ห้อง)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      ฿{activeRecords.reduce((s, r) => s + r.roomPrice, 0).toLocaleString()}
                    </TableCell>

                    {/* elec blanks */}
                    <TableCell /><TableCell />
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#ed6c02" }}>
                      {summary.elecUnits.toLocaleString()}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#ed6c02", borderRight: "1px solid #e2e8f0" }}
                    >
                      ฿{summary.elecCost.toLocaleString()}
                    </TableCell>

                    {/* water blanks */}
                    <TableCell /><TableCell />
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#0288d1" }}>
                      {summary.waterUnits.toLocaleString()}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#0288d1" }}>
                      ฿{summary.total - activeRecords.reduce((s, r) => s + r.roomPrice, 0) - summary.elecCost > 0
                          ? (summary.total - activeRecords.reduce((s, r) => s + r.roomPrice, 0) - summary.elecCost).toLocaleString()
                          : summary.waterUnits > 0 ? "—" : "0"}
                    </TableCell>

                    <TableCell />
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", fontSize: "1rem", color: "#1e293b" }}
                    >
                      ฿{summary.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistoryPage;