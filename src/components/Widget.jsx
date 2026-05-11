import React from 'react';
import Banner from './Banner.jsx';
import ProgressBar from './ProgressBar.jsx';
import Footer from './Footer.jsx';
import { useBooking, STEPS } from '../state/BookingContext.jsx';
import ServiceSelection from '../screens/ServiceSelection.jsx';
import PatientGate from '../screens/PatientGate.jsx';
import Schedule from '../screens/Schedule.jsx';
import Checkout from '../screens/Checkout.jsx';
import Confirmation from '../screens/Confirmation.jsx';

const SCREENS = {
  [STEPS.SERVICE]: ServiceSelection,
  [STEPS.GATE]: PatientGate,
  [STEPS.SCHEDULE]: Schedule,
  [STEPS.CHECKOUT]: Checkout,
  [STEPS.CONFIRMATION]: Confirmation,
};

export default function Widget() {
  const { state } = useBooking();
  const Screen = SCREENS[state.step] || ServiceSelection;
  return (
    <div className="w-full max-w-[420px] self-start">
      <div className="overflow-hidden rounded-2xl bg-white shadow-widget ring-1 ring-slate-100">
        <Banner />
        <ProgressBar />
        <Screen />
        <Footer />
      </div>
    </div>
  );
}
