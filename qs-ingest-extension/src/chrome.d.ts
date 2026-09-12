declare const chrome: {
  runtime: { onMessage: { addListener(listener: (message: unknown, sender: unknown, sendResponse: (value: unknown) => void) => boolean): void } }
  tabs: { query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Array<{ id?: number; url?: string }>>; sendMessage(tabId: number, message: unknown): Promise<unknown> }
  storage: { local: { get(keys: string[]): Promise<Record<string, unknown>>; set(items: Record<string, unknown>): Promise<void> } }
}
