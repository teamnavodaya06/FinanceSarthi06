export class ResponseValidator {
  validateResponse(responseText: string): void {
    if (!responseText || !responseText.trim()) {
      throw new Error('AI Provider failure: Malformed response is empty.');
    }
    // Block responses containing obvious systemic crash keywords
    if (responseText.includes('INTERNAL_SERVER_ERROR') || responseText.includes('500 INTERNAL')) {
      throw new Error('AI Provider failure: Systemic failure keyword detected in output.');
    }
  }
}
export const responseValidator = new ResponseValidator();
