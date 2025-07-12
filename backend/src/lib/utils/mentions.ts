export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)];
}

export function replaceMentionsWithLinks(text: string): string {
  return text.replace(/@(\w+)/g, '[@$1](/users/$1)');
}