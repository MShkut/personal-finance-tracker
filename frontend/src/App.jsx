import { useState, useEffect } from 'react';

import { ThemeProvider } from 'contexts/ThemeContext'
import { useOnboarding } from 'hooks/useOnboarding'
import { WelcomeStep } from 'components/onboarding/WelcomeStep'
import { IncomeStep } from 'components/onboarding/IncomeStep'
import { SavingsAllocationStep } from 'components/onboarding/SavingsAllocationStep'
import { ExpensesStep } from 'components/onboarding/ExpensesStep'
import { NetWorthStep } from 'components/onboarding/NetWorthStep'
import { Dashboard } from 'components/dashboard/Dashboard'
import { TransactionImport } from 'components/dashboard/TransactionImport'
import {dataManager } from 'utils/dataManager'

function OnboardingFlow({ onComplete, onBack }) {
  const { currentStep, nextStep, prevStep, formData, updateFormData, setHouseholdAndPeriod } = useOnboarding();

  const handleWelcomeNext = (welcomeData) => {
    setHouseholdAndPeriod(welcomeData);
    // Save progress
    dataManager.saveUserData({ 
      household: welcomeData.household,
      period: welcomeData.period,
      onboardingStep: 1
    });
    nextStep();
  };

  const handleIncomeNext = (incomeData) => {
    updateFormData('income', incomeData);
    // Save progress
    const currentData = dataManager.loadUserData() || {};
    dataManager.saveUserData({ 
      ...currentData,
      income: incomeData,
      onboardingStep: 2
    });
    nextStep();
  };

  const handleSavingsNext = (savingsData) => {
    updateFormData('savingsAllocation', savingsData);
    // Save progress
    const currentData = dataManager.loadUserData() || {};
    dataManager.saveUserData({ 
      ...currentData,
      savingsAllocation: savingsData,
      onboardingStep: 3
    });
    nextStep();
  };

  const handleExpensesNext = (expensesData) => {
    updateFormData('expenses', expensesData);
    // Save progress
    const currentData = dataManager.loadUserData() || {};
    dataManager.saveUserData({ 
      ...currentData,
      expenses: expensesData,
      onboardingStep: 4
    });
    nextStep();
  };

  const handleNetWorthNext = (netWorthData) => {
    updateFormData('netWorth', netWorthData);
    // Complete onboarding and save all data
    const completeData = { 
      ...formData, 
      netWorth: netWorthData,
      onboardingComplete: true,
      completedAt: new Date().toISOString()
    };
    
    dataManager.saveUserData(completeData);
    console.log('🎉 Onboarding Complete! Data saved to localStorage');
    onComplete(completeData);
  };

  const handleBack = () => {
    if (currentStep === 0) {
      if (onBack) onBack();
    } else {
      prevStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep 
            onNext={handleWelcomeNext}
            savedData={formData}
          />
        );
      case 1:
        return (
          <IncomeStep 
            onNext={handleIncomeNext}
            onBack={handleBack}
            savedData={formData}
            
          />
        );
      case 2:
        return (
          <SavingsAllocationStep
            onNext={handleSavingsNext}
            onBack={handleBack}
            incomeData={formData.income}
            savedData={formData}
          />
        );
      case 3:
        return (
          <ExpensesStep
            onNext={handleExpensesNext}
            onBack={handleBack}
            incomeData={formData.income}
            savingsData={formData.savingsAllocation}
            savedData={formData}
          />
        );
      case 4:
        return (
          <NetWorthStep
            onNext={handleNetWorthNext}
            onBack={handleBack}
            incomeData={formData.income}
            savingsData={formData.savingsAllocation}
            expensesData={formData.expenses}
            savedData={formData}
          />
        );
      default:
        return <WelcomeStep onNext={handleWelcomeNext} />;
    }
  };

  return renderStep();
}

export { OnboardingFlow };

function App() {
  const [currentView, setCurrentView] = useState('loading');
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const savedData = dataManager.loadUserData();
    
    if (savedData && savedData.onboardingComplete) {
      setOnboardingData(savedData);
      setCurrentView('dashboard');
    } else {
      setCurrentView('onboarding');
    }
  }, []);

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'loading':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-xl font-light text-gray-600">
              Loading...
            </div>
          </div>
        );
      
      case 'onboarding':
        return (
          <OnboardingFlow 
            onComplete={handleOnboardingComplete}
            onBack={() => handleNavigate('dashboard')}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigate}
          />
        );
      
      case 'import':
        return (
          <TransactionImport 
            onNavigate={handleNavigate}
          />
        );
      
      default:
        return (
          <OnboardingFlow 
            onComplete={handleOnboardingComplete}
            onBack={null}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      {renderCurrentView()}
    </ThemeProvider>
  )
}

export { App };
