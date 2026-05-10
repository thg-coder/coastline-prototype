import React from 'react';
import Banner from './Banner.jsx';
import ProgressBar from './ProgressBar.jsx';
import Footer from './Footer.jsx';
import { useBooking, STEPS } from '../state/BookingContext.jsx';
import ServiceSelection from '../screens/ServiceSelection.jsx';
import FormatSelection from '../screens/FormatSelection.jsx';
import PractitionerSelection from '../screens/PractitionerSelection.jsx';
import CalendarSelection from '../screens/CalendarSelection.jsx';
import IntakeForm from '../screens/IntakeForm.jsx';
import CancellationPolicy from '../screens/CancellationPolicy.jsx';
import Checkout from '../screens/Checkout.jsx';
import Confirmation from '../screens/Confirmation.jsx';

const SCREENS = {
  [STEPS.SERVICE]: ServiceSelection,
  [STEPS.FORMAT]: FormatSelection,
  [STEPS.PRACTITIONER]: PractitionerSelection,
  [STEPS.CALENDAR]: CalendarSelection,
  [STEPS.INTAKE]: IntakeForm,
  [STEPS.POLICY]: CancellationPolicy,
  [STEPS.CHECKOUT]: Checkout,
  [STEPS.CONFIRMATION]: Confirmation,
};

export default function Widget() {
  const { state } = useBooking();
  const Screen = SCREENS[state.step] || ServiceSelection;
  return (
    <div className="w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl bg-white shadow-widget ring-1 ring-slate-100">
        <Banner />
        <ProgressBar />
        <Screen />
        <Footer />
      </div>
    </div>
  );
}
