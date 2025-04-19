'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageLevel, ApplicationContext } from '@/lib/types';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nativeLanguage: '',
    targetLanguage: '',
    currentLevel: LanguageLevel.BEGINNER,
    desiredLevel: LanguageLevel.INTERMEDIATE,
    applicationContext: ApplicationContext.TOURISM,
    openaiApiKey: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        router.push('/spotify-connect');
      } else {
        const error = await response.json();
        console.error('Registration failed:', error);
        // Handle error
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Handle error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Your Profile</h2>
              <div className="text-sm text-gray-500">
                Step {step} of 3
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                      Native Language
                    </label>
                    <input
                      type="text"
                      id="nativeLanguage"
                      name="nativeLanguage"
                      value={formData.nativeLanguage}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., English"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                      Target Language
                    </label>
                    <input
                      type="text"
                      id="targetLanguage"
                      name="targetLanguage"
                      value={formData.targetLanguage}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Spanish"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="currentLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Level
                    </label>
                    <select
                      id="currentLevel"
                      name="currentLevel"
                      value={formData.currentLevel}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.values(LanguageLevel).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="desiredLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Desired Level
                    </label>
                    <select
                      id="desiredLevel"
                      name="desiredLevel"
                      value={formData.desiredLevel}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.values(LanguageLevel).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="applicationContext" className="block text-sm font-medium text-gray-700 mb-1">
                      Intended Context of Application
                    </label>
                    <select
                      id="applicationContext"
                      name="applicationContext"
                      value={formData.applicationContext}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.values(ApplicationContext).map(context => (
                        <option key={context} value={context}>{context}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="openaiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      id="openaiApiKey"
                      name="openaiApiKey"
                      value={formData.openaiApiKey}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="sk-..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your API key is stored securely and used for language processing features.
                    </p>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Create Profile
                    </button>
                  </div>
                </div>
              )}
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-800">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
