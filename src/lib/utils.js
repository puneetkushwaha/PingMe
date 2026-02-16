export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatLastSeen(date) {
  if (!date) return "recently";
  const now = new Date();
  const lastSeenDate = new Date(date);
  const diffInMs = now - lastSeenDate;

  // If less than a minute, say just now
  if (diffInMs < 60000) return "just now";

  const timeStr = lastSeenDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const isToday = now.toDateString() === lastSeenDate.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.toDateString() === lastSeenDate.toDateString();

  if (isToday) {
    return `today at ${timeStr}`;
  } else if (isYesterday) {
    return `yesterday at ${timeStr}`;
  } else {
    const dateStr = lastSeenDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    return `on ${dateStr} at ${timeStr}`;
  }
}
