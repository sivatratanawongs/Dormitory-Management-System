import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, InputAdornment, IconButton, Breadcrumbs, Link, Button, CircularProgress, Divider } from '@mui/material';
import { ArrowLeft, BookUser, FileText, CheckCircle, Wallet } from 'lucide-react';
import { ThaiBaht } from 'thai-baht-text-ts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import { format } from "date-fns";

// Local imports
import { BillingFrontendService } from '../../../../services/billingService';
import type { ContractTemplateProps, ICreateContractRequest } from '../../../../type/tenant';
import { TenantFrontendService } from '../../../../services/tenantService';

  const ContractTemplate = ({ data, roomNumber, price,floor }: ContractTemplateProps) => {

    const formatThaiDate = (dateString: string | null | undefined) => {
    if (!dateString) return '................................................';
    
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    return `${day} ${month} พ.ศ.${year}`;
  };
  
    const depositValue = data.deposit ?? 0;
    const display = (value: string | number | null | undefined) => value || '................................................';

    return (
      <Box className="print-section" 
        sx={{ 
          display: 'none', 
            '@media print': {
              '.no-print': { display: 'none !important' },
              'header, nav, button, .MuiBreadcrumbs-root': { display: 'none !important' },
                '& .MuiPaper-root': {
              boxShadow: 'none !important',
              border: 'none !important',
            },
            '@page': {
              size: 'A4',
              margin: '2cm', 
            },
            position: 'relative',
            width: '100%',
            color: '#000',
            fontSize: '16px', 
            fontFamily: "'Sarabun', sans-serif",
            lineHeight: 1.2,
            
            '& p': { 
              mb: 1, 
              textAlign: 'justify',
              orphans: 3, 
              widows: 3 
            }
            
          } 
        }}
      >
    {/* --- หน้าที่ 1 --- */}
    <Box sx={{ pageBreakAfter: 'always' }}>
      <Typography variant="h6" align="center" sx={{ mb: 1, fontSize: '20px' }}>
        สัญญาเช่าห้องพักอาศัย
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end', 
        mb: 2 
      }}>
        <Typography sx={{ fontSize: '16px' }}>ทำขึ้นที่ บ้านจตุพร</Typography>
        <Typography sx={{ fontSize: '16px' }}>วันที่ {formatThaiDate(data.contractDate)}</Typography>
      </Box>

      <Typography sx={{textIndent: '40px' }}>
        สัญญาฉบับนี้ทำขึ้น ระหว่าง นายมานิตย์ รัตนวงศ์ อยู่บ้านเลขที่ 246/3 หมู่ที่ 1 ตำบล/แขวง บ้านเลื่อม อำเภอ/เขต เมืองอุดรธานี จังหวัด อุดรธานี ซึ่งต่อไปในสัญญานี้จะเรียกว่า <strong>"ผู้ให้เช่า"</strong> ฝ่ายหนึ่ง กับ {display(data.name)} อยู่บ้านเลขที่ {display(data.address)} ซึ่งต่อไปในสัญญานี้จะเรียกว่า <strong>"ผู้เช่า"</strong> อีกฝ่ายหนึ่ง 
      </Typography>

      <Typography sx={{textIndent: '40px' }}>
        คู่สัญญาทั้งสองฝ่ายตกลงทำสัญญาเช่ากันโดยมีข้อความดังต่อไปนี้
      </Typography>

      <Typography sx={{textIndent: '40px' ,fontWeight: 700, mt: 1 }}>ข้อ 1 ทรัพย์ที่เช่า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ผู้เช่าตกลงเช่าและผู้ให้เช่าตกลงให้เช่าห้องพักอาศัยห้องเลขที่ {roomNumber} ชั้นที่ {floor} ชื่อ บ้านจตุพร ซึ่งตั้งอยู่บ้านเลขที่ 246/3 ตำบล/แขวง บ้านเลื่อม อำเภอ/เขต เมืองอุดรธานี จังหวัด อุดรธานี
      </Typography>

      <Typography sx={{ textIndent: '40px' ,fontWeight: 700, mt: 1 }}>ข้อ 2 วัตถุประสงค์ของการเช่า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ผู้เช่าตกลงเช่าทรัพย์ตามข้อ 1 เพื่อวัตถุประสงค์ในการพักอาศัยเท่านั้น
      </Typography>

      <Typography sx={{ textIndent: '40px' ,fontWeight: 700, mt: 1 }}>ข้อ 3 อัตราค่าเช่าและระยะเวลาการเช่า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        คู่สัญญาตกลงเช่าทรัพย์ตามข้อ 1 นับตั้งแต่วันที่ {formatThaiDate(data.moveInDate)} ถึงวันที่ {formatThaiDate(data.contractEndDate)} เป็นระยะเวลา
        {display(data.contractTerm)} โดยจะชำระค่าเช่าล่วงหน้าเป็นรายเดือน ในอัตราค่าเช่าเดือนละ {price.toLocaleString()} บาท ({ThaiBaht(price)})
        ค่าเช่านี้ไม่รวมถึงค่าไฟฟ้า ค่าน้ำประปา โดยค่าเช่าเดือนแรก ผู้เช่าได้ชำระให้แก่ผู้ให้เช่าในวันทำสัญญานี้ ซึ่งผู้ให้เช่าได้รับเงินดังกล่าวไว้เรียบร้อยแล้ว 
        สำหรับค่าเช่าในเดือนต่อๆ ไป ผู้เช่าตกลงชำระให้แก่ผู้ให้เช่าภายในวันที่ 5 ของทุกเดือน ณ บ้านจตุพร
      </Typography>

      <Typography sx={{ textIndent: '40px' ,fontWeight: 700, mt: 1 }}>ข้อ 4 เงินประกันการเช่า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ในวันทำสัญญานี้ ผู้เช่าได้วางเงินประกันจำนวน {depositValue.toLocaleString()} บาท ({ThaiBaht(depositValue)}) ให้แก่ผู้ให้เช่า
        เงินประกันดังกล่าวมื่อสัญญาสิ้นสุดลงไม่ว่ากรณีใดๆ หากผู้เช่าไม่ได้ติดค้างชำระค่าเช่า หรือก่อความเสียหายใดๆ ให้แก่ผู้ให้เช่า 
        ผู้ให้เช่าคืนเงินจำนวนดังกล่าวให้แก่ผู้เช่า แต่หากผู้เช่ายังค้างชำระค่าเช่าหรือก่อความเสียหายใดๆ ให้แก่ผู้ให้เช่า ผู้เช่ายินยอมให้ผู้ให้เช่านำค่าเช่าที่ค้างชำระหรือค่าเสียหายมาหักจากเงินประกัน
        ดังกล่าวได้ และหากเงินดังกล่าวไม่พอ ผู้เช่ายังจะต้องรับผิดชดใช้แก่ผู้ให้เช่าคนครบ
      </Typography>

      <Typography sx={{ textIndent: '40px' ,fontWeight: 700, mt: 1 }}>ข้อ 5 ระเบียบหอพัก</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ผู้เช่าจะต้องปฏิบัติตามระเบียบหอพักที่ผู้ให้เช่าได้กำหนดไว้ หรือจะได้กำหนดไว้เป็นคราวๆ เพื่อความเรียบร้อยและปลอดภัยของผู้เช่าทุกคน
        และให้ถือว่าระเบียบดังกล่าวเป็นส่วนหนึ่งของสัญญาเช่านี้ด้วย
      </Typography>

      <Typography sx={{ textIndent: '40px' ,fontWeight: 700, mt: 1 }}>ข้อ 6 ค่าน้ำประปา ค่ากระแสไฟฟ้า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ผู้เช่าจะต้องชำระค่าน้ำประปาและค่ากระแสไฟฟ้า ให้แก่ผู้ให้เช่าตามจำนวนที่ใช้ในแต่ละเดือนตามมาตรวัดที่ได้ติดตั้งไว้หน้าห้องของผู้เช่า
        โดยมีอัตราดังนี้ (๑) ค่าไฟฟ้าหน่วยละ 8 บาท 
                    (๒) ค่าน้ำประปาเหมาจ่าย 100.- บาท ต่อเดือน (จำกัด 4 หน่วยแรก) หากใช้เกินคิดหน่วยละ 25 บาท
      </Typography>
      <Typography sx={{textIndent: '40px' }}>
        ค่าน้ำประปาและค่ากระแสไฟฟ้านี้ ผู้ให้เช่าจะแจ้งให้ผู้เช่าทราบภายในวันที่ 30 ของทุกเดือน และให้ผู้เช่าชำระเงินดังกล่าวพร้อมกับชำระเงินค่าเช่าล่วงหน้าในแต่ละเดือน อนึ่งอัตราค่าน้ำประปาและค่ากระแสไฟฟ้านี้อาจขึ้นลงได้ตามส่วน การขึ้นลงขึ้นลงของอัตราค่าน้ำประปาของการประปาส่วนภูมิภาค และค่ากระแสไฟฟ้าของการไฟฟ้าส่วนภูมิภาค
      </Typography>
      <Typography sx={{textIndent: '40px', fontWeight: 700 }}>ข้อ 7 การพักอาศัย</Typography>
      <Typography sx={{textIndent: '40px' }}>
        การเช่าห้องพักตามข้อ 1 ก็เพื่อวัตถุประสงค์เฉพาะให้ผู้เช่าพักอาศัยเท่านั้น ผู้เช่าจะนำบุคคลอื่นเข้ามาพักอาศัยไม่ได้ เว้นแต่จะได้รับความยินยอมจากผู้ดูแลหอพักก่อน
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 8 การทำครัว ปรุงอาหาร</Typography>
      <Typography sx={{textIndent: '40px' }}>ห้ามมิให้ผู้เช่าทำครัว หรือปรุงอาหารในห้องพัก</Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 9 สิ่งอำนวยความสะดวกในหอพัก</Typography>
      <Typography sx={{textIndent: '40px' }}>
        สิ่งอำนวยความสะดวกต่างๆ ในหอพัก เช่น เครื่องปรับอากาศ พัดลม เครื่องทำน้ำอุ่น เคเบิ้ลทีวี ไมโครเวฟ  ฯลฯ ซึ่งผู้ให้เช่าจัดบริการไว้ให้ผู้เช่าจะต้องใช้ด้วยความระมัดระวังเยี่ยงวิญญูชน จะพึงใช้ทรัพย์ของตน หากผู้เช่าทำให้ทรัพย์สินเสียหายไม่ว่าจะโดยจงใจหรือประมาทเลินเล่อก็ตาม ผู้เช่าจะต้องรับผิดในความเสียหายนั้นจนเต็มจำนวน
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 10 การปฏิบัติตัวของผู้เช่า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ผู้เช่าต้องปฏิบัติตนให้อยู่ในฐานะผู้เช่าที่ดี หากผู้เช่าได้กระทำการใด ๆ อันก่อให้เกิดความเสียหายต่อผู้เช่าคนอื่น หรือต่อผู้ให้เช่า หรือในกรณีที่ผู้เช่าคนอื่นหรือผู้ให้เช่าไม่สามารถอยู่ร่วมกับผู้เช่าได้โดยปกติสุข ผู้ให้เช่ามีสิทธิบอกเลิกสัญญาเช่าได้ทันที และผู้เช่าต้องชำระค่าเสียหายที่เกิดขึ้นทั้งหมด โดยสละสิทธิเรียกร้องใด ๆ จากผู้ให้เช่า
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 11 การละทิ้งห้องพัก</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ในกรณีที่ผู้เช่าจะไม่อยู่ห้องพักเป็นเวลาเกินกว่า 7 วัน ผู้เช่าต้องมีหนังสือแจ้งให้ผู้ดูแลหอพักทราบล่วงหน้าไม่น้อยกว่า 7 วัน
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 12 การตรวจตราทรัพย์ที่เช่า</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ผู้เช่ายินยอมให้ผู้ให้เช่า หรือตัวแทนของผู้ให้เช่าตรวจตราห้องพักได้ตลอดเวลา
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 13 การเลิกสัญญาก่อนครบกำหนด</Typography>
      <Typography sx={{textIndent: '40px' }}>
        <strong>ในกรณีที่ผู้เช่าประสงค์จะเลิกสัญญาเช่าก่อนครบกำหนดระยะเวลาการเช่าตามข้อ 3 ผู้เช่าจะต้องมีคำบอกกล่าวเป็นหนังสือหรือแจ้งด้วยวาจาไปยังผู้ให้เช่าทราบไม่น้อยกว่า 1 เดือน</strong> และผู้เช่าตกลงที่จะจ่ายค่าตอบแทนให้แก่ผู้ให้เช่าเป็นจำนวนเงิน 2,000.- บาท (สองพันบาทถ้วน) เพื่อเป็นค่าตอบแทนในการที่ผู้ให้เช่าเลิกสัญญาก่อนครบกำหนด
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700 }}>ข้อ 14 การผิดสัญญา</Typography>
      <Typography sx={{textIndent: '40px' }}>
        ในกรณีที่ผู้เช่าผิดสัญญาเช่าไม่ว่าข้อหนึ่งข้อใดหรือหลายข้อรวมกัน ผู้ให้เช่ามีสิทธิที่จะบอกกล่าวให้ผู้เช่าปฏิบัติให้ถูกต้องตามสัญญา หรือเรียกค่าเสียหาย หรือเลิกสัญญาโดยให้สัญญาสิ้นสุดลงโดยมิต้องบอกกล่าวก่อน หรือจะใช้สิทธิดังกล่าวร่วมกันก็ได้
      </Typography>

      <Typography sx={{ textIndent: '40px',fontWeight: 700, mt: 1 }}>ข้อ 15 กรณีเลิกสัญญา</Typography>
      <Typography sx={{textIndent: '40px' }}>
        เมื่อสัญญาสิ้นสุดลงไม่ว่าจะด้วยเหตุครบกำหนดระยะเวลาการเช่า หรือด้วยเหตุประการหนึ่งประการใดก็ตาม ผู้เช่ายินยอมให้ผู้ให้เช่ามีสิทธิที่จะกลับเข้าครอบครองทรัพย์ที่เช่าได้ทันที และขนย้ายทรัพย์สินของผู้เช่าออกจากทรัพย์ที่เช่า โดยผู้เช่าจะต้องเป็นผู้ออกค่าใช้จ่ายในการขนย้ายทรัพย์สินและเก็บรักษาทรัพย์สินนั้น
      </Typography>

      <Typography sx={{ textIndent: '50px', mt: 3, mb: 4 }}>
        สัญญานี้ทำขึ้นเป็น 2 ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความในสัญญานี้โดยตลอดแล้ว เห็นว่าถูกต้อง จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ mb: 4 }}>ลงชื่อ...........................................ผู้เช่า</Typography>
          <Typography>( {display(data.name)} )</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ mb: 4 }}>ลงชื่อ...........................................ผู้ให้เช่า</Typography>
          <Typography>( นายมานิตย์ รัตนวงศ์ )</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography sx={{ mb: 4 }}>ลงชื่อ...........................................พยาน</Typography>
          <Typography>(...........................................)</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography sx={{ mb: 4 }}>ลงชื่อ...........................................พยาน</Typography>
          <Typography>(...........................................)</Typography>
        </Box>
      </Box>
    </Box>
    </Box>

    );
  };

const ContractPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomNumber, roomId, price, floor } = location.state || { roomNumber: '-', roomId: '', price: 0, floor: '-' };
  const [loading, setLoading] = useState(false);
  const [fetchingMeter, setFetchingMeter] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    idCard: '',
    phone: '',
    lineId: '',
    address: '',
    emergencyName: '', 
    emergencyPhone: '',
    contractDate: new Date().toISOString().split('T')[0],
    moveInDate: new Date().toISOString().split('T')[0],
    contractEndDate: '',
    contractTerm: 6 as number | null,
    deposit: 5000 as number | null,
    startElec: 0 as number | null,
    startWater: 0 as number | null,
    otherNotes: ''
  });
  const depositValue = Number(formData.deposit) || 0;
  const totalInitialPayment = depositValue + price;

  const formatInputDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const yearBE = date.getFullYear() + 543;
    return `${format(date, 'd MMMM', { locale: th })} ${yearBE}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: ICreateContractRequest = {
        roomId: roomId,
        tenantName: formData.name,
        nickname: formData.nickname || null,
        idCard: formData.idCard || null,
        phone: formData.phone,
        lineId: formData.lineId || null,
        address: formData.address || null,
        contractDate: formData.contractDate,
        moveInDate: formData.moveInDate,
        emergencyName: formData.emergencyName || null,
        emergencyPhone: formData.emergencyPhone || null,
        contractTerm: formData.contractTerm,
        deposit: formData.deposit,
        otherNotes: formData.otherNotes || null,
      };
      
      const response = await TenantFrontendService.createContract(payload);

      if (response.success) {
        try {
          await BillingFrontendService.updateMeterReading({
            roomId: roomId,
            elecReading: formData.startElec || 0,
            waterReading: formData.startWater || 0,
            readingDate: formData.moveInDate,
            isInitial: true 
          });
        } catch (meterErr) {
          console.error(meterErr);
        }

        navigate('/owner/tenants');
      }
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.moveInDate && formData.contractTerm) {
      const date = new Date(formData.moveInDate);
      date.setMonth(date.getMonth() + Number(formData.contractTerm));
      setFormData(prev => ({ ...prev, contractEndDate: date.toISOString().split('T')[0] }));
    }
  }, [formData.moveInDate, formData.contractTerm]);

  useEffect(() => {
    const fetchLastReading = async () => {
      if (!roomId) return;
      try {
        setFetchingMeter(true);
        const meterData = await BillingFrontendService.getLastReadings();
        const roomReading = meterData.find(item => item.roomId === roomId);
        
        if (roomReading) {
          setFormData(prev => ({
            ...prev,
            startElec: roomReading.lastElec,
            startWater: roomReading.lastWater,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingMeter(false);
      }
    };
    fetchLastReading();
  }, [roomId]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box className="no-print" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box>
          <Breadcrumbs sx={{ fontSize: '0.75rem', mb: 0.5 }}>
            <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tenants')}>จัดการผู้เช่า</Link>
            <Typography color="text.primary" sx={{ fontSize: '0.75rem' }}>สัญญาเช่าใหม่</Typography>
          </Breadcrumbs>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>ทำสัญญาเช่าห้อง {roomNumber}</Typography>
        </Box>
      </Box>

      <Box className="no-print" sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>

          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BookUser size={20} color="#6366f1" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>ข้อมูลผู้เช่า</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField fullWidth label="ชื่อ-นามสกุล" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <TextField fullWidth label="ชื่อเล่น" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
              </Box>
                <TextField 
                  fullWidth 
                  label="เลขบัตรประชาชน" 
                  value={formData.idCard} 
                  onChange={(e) => {
                    const { value } = e.target;
                    const numericValue = value.replaceAll(/\D/g, '').slice(0, 13);
                    
                    setFormData({...formData, idCard: numericValue });
                  }}
                  slotProps={{
                    htmlInput: {
                      maxLength: 13,
                      inputMode: 'numeric'
                    }
                  }}
                />
              <TextField fullWidth multiline rows={2} label="ที่อยู่ตามทะเบียนบ้าน" placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField fullWidth label="เบอร์โทรศัพท์" value={formData.phone} 
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value.replaceAll(/\D/g, '').slice(0, 10);    
                    setFormData({
                      ...formData, 
                      phone: numericValue
                    });
                  }}
                  slotProps={{ htmlInput: { maxLength: 10,inputMode: 'numeric' } }}
                /> 
              <TextField fullWidth label="ID Line" value={formData.lineId} onChange={(e) => setFormData({...formData, lineId: e.target.value})} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField fullWidth label="ชื่อผู้ติดต่อฉุกเฉิน" value={formData.emergencyName} onChange={(e) => setFormData({...formData, emergencyName: e.target.value})} />
                <TextField 
                  fullWidth 
                  label="เบอร์โทรศัพท์ฉุกเฉิน" 
                  value={formData.emergencyPhone} 
                  onChange={(e) => {
                    const { value } = e.target;
                    const numericValue = value.replaceAll(/\D/g, '').slice(0, 10);
                    
                    setFormData({ ...formData, emergencyPhone: numericValue });
                  }}
                  slotProps={{
                    htmlInput: {
                      maxLength: 10,
                      inputMode: 'numeric'
                    }
                  }}
                />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <FileText size={20} color="#6366f1" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>เงื่อนไขสัญญาเช่า</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>วันที่ทำสัญญา</Typography>
                  <DatePicker
                    selected={new Date(formData.contractDate)}
                    onChange={(date: Date | null) => {
                      if (date) setFormData({...formData, contractDate: date.toISOString().split('T')[0]});
                    }}
                    locale={th}
                    value={formatInputDate(formData.contractDate)}
                    customInput={
                      <TextField fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>วันที่เริ่มเข้าพัก</Typography>
                  <DatePicker
                    selected={new Date(formData.moveInDate)}
                    onChange={(date: Date | null) => {
                      if (date) setFormData({...formData, moveInDate: date.toISOString().split('T')[0]});
                    }}
                    locale={th}
                    value={formatInputDate(formData.moveInDate)}
                    customInput={
                      <TextField fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>วันที่สิ้นสุดสัญญา</Typography>
                  <DatePicker
                    selected={formData.contractEndDate ? new Date(formData.contractEndDate) : null}
                    onChange={(date: Date | null) => {
                      if (date) setFormData({...formData, contractEndDate: date.toISOString().split('T')[0]});
                    }}
                    locale={th}
                    value={formatInputDate(formData.contractEndDate)}
                    customInput={
                      <TextField fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    }
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField fullWidth type="number" label="ระยะเวลาเช่า (เดือน)" value={formData.contractTerm || ''} 
                  onChange={(e) => setFormData({...formData, contractTerm: e.target.value === '' ? null : Number(e.target.value)})} 
                />
                <TextField fullWidth disabled label="ค่าเช่าต่อเดือน" value={price.toLocaleString()} slotProps={{ input: { startAdornment: ( <InputAdornment position="start">฿</InputAdornment>)}}} />
                <TextField fullWidth type="number" label="เงินมัดจำ/ประกัน (บาท)" value={formData.deposit || ''}
                  onChange={(e) => setFormData({ ...formData, deposit: e.target.value === '' ? null : Number(e.target.value) })} 
                  slotProps={{ input: { startAdornment: ( <InputAdornment position="start">฿</InputAdornment>)}}}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField 
                  fullWidth 
                  label="ค่าไฟฟ้าเริ่มต้น (หน่วย)" 
                  value={formData.startElec ?? ''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData, 
                      startElec: val === '' ? null : Number(val)
                    });
                  }}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }} 
                />

                <TextField 
                  fullWidth 
                  label="ค่าน้ำเริ่มต้น (หน่วย)" 
                  value={formData.startWater ?? ''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData, 
                      startWater: val === '' ? null : Number(val)
                    });
                  }}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
              </Box>
              <TextField fullWidth multiline rows={3} label="เงื่อนไขเพิ่มเติม" placeholder="เช่น กฎระเบียบหอพักบ้านจตุพร" value={formData.otherNotes} onChange={(e) => setFormData({...formData, otherNotes: e.target.value})} />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: '350px' }, position: { lg: 'sticky' }, top: 24 }}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Wallet size={20} color="#059669" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>ยอดชำระแรกเข้า</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">เงินมัดจำ/ประกัน</Typography>
                <Typography sx={{ fontWeight: '600' }}> ฿{depositValue.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">ค่าเช่าล่วงหน้า (1 เดือน)</Typography>
                <Typography sx={{ fontWeight: '600' }}> ฿{price.toLocaleString()}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>รวมทั้งสิ้น</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>฿{totalInitialPayment.toLocaleString()}</Typography>
              </Box>
            </Box>
            <Button 
              fullWidth variant="contained" size="large"
              disabled={loading || fetchingMeter}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle size={20} />}
              sx={{ mt: 4, py: 1.5, borderRadius: 3, bgcolor: '#1e293b', fontWeight: 'bold', '&:hover': { bgcolor: '#334155' } }}
            >
              {loading ? 'กำลังบันทึก...' : 'ยืนยันทำสัญญา'}
            </Button>
          </Paper>
        </Box>

      </Box>
      <Box className="print-section" sx={{ 
          display: 'none', 
          '@media print': { 
            display: 'block !important', 
            position: 'relative',
            width: '100%',
            backgroundColor: 'white',
          } 
        }}>
          
                <ContractTemplate 
                  data={formData} 
                  roomNumber={roomNumber} 
                  price={price} 
                  floor={floor}
                />
      </Box>
    </Box>
  );
};

export default ContractPage;