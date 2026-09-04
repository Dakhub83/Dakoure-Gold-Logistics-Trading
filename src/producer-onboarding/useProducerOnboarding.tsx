import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  emptyOnboardingData,
  type FieldErrors,
  type ProducerOnboardingData,
  type StepIndex,
} from "./types";
import { validateStep } from "./validation";
import { OnboardingApiError, submitProducerOnboarding, type SubmitResult } from "./api";

interface WizardState {
  step: StepIndex;
  data: ProducerOnboardingData;
  errors: FieldErrors;
  touchedSubmit: boolean;
  submitting: boolean;
  submitError: string | null;
  result: SubmitResult | null;
}

type Action =
  | { type: "SET_FIELD"; field: keyof ProducerOnboardingData; value: ProducerOnboardingData[keyof ProducerOnboardingData] }
  | { type: "SET_ERRORS"; errors: FieldErrors }
  | { type: "GO_TO"; step: StepIndex }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; result: SubmitResult }
  | { type: "SUBMIT_ERROR"; message: string };

const initialState: WizardState = {
  step: 0,
  data: emptyOnboardingData(),
  errors: {},
  touchedSubmit: false,
  submitting: false,
  submitError: null,
  result: null,
};

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors, touchedSubmit: true };
    case "GO_TO":
      return { ...state, step: action.step, errors: {} };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: null };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, result: action.result };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.message };
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  setField: <K extends keyof ProducerOnboardingData>(field: K, value: ProducerOnboardingData[K]) => void;
  goNext: () => void;
  goBack: () => void;
  submit: () => Promise<void>;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function ProducerOnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setField = useCallback(
    <K extends keyof ProducerOnboardingData>(field: K, value: ProducerOnboardingData[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  const goNext = useCallback(() => {
    const errors = validateStep(state.step, state.data);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors });
      return;
    }
    if (state.step < 3) dispatch({ type: "GO_TO", step: (state.step + 1) as StepIndex });
  }, [state.step, state.data]);

  const goBack = useCallback(() => {
    if (state.step > 0) dispatch({ type: "GO_TO", step: (state.step - 1) as StepIndex });
  }, [state.step]);

  const submit = useCallback(async () => {
    const errors = validateStep(3, state.data);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors });
      return;
    }
    dispatch({ type: "SUBMIT_START" });
    try {
      const result = await submitProducerOnboarding(state.data);
      dispatch({ type: "SUBMIT_SUCCESS", result });
    } catch (err) {
      const message =
        err instanceof OnboardingApiError ? err.message : "Submission failed. Please try again.";
      dispatch({ type: "SUBMIT_ERROR", message });
    }
  }, [state.data]);

  const value = useMemo(
    () => ({ state, setField, goNext, goBack, submit }),
    [state, setField, goNext, goBack, submit]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useProducerOnboarding(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useProducerOnboarding must be used within a ProducerOnboardingProvider");
  }
  return ctx;
}
