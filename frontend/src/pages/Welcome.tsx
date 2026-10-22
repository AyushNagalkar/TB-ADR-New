import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-ink">
      <div className="max-w-lg w-full flex flex-col items-start gap-8">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-primary mb-4">TB Adeverse Drug Reactions Companion </h1>
          <p className="font-body text-lg text-ink/80 leading-relaxed">
            Monitor your TB medicine side effects between doctor visits. Catch adverse drug reactions early, stay informed about your health.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Link to="/login?mode=signup" className="w-full">
            <Button className="w-full text-lg py-4">Get started</Button>
          </Link>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full text-lg py-4">I already have an account</Button>
          </Link>
        </div>

        <div className="w-full border-t border-line pt-6">
          <ul className="flex flex-col gap-3 font-body text-ink/80">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Check for side effects (ADRs)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Get Health Guidance Timely
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Track daily medicine and monitor recovery
            </li>
          </ul>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-sm text-secondary font-body">
        This tool supports — not replaces — your doctor's advice.
      </div>
    </div>
  );
};
