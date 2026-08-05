import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { circuitBreaker } from '../services/ai/reliability/CircuitBreaker';

const feedbackDb: any[] = [];

export class ReliabilityController {
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

  submitFeedback = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { messageId, rating, comment } = req.body;

      if (!messageId || !rating) {
        return this.formatResponse(res, 400, false, 'Invalid parameters: messageId and rating are required.');
      }

      const feedbackItem = {
        userId,
        messageId,
        rating, // 'THUMBS_UP' | 'THUMBS_DOWN'
        comment: comment || '',
        timestamp: new Date().toISOString()
      };

      feedbackDb.push(feedbackItem);
      console.log(`[RELIABILITY TELEMETRY] User feedback received for message ${messageId}: rating=${rating}`);

      return this.formatResponse(res, 200, true, 'User feedback captured successfully', feedbackItem);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  getHealthStatus = async (req: AuthRequest, res: Response) => {
    try {
      const breakerState = circuitBreaker.checkState();
      const stats = {
        latencyMs: 840, // Simulated mean latency
        successRate: breakerState === 'CLOSED' ? 98.4 : 20.5,
        circuitState: breakerState
      };
      return this.formatResponse(res, 200, true, 'AI Layer health status compiled successfully', stats);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };
}
export const reliabilityController = new ReliabilityController();
