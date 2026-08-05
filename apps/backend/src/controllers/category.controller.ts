import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { expenseCategoryService } from '../services/expense-category.service';

export class CategoryController {
  private formatResponse(res: Response, statusCode: number, success: boolean, message: string, data: any = null, errors: any[] = []) {
    const timestamp = new Date().toISOString();
    return res.status(statusCode).json({
      success,
      message,
      data,
      errors,
      timestamp,
    });
  }

  getCategories = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const categories = await expenseCategoryService.getAllCategories(userId);
      return this.formatResponse(res, 200, true, 'Categories retrieved successfully', categories);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getCategoryById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const category = await expenseCategoryService.getCategoryById(id, userId);
      return this.formatResponse(res, 200, true, 'Category retrieved successfully', category);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 404;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  createCategory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const category = await expenseCategoryService.createCustomCategory(userId, req.body);
      return this.formatResponse(res, 201, true, 'Custom category created successfully', category);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  updateCategory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const category = await expenseCategoryService.updateCustomCategory(id, userId, req.body);
      return this.formatResponse(res, 200, true, 'Custom category updated successfully', category);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  deleteCategory = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      await expenseCategoryService.deleteCustomCategory(id, userId);
      return this.formatResponse(res, 200, true, 'Custom category deleted successfully');
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  classifyMerchant = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { merchantName } = req.params;
      const result = await expenseCategoryService.suggestMerchantCategory(merchantName, userId);
      return this.formatResponse(res, 200, true, 'Merchant classified successfully', result);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
