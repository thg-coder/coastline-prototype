// Central mock data for the Coastline prototype.
// Edit here to tweak services, practitioners, or how availability is generated.

export const SPA_PHONE = '(555) 123-4567';
export const SPA_NAME_PLACEHOLDER = '[Med Spa Name]';
export const SPA_ADDRESS_PLACEHOLDER = '[Med Spa Address]';
export const TIMEZONE_LABEL = 'ET';

export const PRACTITIONERS = {
  chen: {
    id: 'chen',
    name: 'Dr. Sarah Chen, MD',
    credentials: 'Board-Certified Dermatologist',
    bio: '15+ years specializing in cosmetic dermatology. Known for natural, balanced results across injectables and laser work.',
    initials: 'SC',
    color: '#1F6E8C',
  },
  martinez: {
    id: 'martinez',
    name: 'Jessica Martinez, RN, BSN',
    credentials: 'Aesthetic Nurse Injector',
    bio: 'Trained in advanced injection technique. Focused on subtle, refresh-style results for first-time and seasoned patients.',
    initials: 'JM',
    color: '#5CA9C2',
  },
  reyes: {
    id: 'reyes',
    name: 'Amanda Reyes, LE',
    credentials: 'Licensed Aesthetician',
    bio: 'Skin-care specialist with deep expertise in resurfacing treatments and customized facial protocols.',
    initials: 'AR',
    color: '#134659',
  },
  park: {
    id: 'park',
    name: 'Dr. Michael Park, MD',
    credentials: 'Board-Certified Physician',
    bio: 'Wellness-forward practitioner focused on regenerative therapies, IV nutrition, and contouring.',
    initials: 'MP',
    color: '#3D8AA1',
  },
};

export const SERVICES = [
  {
    id: 'botox',
    name: 'Botox Consultation',
    description: 'Personalized plan for wrinkle softening and prevention with neuromodulators.',
    durationMin: 30,
    fee: 50,
    formats: ['virtual', 'in_person'],
    practitionerIds: ['chen', 'martinez'],
  },
  {
    id: 'filler',
    name: 'Dermal Filler Consultation',
    description: 'Discuss volume, contour, and lip enhancement goals with a licensed injector.',
    durationMin: 30,
    fee: 75,
    formats: ['in_person'],
    practitionerIds: ['chen', 'martinez'],
  },
  {
    id: 'microneedling',
    name: 'Microneedling Consultation',
    description: 'Skin texture, scarring, and tone evaluation for collagen-induction therapy.',
    durationMin: 30,
    fee: 50,
    formats: ['virtual', 'in_person'],
    practitionerIds: ['reyes'],
  },
  {
    id: 'laser_hair',
    name: 'Laser Hair Removal Consultation',
    description: 'Skin-type assessment and treatment planning for long-term hair reduction.',
    durationMin: 45,
    fee: 75,
    formats: ['in_person'],
    practitionerIds: ['chen', 'reyes'],
  },
  {
    id: 'chemical_peel',
    name: 'Chemical Peel Consultation',
    description: 'Tailored peel selection for tone, texture, and pigmentation concerns.',
    durationMin: 30,
    fee: 50,
    formats: ['virtual', 'in_person'],
    practitionerIds: ['reyes'],
  },
  {
    id: 'iv_therapy',
    name: 'IV Therapy Consultation',
    description: 'Wellness intake to design a hydration and micronutrient infusion plan.',
    durationMin: 20,
    fee: 40,
    formats: ['virtual', 'in_person'],
    practitionerIds: ['park'],
  },
  {
    id: 'prp',
    name: 'PRP / Hair Restoration Consultation',
    description: 'Scalp evaluation and platelet-rich plasma protocol planning for hair regrowth.',
    durationMin: 45,
    fee: 100,
    formats: ['in_person'],
    practitionerIds: ['chen', 'martinez', 'park'],
  },
  {
    id: 'body_contouring',
    name: 'Body Contouring Consultation',
    description: 'Non-invasive contouring options reviewed against your goals and timeline.',
    durationMin: 45,
    fee: 100,
    formats: ['in_person'],
    practitionerIds: ['chen', 'park'],
  },
];

export const SERVICE_CATEGORIES = [
  { id: 'injectables', label: 'Injectables', serviceIds: ['botox', 'filler'] },
  { id: 'skin', label: 'Skin Treatments', serviceIds: ['microneedling', 'chemical_peel'] },
  {
    id: 'hair_body',
    label: 'Hair & Body',
    serviceIds: ['laser_hair', 'prp', 'body_contouring'],
  },
  { id: 'wellness', label: 'Wellness', serviceIds: ['iv_therapy'] },
];

export function getCategoryForService(serviceId) {
  return SERVICE_CATEGORIES.find((c) => c.serviceIds.includes(serviceId)) || null;
}

export function getService(id) {
  return SERVICES.find((s) => s.id === id) || null;
}

export function getPractitioner(id) {
  return PRACTITIONERS[id] || null;
}

export function getPractitionersForService(serviceId) {
  const svc = getService(serviceId);
  if (!svc) return [];
  return svc.practitionerIds.map((id) => PRACTITIONERS[id]).filter(Boolean);
}

// ---- Availability generation ----------------------------------------------
// Deterministic per session: generated once on widget mount, then stable.
//
// Schedule per practitioner:
//   - Working days vary so practitioners look distinct.
//   - Each working day has a base set of slot start times.
//   - A deterministic pseudo-random gap pattern removes "already-booked" slots.
//
// We pre-generate the next 4 months of availability so the user can move
// the calendar forward and always find something.

const PRACTITIONER_SCHEDULES = {
  chen: {
    // Tue–Sat
    workingWeekdays: [2, 3, 4, 5, 6],
    slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  },
  martinez: {
    // Mon–Fri
    workingWeekdays: [1, 2, 3, 4, 5],
    slots: ['10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
  },
  reyes: {
    // Wed–Sun
    workingWeekdays: [0, 3, 4, 5, 6],
    slots: ['09:30', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
  },
  park: {
    // Mon, Wed, Thu, Sat
    workingWeekdays: [1, 3, 4, 6],
    slots: ['08:30', '09:00', '09:30', '11:00', '11:30', '13:30', '14:00', '15:30', '16:00'],
  },
};

// Tiny deterministic pseudo-random number generator (mulberry32).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Returns: { [practitionerId]: { [YYYY-MM-DD]: ['09:00', '10:30', ...] } }
export function generateAvailability(monthsAhead = 4) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = {};

  for (const pid of Object.keys(PRACTITIONER_SCHEDULES)) {
    const schedule = PRACTITIONER_SCHEDULES[pid];
    const days = {};
    const start = new Date(today);
    const end = new Date(today);
    end.setMonth(end.getMonth() + monthsAhead);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const weekday = d.getDay();
      if (!schedule.workingWeekdays.includes(weekday)) continue;
      const dateKey = formatDateKey(d);
      const rng = mulberry32(hashString(pid + '|' + dateKey));
      // Drop ~30–55% of slots to simulate prior bookings.
      const dropRate = 0.3 + rng() * 0.25;
      const surviving = schedule.slots.filter(() => rng() > dropRate);
      // Don't completely empty a day too often: keep at least 1 if any survived.
      if (surviving.length === 0) {
        // Force-keep one slot half the time.
        if (rng() > 0.5) surviving.push(schedule.slots[Math.floor(rng() * schedule.slots.length)]);
      }
      if (surviving.length > 0) days[dateKey] = surviving;
    }
    result[pid] = days;
  }
  return result;
}

export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
