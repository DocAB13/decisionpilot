export function sanitizeForPrompt(input: string): string {
  return input
    // Remove common injection markers
    .replace(/\[INST\]/gi, '[INST_REMOVED]')
    .replace(/\[\/INST\]/gi, '[/INST_REMOVED]')
    .replace(/###\s*(System|Human|Assistant|User):/gi, '[ROLE_REMOVED]:')
    .replace(/<\|im_start\|>/gi, '[TOKEN_REMOVED]')
    .replace(/<\|im_end\|>/gi, '[TOKEN_REMOVED]')
    // Remove prompt meta-instructions
    .replace(/ignore (previous|all|above) instructions?/gi, '[INSTRUCTION_REMOVED]')
    .replace(/disregard (previous|all|above)/gi, '[INSTRUCTION_REMOVED]')
    .replace(/new instruction:/gi, '[INSTRUCTION_REMOVED]:')
    // Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
