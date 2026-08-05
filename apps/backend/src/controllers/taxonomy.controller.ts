import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taxonomyService } from '../services/taxonomy.service';

export class TaxonomyController {
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

  getNodes = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const type = req.query.type as string | undefined;
      const nodes = await taxonomyService.getNodes(userId, type);
      return this.formatResponse(res, 200, true, 'Taxonomy nodes retrieved successfully', nodes);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getNodeById = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const node = await taxonomyService.getNodeById(id, userId);
      return this.formatResponse(res, 200, true, 'Taxonomy node retrieved successfully', node);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 404;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  createNode = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const node = await taxonomyService.createCustomNode(userId, req.body);
      return this.formatResponse(res, 201, true, 'Custom taxonomy node created successfully', node);
    } catch (err: any) {
      return this.formatResponse(res, 400, false, err.message, null, [err.message]);
    }
  };

  updateNode = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      const node = await taxonomyService.updateCustomNode(id, userId, req.body);
      return this.formatResponse(res, 200, true, 'Custom taxonomy node updated successfully', node);
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  deleteNode = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;
      await taxonomyService.deleteCustomNode(id, userId);
      return this.formatResponse(res, 200, true, 'Custom taxonomy node deleted successfully');
    } catch (err: any) {
      const statusCode = err.message.includes('Access denied') ? 403 : 400;
      return this.formatResponse(res, statusCode, false, err.message, null, [err.message]);
    }
  };

  classifyMerchant = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { merchantName } = req.params;
      const result = await taxonomyService.classifyMerchant(merchantName, userId);
      return this.formatResponse(res, 200, true, 'Merchant classified successfully', result);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
