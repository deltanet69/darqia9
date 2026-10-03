export interface ChatbotSuggestion {
  id: string
  label: string
  topic: string
  order: number
  isActive: boolean
}

export interface ChatbotKnowledgeItem {
  id: string
  key: string
  query: string
  keywords: string[]
  text: string
  btnText?: string
  btnLink?: string
  isConfidential?: boolean
  isActive: boolean
}

export interface ChatbotSettings {
  botName: string
  botRole: string
  welcomeMessage: string
  welcomeActionText: string
  welcomeActionLink: string
  fallbackMessage: string
  confidentialKeywords: string[]
  confidentialMessage: string
}

export interface ChatMessage {
  type: 'bot' | 'user'
  text?: string
  html?: string
  btnText?: string
  btnLink?: string
}
