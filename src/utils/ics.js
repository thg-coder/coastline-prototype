// Generate and download a minimal valid iCalendar (.ics) file.

function pad(n) {
  return String(n).padStart(2, '0');
}

// ICS uses UTC stamps. We build a floating local time TZID-less event by
// using the user's timezone-naive components — but per spec the safest cross-
// client approach is UTC. We convert from the appointment's ET local time to
// UTC by treating ET as fixed offset (-5 EST / -4 EDT). For prototype purposes
// we use the runtime offset of `Date` for the chosen instant.
function toUtcStamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcs(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function buildIcs({ start, durationMin, summary, description, location }) {
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const now = new Date();
  const uid = `coastline-${now.getTime()}-${Math.random().toString(36).slice(2, 10)}@coastline.local`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coastline//Booking Prototype//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(now)}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(filename, contents) {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke later so Safari has time to read.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
