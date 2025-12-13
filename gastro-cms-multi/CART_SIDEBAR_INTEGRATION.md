# Warenkorb-Sidebar Integration

## Verwendung in Header oder Layout:

```typescript
'use client';

import { useCartSidebar } from '@/hooks/useCartSidebar';
import CartSidebar from '@/components/cart/CartSidebar';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { isOpen, openSidebar, closeSidebar } = useCartSidebar();
  const { state } = useCart();

  return (
    <>
      <header>
        {/* ... andere Header-Inhalte ... */}
        
        {/* Warenkorb-Button */}
        <button
          onClick={openSidebar}
          className="relative p-2 text-gray-700 hover:text-brand-600"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {state.totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {state.totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Sidebar */}
      <CartSidebar isOpen={isOpen} onClose={closeSidebar} />
    </>
  );
}
```

## Features:
- ✅ Slide-in Animation von rechts
- ✅ Backdrop mit Blur
- ✅ Item-Count Badge
- ✅ Menge ändern (+/-)
- ✅ Items entfernen
- ✅ Preisübersicht (Netto, MwSt., Rabatt, Gesamt)
- ✅ "Zur Kasse" Button
- ✅ "Weiter einkaufen" Link
- ✅ Responsive Design
