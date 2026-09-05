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
      const { message, conversationId, lang, income } = req.query;
      const userId = req.user?.id || 'demo-user-id';
      const overrideIncome = income ? Number(income) : undefined;
      const cId = String(conversationId || 'thread-1');
      const userMessageText = String(message || '');

      // Maintain in-memory conversation thread history
      if (!conversationsDb[userId]) conversationsDb[userId] = [];
      let conv = conversationsDb[userId].find(c => c.id === cId);
      if (!conv) {
        conv = {
          id: cId,
          title: userMessageText.slice(0, 30) || 'New Conversation',
          isPinned: false,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        conversationsDb[userId].unshift(conv);
      }

      // Record User Message
      conv.messages.push({
        id: `msg-${Date.now()}`,
        sender: 'USER',
        content: userMessageText,
        timestamp: new Date().toISOString()
      });

      // Stage 1: Thinking phase
      sendEvent('THINKING', 'Sarthi AI is processing your request with Kimi AI (NVIDIA)...');

      // Call AI Orchestrator with real PostgreSQL / Firestore context data
      const result = await aiOrchestrator.processRequest(
        userId,
        userMessageText,
        '',
        String(lang || 'English'),
        overrideIncome
      );

      // Record AI Message in history
      conv.messages.push({
        id: `msg-${Date.now() + 1}`,
        sender: 'AI',
        content: result.text,
        timestamp: new Date().toISOString(),
        widgetData: result.widgetData
      });
      conv.updatedAt = new Date().toISOString();
      if (conv.messages.length === 2 && userMessageText) {
        conv.title = userMessageText.slice(0, 30);
      }

      // Stage 2: Concluding response with NVIDIA Kimi generated content
      sendEvent('DONE', result.text, result.widgetData);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ status: 'DONE', text: `Error streaming: ${err.message}` })}\n\n`);
      res.end();
    }
  };
}
