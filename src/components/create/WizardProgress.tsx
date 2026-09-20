const steps = ['Type', 'People', 'Setup', 'Experience', 'Ready'] as const

interface WizardProgressProps {
  currentStep: number
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="wizard-progress" aria-label={`Step ${currentStep} of ${steps.length}`}>
      <div className="wizard-progress__desktop">
        {steps.map((step, index) => {
          const number = index + 1
          return (
            <div
              key={step}
              className="wizard-progress__step"
              data-active={number === currentStep}
              data-complete={number < currentStep}
            >
              <span>{String(number).padStart(2, '0')}</span>
              <strong>{step}</strong>
              {number < steps.length && <i aria-hidden="true" />}
            </div>
          )
        })}
      </div>

      <div className="wizard-progress__mobile">
        <span>{String(currentStep).padStart(2, '0')} / 05</span>
        <strong>{steps[currentStep - 1]}</strong>
        <div><i style={{ width: `${currentStep * 20}%` }} /></div>
      </div>
    </div>
  )
}
