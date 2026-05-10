import React from 'react';
import { BookingProvider } from './state/BookingContext.jsx';
import ParentPageChrome from './components/ParentPageChrome.jsx';
import Widget from './components/Widget.jsx';

export default function App() {
  return (
    <BookingProvider>
      <ParentPageChrome>
        <Widget />
      </ParentPageChrome>
    </BookingProvider>
  );
}
