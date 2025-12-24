// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

import { EventCategory } from './has-been-enough-time';

export const emojiSelector: Record<EventCategory, string> = {
	SUCCESS: '🟩',
	WARNING: '🟨',
	ERROR: '🟥',
	TERMINATED: '💀',
	REDIS_DISCONNECTED: '💀',
	MONGO_DISCONNECTED: '💀',
	API_FAILURE: '💀',
};
