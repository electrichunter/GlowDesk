"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Polymorphic Booking Engine Context & State Management
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { BookingFormState, CustomerInfo, DateTimeSelection, VerticalKey } from '@/lib/verticals/types';
import { VERTICAL_BOOKING_STEPS } from '@/lib/verticals/booking-steps';

// ─── Actions ──────────────────────────────────────────────────────────────────

type BookingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_CUSTOMER'; payload: Partial<CustomerInfo> }
  | { type: 'UPDATE_DATETIME'; payload: Partial<DateTimeSelection> }
  | { type: 'UPDATE_METADATA'; payload: Record<string, any> }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET_FORM' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function bookingReducer(state: BookingFormState<VerticalKey>, action: BookingAction): BookingFormState<VerticalKey> {
  const steps = VERTICAL_BOOKING_STEPS[state.vertical] || VERTICAL_BOOKING_STEPS.salon;

  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStepIndex: Math.max(0, Math.min(action.payload, steps.length - 1)) };
    case 'NEXT_STEP':
      return { ...state, currentStepIndex: Math.min(state.currentStepIndex + 1, steps.length - 1) };
    case 'PREV_STEP':
      return { ...state, currentStepIndex: Math.max(state.currentStepIndex - 1, 0) };
    case 'UPDATE_CUSTOMER':
      return { ...state, customerInfo: { ...state.customerInfo, ...action.payload } };
    case 'UPDATE_DATETIME':
      return { ...state, dateTime: { ...state.dateTime, ...action.payload } };
    case 'UPDATE_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'RESET_FORM':
      return createInitialState(state.vertical);
    default:
      return state;
  }
}

function createInitialState(vertical: VerticalKey): BookingFormState<VerticalKey> {
  return {
    vertical,
    currentStepIndex: 0,
    isSubmitting: false,
    customerInfo: {},
    dateTime: {},
    metadata: vertical === 'restoran' ? { guestCount: 2, depositPaid: false } : {},
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface BookingContextValue {
  state: BookingFormState<VerticalKey>;
  dispatch: React.Dispatch<BookingAction>;
  steps: typeof VERTICAL_BOOKING_STEPS[VerticalKey];
  currentStep: typeof VERTICAL_BOOKING_STEPS[VerticalKey][0];
  isFirstStep: boolean;
  isLastStep: boolean;
  canNext: boolean;
  nextStep: () => void;
  prevStep: () => void;
  updateCustomer: (info: Partial<CustomerInfo>) => void;
  updateDateTime: (dt: Partial<DateTimeSelection>) => void;
  updateMetadata: (data: Record<string, any>) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BookingEngine({ vertical, children }: { vertical: VerticalKey; children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, vertical, createInitialState);

  const steps = VERTICAL_BOOKING_STEPS[vertical] || VERTICAL_BOOKING_STEPS.salon;
  const currentStep = steps[state.currentStepIndex];
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === steps.length - 1;
  const canNext = currentStep ? currentStep.isComplete(state) : false;

  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const updateCustomer = (info: Partial<CustomerInfo>) => dispatch({ type: 'UPDATE_CUSTOMER', payload: info });
  const updateDateTime = (dt: Partial<DateTimeSelection>) => dispatch({ type: 'UPDATE_DATETIME', payload: dt });
  const updateMetadata = (data: Record<string, any>) => dispatch({ type: 'UPDATE_METADATA', payload: data });

  return (
    <BookingContext.Provider
      value={{
        state,
        dispatch,
        steps,
        currentStep,
        isFirstStep,
        isLastStep,
        canNext,
        nextStep,
        prevStep,
        updateCustomer,
        updateDateTime,
        updateMetadata,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingEngine() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookingEngine must be used within a BookingEngine Provider');
  }
  return ctx;
}
