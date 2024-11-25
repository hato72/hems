import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Suggestion } from '../types';

interface Props {
  suggestions: Suggestion[];
}

export const SuggestionList: React.FC<Props> = ({ suggestions }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center">
        <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
        エネルギー節約の提案
      </h2>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-1">{suggestion.title}</h3>
            <p className="text-gray-600 mb-2">{suggestion.description}</p>
            <div className="text-green-600 font-medium">
              潜在的な節約: ¥{suggestion.savingPotential.toFixed(2)}/月
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};