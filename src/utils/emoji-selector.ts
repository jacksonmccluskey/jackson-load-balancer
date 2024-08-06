// Copyright © 2024 Jackson McCluskey
// GitHub @jacksonmccluskey [https://github.com/jacksonmccluskey]

export type Event =
	| 'PROCESSING'
	| 'SUCCESS'
	| 'WARNING'
	| 'ERROR'
	| 'TERMINATED'
	| 'INBOUND'
	| 'OUTBOUND';

export const emojiSelector = {
	PROCESSING: '🚀',
	SUCCESS: '🟩',
	WARNING: '🟨',
	ERROR: '🟥',
	TERMINATED: '💀',
	INBOUND: '🔗',
	OUTBOUND: '🛰️',
};
