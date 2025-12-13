'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Predefined food icons with their emoji and identifiers
const FOOD_ICONS = [
  { id: 'pizza', emoji: '🍕', name: 'Pizza' },
  { id: 'pasta', emoji: '🍝', name: 'Pasta' },
  { id: 'burger', emoji: '🍔', name: 'Burger' },
  { id: 'salad', emoji: '🥗', name: 'Salat' },
  { id: 'soup', emoji: '🍲', name: 'Suppe' },
  { id: 'appetizer', emoji: '🥙', name: 'Vorspeise' },
  { id: 'dessert', emoji: '🍰', name: 'Dessert' },
  { id: 'drink', emoji: '🥤', name: 'Getränk' },
  { id: 'meat', emoji: '🥩', name: 'Fleisch' },
  { id: 'fish', emoji: '🐟', name: 'Fisch' },
  { id: 'cheese', emoji: '🧀', name: 'Käse' },
  { id: 'rice', emoji: '🍚', name: 'Risotto' },
  { id: 'bread', emoji: '🍞', name: 'Brot' },
  { id: 'sandwich', emoji: '🥪', name: 'Sandwich' },
  { id: 'taco', emoji: '🌮', name: 'Taco' },
  { id: 'hotdog', emoji: '🌭', name: 'Hotdog' },
  { id: 'fries', emoji: '🍟', name: 'Pommes' },
  { id: 'chicken', emoji: '🍗', name: 'Hähnchen' },
  { id: 'egg', emoji: '🥚', name: 'Ei' },
  { id: 'bacon', emoji: '🥓', name: 'Speck' },
  { id: 'croissant', emoji: '🥐', name: 'Croissant' },
  { id: 'pancake', emoji: '🥞', name: 'Pfannkuchen' },
  { id: 'waffle', emoji: '🧇', name: 'Waffel' },
  { id: 'cookie', emoji: '🍪', name: 'Keks' },
  { id: 'donut', emoji: '🍩', name: 'Donut' },
  { id: 'ice-cream', emoji: '🍦', name: 'Eis' },
  { id: 'coffee', emoji: '☕', name: 'Kaffee' },
  { id: 'wine', emoji: '🍷', name: 'Wein' },
  { id: 'beer', emoji: '🍺', name: 'Bier' },
  { id: 'cocktail', emoji: '🍹', name: 'Cocktail' },
  { id: 'fruit', emoji: '🍎', name: 'Obst' },
  { id: 'vegetable', emoji: '🥕', name: 'Gemüse' },
];

interface FoodIconPickerProps {
  selectedIcon?: string;
  onIconSelect: (iconId: string) => void;
  className?: string;
}

export default function FoodIconPicker({ selectedIcon, onIconSelect, className = '' }: FoodIconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIconData = FOOD_ICONS.find(icon => icon.id === selectedIcon);

  const handleIconSelect = (iconId: string) => {
    onIconSelect(iconId);
    setIsOpen(false);
  };

  const handleClearIcon = () => {
    onIconSelect('');
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
      >
        <div className="flex items-center space-x-3">
          {selectedIconData ? (
            <>
              <span className="text-2xl">{selectedIconData.emoji}</span>
              <span className="text-gray-900">{selectedIconData.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Icon auswählen...</span>
          )}
        </div>
        <div className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Food Icon auswählen
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {/* Clear Selection Option */}
                      <button
                        type="button"
                        onClick={handleClearIcon}
                        className={`relative p-4 rounded-lg border-2 transition-all hover:bg-gray-50 ${
                          !selectedIcon
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-2xl text-gray-400">∅</span>
                          <span className="text-xs text-gray-600 text-center">Kein Icon</span>
                        </div>
                        {!selectedIcon && (
                          <div className="absolute top-2 right-2">
                            <CheckIcon className="w-4 h-4 text-brand-600" />
                          </div>
                        )}
                      </button>

                      {/* Icon Options */}
                      {FOOD_ICONS.map((icon) => (
                        <button
                          key={icon.id}
                          type="button"
                          onClick={() => handleIconSelect(icon.id)}
                          className={`relative p-4 rounded-lg border-2 transition-all hover:bg-gray-50 ${
                            selectedIcon === icon.id
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <span className="text-2xl">{icon.emoji}</span>
                            <span className="text-xs text-gray-600 text-center">{icon.name}</span>
                          </div>
                          {selectedIcon === icon.id && (
                            <div className="absolute top-2 right-2">
                              <CheckIcon className="w-4 h-4 text-brand-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                      onClick={() => setIsOpen(false)}
                    >
                      Abbrechen
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

// Export the food icons for use in other components
export { FOOD_ICONS };
