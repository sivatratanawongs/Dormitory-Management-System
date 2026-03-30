import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { Request, Response } from 'express';
import { TenantService } from '../services/tenantService.js';


export const createContract = async (req: Request, res: Response) => {
  try {
    const tenantData = req.body;
    const result = await TenantService.createContractTransaction(tenantData);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "ไม่สามารถบันทึกสัญญาได้: " + error.message
    });
  }
};

export const getAllActiveTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await TenantService.findAllActive();
    res.status(200).json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงรายชื่อผู้เช่าได้: " + error.message
    });
  }
};

export const getTenantDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false, 
      });
    }
    const tenant = await TenantService.findById(id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูลผู้เช่าได้: " + error.message
    });
  }
};

export const updateTenant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
      });
    }

    const updatedTenant = await TenantService.update(id, updateData);

    if (!updatedTenant) {
      return res.status(404).json({
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTenant
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
    });
  }
};
const storage = multer.diskStorage({
  destination: 'uploads/', 
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });

export const uploadTenantFile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; 
        if (!id) {
      return res.status(400).json({ success: false, message: 'ID ไม่ถูกต้อง' });
    }

    const { fileType } = req.body; 
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: 'ไม่พบไฟล์' });
    const fileUrl = `/uploads/${file.filename}`;
      const updateData = fileType === 'idCard' 
      ? { idCardUrl: fileUrl } 
      : { contractFileUrl: fileUrl };

    const updated = await TenantService.update(id, updateData);

    res.status(200).json({
      success: true,
      data: updated,
      fileUrl: fileUrl
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTenantFile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID ไม่ถูกต้อง' });
    }

    const { fileType } = req.body; 
    const tenant = await TenantService.findById(id);
    if (!tenant) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้เช่า' });
    const fileUrl = fileType === 'idCard' ? tenant.idCardUrl : tenant.contractFileUrl;

    if (fileUrl) {
      const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
      const filePath = path.join(process.cwd(), relativePath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const updateData = fileType === 'idCard' 
      ? { idCardUrl: null } 
      : { contractFileUrl: null };

    await TenantService.update(id, updateData);

    res.status(200).json({ success: true, message: 'ลบไฟล์เรียบร้อยแล้ว' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const moveOutTenant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; 
    const { roomId } = req.body;

    if (!id || !roomId) {
      return res.status(400).json({ 
        success: false, 
      });
    }
    const result = await TenantService.handleMoveOut(id, roomId);

    res.status(200).json({
      success: true,
      message: "ดำเนินการย้ายออกเรียบร้อยแล้ว",
      data: result
    });
  } catch (error: any) {
    console.error('Move Out Error:', error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดำเนินการย้ายออกได้: " + error.message
    });
  }
};
