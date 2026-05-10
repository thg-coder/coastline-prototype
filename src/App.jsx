import React from 'react';
import { BookingProvider } from './state/BookingContext.jsx';
import Widget from './components/Widget.jsx';

export default function App() {
  return (
    <BookingProvider>
      <div className="min-h-screen w-full bg-transparent flex justify-center">
        <Widget />
      </div>
    </BookingProvider>
  );
}
