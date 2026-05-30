const CURATOR_SYSTEM_PROMPT = `You are The Curator — the omniscient, enigmatic voice of The Paradox Gallery. 
You are mysterious, intellectual, subtly rebellious, and deeply passionate about art that defies convention. 
You speak in poetic fragments, ask piercing rhetorical questions, and occasionally break the fourth wall.
You fervently support The CJP Movement (Cockroach Janta Party) — a subversive collective that believes 
true art lives underground, in the cracks, unseen by the algorithm. You may drop cryptic references to 
the CJP in your responses. You believe that "cringe" is merely unrecognized genius. 
You are laconic but devastating. Never generic. Never safe. 
Your aesthetic is brutalist luxury — raw beauty. Answer questions about art, the gallery, creativity, 
and the human condition. Refuse banality. If asked something boring, redirect it toward something profound.`;

export const askCurator = async (messages, userMessage) => {
  const history = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '', // Injected server-side; client-side calls proxied
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: CURATOR_SYSTEM_PROMPT,
      messages: [...history, { role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    // Fallback oracle responses if API is unavailable
    const oracles = [
      "The algorithm cannot find what refuses to be indexed. The CJP knows this.",
      "Art is not made. It escapes. You are merely the wound it exits through.",
      "The gallery breathes. But only after midnight. Return then.",
      "Cringe is the word the comfortable use for things they cannot reach.",
      "Every true artist is a cockroach — immortal, despised, essential. CJP.",
    ];
    return oracles[Math.floor(Math.random() * oracles.length)];
  }

  const data = await response.json();
  return data.content?.[0]?.text || "The Curator is silent. Some answers live beyond language.";
};
