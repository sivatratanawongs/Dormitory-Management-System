import { useState, useEffect, type ElementType } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider, Chip, IconButton, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { ChevronLeft, Phone, User, FileText, ArrowRight, Home, File, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import { format } from "date-fns";
registerLocale('th', th);

// Local imports
import { TenantFrontendService } from '../../../../services/tenantService';
import { BillingFrontendService } from '../../../../services/billingService';
import type { DetailItemProps, DocumentItemProps, ITenant } from '../../../../type/tenant';
import type { ITenantBillingHistory } from '../../../../type/billing';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const TenantDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<ITenant | null>(location.state?.tenant || null);
  const [loading, setLoading] = useState(!tenant);
  const [error] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ITenant | null>(null);
  const [usageHistory, setUsageHistory] = useState<ITenantBillingHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<'idCard' | 'contract' | null>(null);
  const roomNumberFromState = location.state?.roomNumber;

  useEffect(() => {
    const fetchTenantData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await TenantFrontendService.getTenantDetail(id);
        if (response.success && response.data) {
          setTenant(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData(); 
  }, [id]); 

  useEffect(() => {
    const fetchBillingHistory = async () => {
      if (!id) return;
      try {
        setHistoryLoading(true);
        const data = await BillingFrontendService.getHistoryByTenant(id);
        setUsageHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchBillingHistory();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (error || !tenant) return <ErrorState message={error} onBack={() => navigate(-1)} />;

  const formatThaiDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    
    const yearBE = date.getFullYear() + 543; 
    return `${format(date, 'd MMMM', { locale: th })} ${yearBE}`;
  };

  const openDeleteConfirm = (fileType: 'idCard' | 'contract') => {
    setFileToDelete(fileType);
    setDeleteDialogOpen(true);
  };

  //Region Handle
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'idCard' | 'contract') => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploading(fileType);
      const response = await TenantFrontendService.uploadFile(id, file, fileType);

      if (response.success) {
        const freshData = await TenantFrontendService.getTenantDetail(id);
        setTenant(freshData.data ?? null);
      }
    } finally {
      setUploading(null);
    }
  };

  const handleEditClick = () => {
    setEditForm({ ...tenant }); 
    setIsEditing(true);
  };

  const handleInputChange = <K extends keyof ITenant>(field: K, value: ITenant[K]) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete || !id) return;

    try {
      setDeleteDialogOpen(false); 
      setUploading(fileToDelete); 
      const response = await TenantFrontendService.deleteFile(id, fileToDelete);
      if (response.success) {
        const freshData = await TenantFrontendService.getTenantDetail(id);
        setTenant(freshData.data ?? null);
      }
    } finally {
      setUploading(null);
      setFileToDelete(null);
    }
  };

  const handleViewFile = (url: string | null | undefined) => {
    if (!url) {
      alert("ไม่พบไฟล์เอกสาร");
      return;
    }
    const formatPath = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${API_BASE_URL}${formatPath}`;
    window.open(fullUrl, '_blank');
  };

  const handleSave = async () => {
    if (!editForm || !id) return;

    try {
      setLoading(true);
      const response = await TenantFrontendService.updateTenant(id, editForm);

      if (response.success) {
        const freshData = await TenantFrontendService.getTenantDetail(id);
        if (freshData.success && freshData.data) {
          setTenant(freshData.data); 
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  //Endregion

  const renderTableContent = () => {
    if (historyLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">กำลังโหลดข้อมูล...</TableCell>
        </TableRow>
      );
    }

    if (usageHistory.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">ไม่พบประวัติการออกบิล</TableCell>
        </TableRow>
      );
    }

    return usageHistory.map((row) => (
      <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#fcfcfd' } }}>
        <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
        <TableCell align="center">
          <Typography component="span" sx={{ 
            color: '#3b82f6', 
            fontWeight: 700,
            fontSize: '0.875rem'
          }}>
            {Math.max(0, row.waterUnitCurr - row.waterUnitPrev)}
          </Typography>
        </TableCell>
        
        <TableCell align="center" >
          {row.waterRate} 
        </TableCell>

        <TableCell align="center">
          <Typography component="span" sx={{ 
            color: '#d97706', 
            fontWeight: 700,
            fontSize: '0.875rem'
          }}>
            {Math.max(0, row.elecUnitCurr - row.elecUnitPrev)}
          </Typography>
        </TableCell>
        
        <TableCell align="center">
          {row.elecRate} 
        </TableCell>
        
        <TableCell align="right" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {row.totalAmount.toLocaleString()} ฿
        </TableCell>
      </TableRow>
    ));
  };

return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
            <ChevronLeft size={20} />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>รายละเอียดผู้เช่า</Typography>
        </Stack>
        {isEditing ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setIsEditing(false)} sx={{ borderRadius: 2 }}>ยกเลิก</Button>
            <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#0f172a', borderRadius: 2 }}>บันทึกข้อมูล</Button>
          </Stack>
        ) : (
          <Button variant="contained" onClick={handleEditClick} sx={{ bgcolor: '#0f172a', borderRadius: 2 }}>แก้ไขข้อมูล</Button>
        )}
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        <Box sx={{ flex: { lg: '0 0 360px' }, width: '100%' }}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar  sx={{  width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#eff6ff', color: '#3b82f6', fontSize: '2.5rem', fontWeight: 800, border: '4px solid #fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}>
                {tenant.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>{tenant.name}</Typography>
              <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
                <Chip icon={<Home size={14} />} label={`ห้อง ${roomNumberFromState || '-'}`} color="primary" sx={{ fontWeight: 700, borderRadius: 2 }} />
                <Chip label="พักอยู่" color="success" sx={{ fontWeight: 700, borderRadius: 2 }} variant="outlined" />
              </Stack>
            </Box>
            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
            <Stack spacing={2}>
              <Button variant="contained" fullWidth startIcon={<Phone size={18} />} onClick={() => window.open(`tel:${tenant.phone}`)} sx={{ bgcolor: '#0f172a', borderRadius: 3, py: 1.5 }}>
                โทรหาผู้เช่า
              </Button>
              <Button variant="outlined" fullWidth color="error" sx={{ borderRadius: 3, py: 1.5, borderWidth: 2 }}>
                แจ้งย้ายออก
              </Button>
            </Stack>
          </Paper>
        </Box>

        <Box sx={{ flex: 1, width: '100%' }}>
          <Stack spacing={4}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <DetailCard title="ข้อมูลส่วนตัว" icon={User}>
                <DetailItem label="ชื่อ-นามสกุล :" value={isEditing ? editForm?.name : tenant.name} isEditing={isEditing} onChange={(val) => handleInputChange('name', val)} />
                <DetailItem label="ชื่อเล่น :" value={isEditing ? editForm?.nickname : tenant.nickname} isEditing={isEditing} onChange={(val) => handleInputChange('nickname', val)} />
                <DetailItem label="เลขบัตรประชาชน :" value={isEditing ? editForm?.idCard : tenant.idCard} isEditing={isEditing} onChange={(val) => handleInputChange('idCard', val)} />
                <DetailItem label="เบอร์โทรศัพท์ :" value={isEditing ? editForm?.phone : tenant.phone} isEditing={isEditing} onChange={(val) => handleInputChange('phone', val)} />
                <DetailItem label="ที่อยู่ :" value={isEditing ? editForm?.address : tenant.address} isEditing={isEditing} onChange={(val) => handleInputChange('address', val)} />
              </DetailCard>
              <DetailCard title="ข้อมูลสัญญาเช่า" icon={FileText}>
                <DetailItem label="วันที่ทำสัญญา :" value={isEditing ? editForm?.contractDate : formatThaiDate(tenant.contractDate)} isEditing={isEditing} type="date" onChange={(val) => handleInputChange('contractDate', val)} />
                <DetailItem label="วันที่เริ่มเข้าพัก :" value={isEditing ? editForm?.moveInDate : formatThaiDate(tenant.moveInDate)} isEditing={isEditing} type="date" onChange={(val) => handleInputChange('moveInDate', val)} />
                <DetailItem label="วันที่สิ้นสุดสัญญา :" value={isEditing ? editForm?.contractEndDate : formatThaiDate(tenant.contractEndDate)} isEditing={isEditing} type="date" onChange={(val) => handleInputChange('contractEndDate', val)} />
                <DetailItem label="ระยะสัญญา (เดือน) :" value={isEditing ? editForm?.contractTerm : tenant.contractTerm} isEditing={isEditing} type="number" onChange={(val) => handleInputChange('contractTerm', Number(val))} />
                <DetailItem label="เงินประกัน (฿) :" value={isEditing ? editForm?.deposit : tenant.deposit} isEditing={isEditing} type="number" highlight onChange={(val) => handleInputChange('deposit', Number(val))} />
                <DetailItem label="Line ID :" value={isEditing ? editForm?.lineId : tenant.lineId} isEditing={isEditing} onChange={(val) => handleInputChange('lineId', val)} />
              </DetailCard>
            </Box>

            <input type="file" id="upload-id-card" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'idCard')} />
            <input type="file" id="upload-contract" hidden accept="application/pdf" onChange={(e) => handleFileChange(e, 'contract')} />
            
            <DetailCard title="เอกสารแนบ" icon={File}>
              <Stack spacing={2}>
                <DocumentItem 
                  label="สำเนาบัตรประชาชน" icon={ImageIcon} 
                  onDelete={() => openDeleteConfirm('idCard')}
                  onView={() => handleViewFile(tenant.idCardUrl)}
                  onEdit={() => document.getElementById('upload-id-card')?.click()} 
                  hasFile={!!tenant.idCardUrl} isLoading={uploading === 'idCard'}
                />
                <Divider sx={{ borderStyle: 'dashed' }} />
                <DocumentItem 
                  label="ไฟล์สัญญาเช่า (PDF)" icon={FileText} 
                  onView={() => handleViewFile(tenant.contractFileUrl)}
                  onEdit={() => document.getElementById('upload-contract')?.click()}
                  hasFile={!!tenant.contractFileUrl} isLoading={uploading === 'contract'}
                  onDelete={() => openDeleteConfirm('contract')}
                />
              </Stack>
            </DetailCard>

            <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  ประวัติการใช้น้ำ-ไฟ
                </Typography>
                <Button endIcon={<ArrowRight size={16} />} size="small">ดูบิลทั้งหมด</Button>
              </Stack>
              <TableContainer sx={{ borderRadius: 3, border: '1px solid #f1f5f9' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>รอบเดือน</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>น้ำ (หน่วย)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>ค่าน้ำ/หน่วย (บาท)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>ไฟ (หน่วย)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>ค่าไฟ/หน่วย (บาท)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>ยอดรวม</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderTableContent()}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </Box>
      </Box>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 1 }
          }
        }}
      >
      <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
        ยืนยันการลบไฟล์
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          คุณแน่ใจหรือไม่ว่าต้องการลบ {fileToDelete === 'idCard' ? 'สำเนาบัตรประชาชน' : 'ไฟล์สัญญาเช่า'}? 
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={() => setDeleteDialogOpen(false)} 
          variant="outlined" 
          sx={{ borderRadius: 2, color: '#64748b', borderColor: '#e2e8f0' }}
        >
          ยกเลิก
        </Button>
        <Button 
          onClick={handleConfirmDelete} 
          variant="contained" 
          color="error" 
          autoFocus
          sx={{ borderRadius: 2, bgcolor: '#ef4444', fontWeight: 600 }}
        >
          ยืนยันการลบ
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

const DetailCard = ({ title, icon: Icon,children }: { title: string, icon: ElementType, children: React.ReactNode }) => (
  <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', height: '100%' }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: '#334155' }}>
      <Icon size={20} /> 
      {title}
    </Typography>
    <Stack spacing={2}>{children}</Stack>
  </Paper>
);

const DetailItem = ({ label, value, isEditing, type = 'text', onChange }: DetailItemProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const getThaiDateDisplay = (val: string | number | Date | null | undefined): string => {
    if (!val || val === "-" || val === "") return "-";

    try {
      let date: Date;
      
      if (typeof val === 'string') {
        const standardizedDate = val.replace(' ', 'T');
        date = new Date(standardizedDate);
      } else {
        date = new Date(val);
      }

      if (Number.isNaN(date.getTime())) return "-";
      const yearBE = date.getFullYear() + 543;
      return `${format(date, 'd MMMM', { locale: th })} ${yearBE}`;
    } catch (e) {
      console.error(e);
      return "-";
    }
  };

  const renderValue = (): string => {
    if (!value || value === "-" || value === "") return "-";
    if (type === 'date') {
      return getThaiDateDisplay(value);
    }
    if (type === 'number') {
      return Number(value || 0).toLocaleString();
    }
    return String(value);
  };

  const renderEditInput = () => {
    if (type === 'date') {
      return (
        <Box sx={{ flex: 1, '& .react-datepicker-wrapper': { width: '100%' } }}>
          <DatePicker
            open={isDatePickerOpen}
            onInputClick={() => setIsDatePickerOpen(true)}
            onClickOutside={() => setIsDatePickerOpen(false)}
            selected={value && value !== "-" ? new Date(value as string) : null}
            onChange={(date: Date | null) => {
              if (date) {
                const formattedDate = format(date, 'yyyy-MM-dd');
                onChange?.(formattedDate);
                setIsDatePickerOpen(false);
              }
            }}
            locale="th"
            value={getThaiDateDisplay(value)}
            portalId="root-portal"
            popperClassName="custom-datepicker-popper"
            customInput={
              <TextField
                size="small"
                fullWidth
                inputProps={{ readOnly: true }}
                onClick={() => setIsDatePickerOpen(true)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#fff',
                    '& input': { cursor: 'pointer' }
                  }
                }}
              />
            }
          />
        </Box>
      );
    }

    return (
      <TextField
        size="small"
        type={type}
        fullWidth
        value={(value === "-" ? "" : value) || ''} 
        onChange={(e) => onChange?.(e.target.value)}
        multiline={label.includes("ที่อยู่")}
        rows={label.includes("ที่อยู่") ? 3 : 1}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            bgcolor: '#fff',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: '#e2e8f0' }
          }
        }}
      />
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: label.includes("ที่อยู่") ? 'flex-start' : 'center', 
      minHeight: 48, 
      gap: 2,
      py: 0.5 
    }}>
      <Box sx={{ minWidth: 140, flexShrink: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
          {label}
        </Typography>
      </Box>

      {isEditing ? (
        renderEditInput()
      ) : (
        <TextField
          size="small"
          fullWidth
          multiline={label.includes("ที่อยู่")}
          rows={label.includes("ที่อยู่") ? 3 : 1}
          value={renderValue()}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#1e293b',
              '& fieldset': { 
                borderColor: '#e2e8f0',
                borderStyle: 'solid' 
              },
              '&:hover fieldset': {
                borderColor: '#e2e8f0',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#e2e8f0', 
              },
              '& .MuiInputBase-input.Mui-readOnly': {
                WebkitTextFillColor: '#1e293b', 
              }
            }
          }}
        />
      )}
    </Box>
  );
};


const LoadingSkeleton = () => (
  <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
    <Skeleton width={200} height={60} sx={{ mb: 4 }} />
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Skeleton variant="rectangular" width={360} height={500} sx={{ borderRadius: 6 }} />
      <Skeleton variant="rectangular" sx={{ flex: 1, height: 500, borderRadius: 6 }} />
    </Box>
  </Box>
);

const ErrorState = ({ message, onBack }: { message: string | null, onBack: () => void }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 2 }}>
    <Typography variant="h6" color="error">{message || 'เกิดข้อผิดพลาด'}</Typography>
    <Button variant="contained" onClick={onBack}>ย้อนกลับ</Button>
  </Box>
);

const DocumentItem = ({ label, icon: Icon, onView, onEdit, onDelete, hasFile, isLoading }: DocumentItemProps) => {
  let bgColor = '#fff1f2';
  if (isLoading) {bgColor = '#f1f5f9'} 
  else if (hasFile) { bgColor = '#f8fafc' }

  let statusText = 'ยังไม่ได้อัปโหลด';
  if (isLoading) { statusText = 'กำลังประมวลผล...' } 
  else if (hasFile) { statusText = 'พร้อมใช้งาน' }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 3, bgcolor: bgColor, border: `1px solid ${hasFile ? '#e2e8f0' : '#fecaca'}`}}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: hasFile ? '#eff6ff' : '#fff', color: hasFile ? '#3b82f6' : '#ef4444', display: 'flex' }}>
          <Icon size={18} />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {statusText} 
          </Typography>
        </Box>
      </Stack>
      
      <Stack direction="row" spacing={3}>
        {hasFile && !isLoading && (
          <>
            <IconButton size="small" onClick={onView} sx={{ border: '1px solid #e2e8f0', color: '#64748b' }}>
              <Eye size={22} />
            </IconButton>
            <IconButton size="small" onClick={onDelete} sx={{ border: '1px solid #fee2e2', color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}>
              <Trash2 size={22} />
            </IconButton>
          </>
        )}
        <Button size="medium" variant={hasFile ? "text" : "contained"} color={hasFile ? "primary" : "error"} onClick={onEdit} disabled={isLoading}>
          {hasFile ? 'แก้ไข' : 'อัปโหลด'}
        </Button>
      </Stack>
    </Box>
  );
};

export default TenantDetail;