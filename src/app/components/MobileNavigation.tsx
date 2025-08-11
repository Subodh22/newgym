'use client'

import { User, Dumbbell, Calendar } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: 'current' | 'mesocycles' | 'profile';
  onTabChange: (tab: 'current' | 'mesocycles' | 'profile') => void;
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const tabs = [
    {
      id: 'current' as const,
      label: 'Current',
      icon: Dumbbell,
    },
    {
      id: 'mesocycles' as const,
      label: 'Plans',
      icon: Calendar,
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all duration-200 min-w-0 ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent 
                  className={`h-5 w-5 transition-all duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`} 
                />
                <span className="text-xs font-medium truncate">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
