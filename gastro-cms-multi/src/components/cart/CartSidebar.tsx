'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const { state, updateQuantity, removeItem } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('de-AT', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        {/* Header */}
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                    <ShoppingCartIcon className="h-6 w-6 text-brand-600" />
                                                    Warenkorb ({state.totalItems} {state.totalItems === 1 ? 'Artikel' : 'Artikel'})
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                        onClick={onClose}
                                                    >
                                                        <span className="sr-only">Schließen</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Cart Items */}
                                            <div className="mt-8">
                                                {state.items.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Warenkorb ist leer</h3>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Fügen Sie Produkte hinzu, um eine Bestellung aufzugeben.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flow-root">
                                                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                            {state.items.map((item) => (
                                                                <li key={item.id} className="flex py-6">
                                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                                        <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                                                                    </div>

                                                                    <div className="ml-4 flex flex-1 flex-col">
                                                                        <div>
                                                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                                                <h3>{item.name}</h3>
                                                                                <p className="ml-4">{formatPrice(item.totalPrice)}</p>
                                                                            </div>
                                                                            {item.description && (
                                                                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                                                            )}
                                                                            {item.extras.length > 0 && (
                                                                                <div className="mt-1">
                                                                                    <p className="text-xs text-gray-500">
                                                                                        Extras: {item.extras.map(e => e.name).join(', ')}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-1 items-end justify-between text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                                                                                >
                                                                                    <MinusIcon className="h-4 w-4" />
                                                                                </button>
                                                                                <span className="text-gray-700 font-medium min-w-[2rem] text-center">
                                                                                    {item.quantity}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                                                                                >
                                                                                    <PlusIcon className="h-4 w-4" />
                                                                                </button>
                                                                            </div>

                                                                            <div className="flex">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => removeItem(item.id)}
                                                                                    className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                                                                >
                                                                                    <TrashIcon className="h-4 w-4" />
                                                                                    Entfernen
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer with totals and checkout button */}
                                        {state.items.length > 0 && (
                                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                                <div className="space-y-2">
                                                    {/* Subtotal */}
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <p>Zwischensumme</p>
                                                        <p>{formatPrice(state.subtotalNet)}</p>
                                                    </div>

                                                    {/* Tax */}
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <p>MwSt.</p>
                                                        <p>{formatPrice(state.totalTax)}</p>
                                                    </div>

                                                    {/* Discount */}
                                                    {state.appliedCoupon && (
                                                        <div className="flex justify-between text-sm text-green-600">
                                                            <p>Rabatt ({state.appliedCoupon.code})</p>
                                                            <p>-{formatPrice(state.discountAmount)}</p>
                                                        </div>
                                                    )}

                                                    {/* Total */}
                                                    <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                                                        <p>Gesamt</p>
                                                        <p>{formatPrice(state.appliedCoupon ? state.subtotalAfterDiscount : state.totalPrice)}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <Link
                                                        href="/checkout"
                                                        onClick={onClose}
                                                        className="flex items-center justify-center rounded-md border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
                                                    >
                                                        Zur Kasse
                                                    </Link>
                                                </div>
                                                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                                    <p>
                                                        oder{' '}
                                                        <button
                                                            type="button"
                                                            className="font-medium text-brand-600 hover:text-brand-500"
                                                            onClick={onClose}
                                                        >
                                                            Weiter einkaufen
                                                            <span aria-hidden="true"> &rarr;</span>
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
