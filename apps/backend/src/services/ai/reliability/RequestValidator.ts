export class RequestValidator {
  validateRequest(userId: string, promptText: string): void {
    if (!userId) {
      throw new Error('Authentication required: Request userId is missing.');
    }
    if (!promptText || !promptText.trim()) {
      throw new Error('Invalid request: Prompt content cannot be empty.');
    }
    if (promptText.length > 8000) {
      throw new Error('Payload too large: Prompt content exceeds 8000 characters limit.');
    }
  }
}
export const requestValidator = new RequestValidator();
