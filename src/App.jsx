import React from 'react';
import { BookingProvider } from './state/BookingContext.jsx';
import Widget from './components/Widget.jsx';
import DemoPageChrome from './components/DemoPageChrome.jsx';

// The standalone demo URL renders the widget inside a page-chrome wrapper so
// it reads as a real practice site. For an actual iframe embed, a client build
// would render <Widget /> on its own — the widget has no dependency on the
// chrome.
export default function App() {
  return (
    <BookingProvider>
      <DemoPageChrome>
        <Widget />
      </DemoPageChrome>
    </BookingProvider>
  );
}
