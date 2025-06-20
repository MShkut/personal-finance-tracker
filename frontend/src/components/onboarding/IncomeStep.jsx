import React from 'react';

import { ThemeToggle } from 'components/shared/ThemeToggle';
import { FrequencySelector } from 'components/shared/FrequencySelector';
import { 
  FormGrid, 
  FormField, 
  StandardInput,
  RemoveButton,
  AddItemButton,
  FormSection,
  StandardFormLayout,
  SummaryCard,
  SectionBorder,
  useItemManager,
  validation,
  formatCurrency
} from '../shared/FormComponents';
import { 
  convertToYearly,
  calculateTotalYearlyIncome,
  analyzeIncomeDistribution
} from 'utils/incomeHelpers';

// Income Source component using shared utilities
export const IncomeSource = ({ source, onUpdate, onDelete }) => {
  return (
    <div className="py-8">
      <div className="grid grid-cols-12 gap-8 items-end">
        {/* Income source name: 7 columns - generous space */}
        <div className="col-span-7">
          <StandardInput
            label="Income Source"
            value={source.name}
            onChange={(value) => onUpdate({ ...source, name: value })}
            placeholder="Salary, consulting, freelance, investments"
          />
        </div>
        
        {/* Amount: 2 columns */}
        <div className="col-span-2">
          <StandardInput
            label="Amount"
            type="currency"
            value={source.amount}
            onChange={(value) => onUpdate({ ...source, amount: value })}
            prefix="$"
          />
        </div>
        
        {/* Frequency selector: 2 columns */}
        <div className="col-span-2">
          <FrequencySelector
            frequency={source.frequency}
            onChange={(value) => onUpdate({ ...source, frequency: value })}
            allowOneTime={true}
          />
        </div>
        
        {/* Remove button: 1 column */}
        <div className="col-span-1">
          <div className="flex items-end h-full pb-4">
            <button
              onClick={onDelete}
              className="w-full text-center text-3xl font-light text-gray-400 hover:text-red-500 transition-colors"
              title="Remove this income source"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const IncomeStep = ({ onNext, onBack, savedData }) => {
  // Use professional item manager for income sources
  const { 
    items: incomeSources, 
    addItem, 
    updateItem, 
    deleteItem,
    hasItems 
  } = useItemManager();

  const addIncomeSource = () => {
    addItem({
      name: '', 
      amount: '', 
      frequency: 'Monthly'
    });
  };

  // Use utility functions for calculations
  const totalYearlyIncome = calculateTotalYearlyIncome(incomeSources);
  const monthlyIncome = totalYearlyIncome / 12;
  const insights = analyzeIncomeDistribution(incomeSources);
  
  // Simple validation - just check if we have valid data
  const canContinue = totalYearlyIncome > 0 && incomeSources.every(source => 
    validation.hasValidString(source.name) && validation.isPositiveNumber(source.amount)
  );

  const handleNext = () => {
    if (onNext && canContinue) {
      onNext({ 
        incomeSources, 
        totalYearlyIncome, 
        monthlyIncome,
        insights 
      });
    }
  };

  // Get personalized title with proper possessive grammar
  const householdName = savedData?.household?.name || 'Your';
  
  const getPossessiveTitle = (name) => {
    if (name === 'Your') return 'Your Income Sources';
    
    // Add possessive 's for proper English grammar
    // "John" → "John's Income Sources"
    // "Smith Family" → "Smith Family's Income Sources" 
    // "John & Jane" → "John & Jane's Income Sources"
    return `${name}'s Income Sources`;
  };
  
  const title = getPossessiveTitle(householdName);

  return (
    <>
      <ThemeToggle />
      <StandardFormLayout
        title={title}
        subtitle="Start by entering all sources of regular income. This forms the foundation of your financial plan."
        onBack={onBack}
        onNext={handleNext}
        canGoNext={canContinue}
        nextLabel="Continue to Savings"
        showBack={true}
      >
        
        {/* Income Sources Section */}
        <FormSection>
          {hasItems ? (
            <div className="space-y-0 mb-8">
              {incomeSources.map((source) => (
                <IncomeSource
                  key={source.id}
                  source={source}
                  onUpdate={(updatedSource) => updateItem(source.id, updatedSource)}
                  onDelete={() => deleteItem(source.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-2xl font-light mb-2">No income sources yet</div>
              <div className="text-xl font-light">Add your first income source to get started</div>
            </div>
          )}

          <AddItemButton 
            onClick={addIncomeSource}
            children={!hasItems ? 'Add your first income source' : 'Add another income source'}
          />
        </FormSection>

        {/* Summary Section */}
        {totalYearlyIncome > 0 && (
          <FormSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <SummaryCard
                title="Total Yearly Income"
                value={totalYearlyIncome}
                accent={true}
              />
              <SummaryCard
                title="Monthly Income" 
                value={monthlyIncome}
              />
              <SummaryCard
                title="Income Sources"
                value={`${incomeSources.length} source${incomeSources.length === 1 ? '' : 's'}`}
              />
            </div>
          </FormSection>
        )}

      </StandardFormLayout>
    </>
  );
};
