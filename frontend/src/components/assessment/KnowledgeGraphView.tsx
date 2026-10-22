import React from 'react';

export interface KnowledgeGraphViewProps {
  drug: string;
  adrName: string;
  symptoms: string[];
  confidence: number;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  drug,
  adrName,
  symptoms,
  confidence,
}) => {
  return (
    <div className="flex flex-col w-full font-body">
      {/* Container for graph */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full py-8 relative gap-6 md:gap-0">
        
        {/* Drug Node */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="px-6 py-3 rounded-xl bg-primary text-white font-medium text-lg border border-primary text-center min-w-[120px]">
            {drug}
          </div>
        </div>

        {/* Line from Drug to ADR */}
        <div className="hidden md:flex flex-1 h-[2px] bg-line relative items-center justify-center min-w-[80px]">
          <span className="absolute -top-6 text-xs text-secondary bg-surface px-2">causes</span>
          <div className="absolute right-0 w-2 h-2 border-t-[2px] border-r-[2px] border-line transform rotate-45 -mt-[1px] -mr-[1px]"></div>
        </div>
        
        {/* Mobile vertical line */}
        <div className="md:hidden w-[2px] h-12 bg-line relative flex items-center justify-center">
          <span className="absolute left-4 text-xs text-secondary whitespace-nowrap bg-surface px-1">causes</span>
          <div className="absolute bottom-0 w-2 h-2 border-b-[2px] border-r-[2px] border-line transform rotate-45 -mb-[1px] -mr-[3px]"></div>
        </div>

        {/* ADR Node */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="px-6 py-3 rounded-xl bg-alert text-white font-medium text-lg border border-alert text-center min-w-[140px]">
            {adrName}
          </div>
        </div>

        {/* Lines from ADR to Symptoms */}
        <div className="hidden md:flex flex-1 h-[2px] bg-line relative items-center justify-center min-w-[80px]">
          <span className="absolute -top-6 text-xs text-secondary bg-surface px-2">presents as</span>
        </div>
        
        {/* Mobile vertical line */}
        <div className="md:hidden w-[2px] h-12 bg-line relative flex items-center justify-center">
          <span className="absolute left-4 text-xs text-secondary whitespace-nowrap bg-surface px-1">presents as</span>
        </div>

        {/* Symptoms Nodes */}
        <div className="flex flex-row md:flex-col gap-3 z-10 flex-wrap justify-center md:pl-6 border-l-0 md:border-l-[2px] border-line relative py-4">
           {symptoms.map((symptom, idx) => (
             <div key={idx} className="relative flex items-center">
               <div className="hidden md:block absolute -left-6 w-6 h-[2px] bg-line"></div>
               <div className="absolute -left-6 w-2 h-2 border-t-[2px] border-r-[2px] border-line transform rotate-45 -mt-[1px] -mr-[1px] hidden md:block"></div>
               
               <div className="px-4 py-2 rounded-xl bg-bg text-ink border border-line text-sm text-center shadow-sm">
                 {symptom}
               </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm border-t border-line pt-4 gap-2">
        <span className="text-secondary font-medium">
          Knowledge Graph confidence: {confidence}%
        </span>
        <span className="text-secondary text-xs max-w-sm">
          This graph shows the relationship path identified by the knowledge base. Integration with full Knowledge Graph pending.
        </span>
      </div>
    </div>
  );
};
