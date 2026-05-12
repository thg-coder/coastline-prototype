// Site config for a single demo client. In production, this is generated
// per-client at deployment time from intake questionnaire responses.

export const siteConfig = {
  // Identity
  brandName: 'Coastline Demo',
  practiceName: 'Coastline Med Spa',
  practiceAddress: '123 Main St, Suite 100, Atlanta, GA 30309',
  practicePhone: '(555) 123-4567',
  practiceWebsite: 'https://example.com',
  logoUrl: null, // null = render brandName as text; string URL = render image

  // Email
  emailSenderName: 'Coastline Med Spa',
  emailSenderAddress: 'bookings@coastlinemedspa.com',

  // Legal / state
  state: 'GA',

  // Behavior toggles
  gfeMode: 'in_person',
  requiresDeposit: false,
  pricingVisibility: 'show', // 'show' | 'starting_at' | 'hide'

  // Branding
  primaryColor: '#1F6E8C', // primary brand color
  primaryColorDark: '#164E62', // for gradient end / hover states
};
