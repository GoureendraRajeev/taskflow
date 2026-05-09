import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    title: 'What brings you to TaskFlow today?',
    options: ["Manage my team's work", 'Track my personal tasks', 'My team invited me', 'Just exploring']
  },
  {
    title: 'What best describes your role?',
    options: ['Project Manager', 'Developer', 'Designer', 'Student', 'Business Owner', 'Other']
  },
  {
    title: 'What is your team size?',
    options: ['Solo', 'Small (2-5 people)', 'Medium (6-20 people)', 'Large (20+ people)']
  },
  {
    title: 'What do you want to focus on first?',
    options: ['Setting up a project', 'Creating tasks', 'Tracking progress', 'Inviting members']
  },
  {
    title: 'What type of work are you managing?',
    options: ['Software', 'Design', 'Marketing', 'Business Operations', 'Academic', 'Other']
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem('onboardingCompleted');
    if (hasCompleted) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentStep]: option });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsDone(true);
    }
  };

  const handleFinish = () => {
    const formattedAnswers = {
      purpose: answers[0],
      role: answers[1],
      teamSize: answers[2],
      focus: answers[3],
      workType: answers[4]
    };
    localStorage.setItem('onboardingAnswers', JSON.stringify(formattedAnswers));
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/signup');
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/login');
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (isDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">You're all set!</h1>
          <p className="text-lg text-gray-600 mb-8">We've customized your experience based on your answers.</p>
          <div className="bg-indigo-50 rounded-lg p-6 mb-8 text-left border border-indigo-100">
            <h3 className="font-semibold text-indigo-900 mb-3 text-sm uppercase tracking-wider">Your Profile</h3>
            <ul className="space-y-2 text-indigo-800">
              <li>• Role: {answers[1] || 'Not specified'}</li>
              <li>• Team: {answers[2] || 'Not specified'}</li>
              <li>• Work Type: {answers[4] || 'Not specified'}</li>
            </ul>
          </div>
          <button
            onClick={handleFinish}
            className="w-full py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md hover:shadow-lg"
          >
            Let's Go!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-indigo-600 h-2 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <button onClick={handleSkip} className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Skip
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
            {STEPS[currentStep].title}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {STEPS[currentStep].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                className={`p-4 text-left rounded-xl border-2 transition-all ${
                  answers[currentStep] === option
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentStep]}
              className="px-8 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {currentStep === STEPS.length - 1 ? 'Finish' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
