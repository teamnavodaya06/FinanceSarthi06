import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config';
import { aiOrchestrator } from '../services/ai/AIOrchestrator';

// In-Memory fallback for chat threads database sync (since they are session-bound)
const conversationsDb: Record<string, any[]> = {};

export class CopilotController {
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

  getConversations = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      if (!conversationsDb[userId]) {
        conversationsDb[userId] = [
          {
            id: 'thread-1',
            title: 'Analyze my food spending',
            isPinned: true,
            messages: [
              { id: 'm1', sender: 'USER', content: 'Analyze my food spending', timestamp: new Date().toISOString() },
              { id: 'm2', sender: 'AI', content: 'You spent ₹8,400 on food last month. Try reducing Swiggy orders by 10% to save ₹840.', timestamp: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
      }
      return this.formatResponse(res, 200, true, 'Conversations list retrieved successfully', conversationsDb[userId]);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  createConversation = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { title } = req.body;

      const newConv = {
        id: `thread-${Math.floor(Math.random() * 100000)}`,
        title: title || 'New Conversation',
        isPinned: false,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!conversationsDb[userId]) conversationsDb[userId] = [];
      conversationsDb[userId].unshift(newConv);

      return this.formatResponse(res, 200, true, 'Conversation thread created successfully', newConv);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  deleteConversation = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;

      if (conversationsDb[userId]) {
        conversationsDb[userId] = conversationsDb[userId].filter(c => c.id !== id);
      }
      return this.formatResponse(res, 200, true, 'Conversation deleted successfully');
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  pinConversation = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id || 'demo-user-id';
      const { id } = req.params;

      if (conversationsDb[userId]) {
        const conv = conversationsDb[userId].find(c => c.id === id);
        if (conv) {
          conv.isPinned = !conv.isPinned;
        }
      }
      return this.formatResponse(res, 200, true, 'Conversation pinned status updated successfully', conversationsDb[userId]);
    } catch (err: any) {
      return this.formatResponse(res, 500, false, err.message, null, [err.message]);
    }
  };

  chatStream = async (req: AuthRequest, res: Response) => {
    // Set headers for Server-Sent Events (SSE) streaming responses
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (status: string, text: string, widgetData?: any) => {
      res.write(`data: ${JSON.stringify({ status, text, widgetData })}\n\n`);
    };

    try {
      const { message, conversationId, lang } = req.query;
      const userId = req.user?.id || 'demo-user-id';

      // Stage 1: Thinking phase
      sendEvent('THINKING', 'AI Sarthi is processing your financial request...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 2: Analyzing active data sources
      sendEvent('ANALYZING', 'Analyzing active database profiles, goals, and monthly transactions history...');
      
      // Call AI Orchestrator with real PostgreSQL / Firestore context data
      const result = await aiOrchestrator.processRequest(
        userId,
        String(message || ''),
        '',
        String(lang || 'English')
      );

      // Stage 3: Generating AI recommendation assets
      sendEvent('GENERATING', result.text, result.widgetData);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 4: Concluding response
      sendEvent('DONE', result.text, result.widgetData);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ status: 'DONE', text: `Error streaming: ${err.message}` })}\n\n`);
      res.end();
    }
  };
}
