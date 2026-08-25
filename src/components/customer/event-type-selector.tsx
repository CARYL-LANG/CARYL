'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface EventTypeSelectorProps {
  onSelect: (eventType: string) => void;
}

export function EventTypeSelector({ onSelect }: EventTypeSelectorProps) {
  const { eventTypePrices } = useBooking();

  if (eventTypePrices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No events available yet. Please check back later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {eventTypePrices.map((event) => (
        <Card key={event.type} className="border-2 border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer overflow-hidden">
          <CardHeader className="text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Starting Price:</p>
              <p className="text-2xl font-bold text-blue-600">₱{event.price.toLocaleString()}</p>
              {event.capacity && (
                <p className="text-xs text-gray-500 mt-1">Up to {event.capacity} guests</p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => onSelect(event.type)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Book This Event
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
