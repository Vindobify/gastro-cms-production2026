# Gastro CMS Multi - Verbleibende Features

## ✅ **Heute abgeschlossen:**

### 1. Multitenant-System (Phase 3.5 & 3.6)
- Docker PostgreSQL + Prisma Schema
- 3 Test-Tenants (CRM, Pizzeria Mario, Sushi Wien)
- Cookie-basierte Authentication
- Alle wichtigen API Routes multitenant-fähig

### 2. UX-Verbesserungen (Phase 3.7 - Teilweise)
- ✅ Warenkorb nach Bestellung leeren
- ✅ Toast-Benachrichtigungen beim Warenkorb

---

## 📋 **Noch zu implementieren:**

### A) Warenkorb-Overlay/Sidebar
**Ziel:** Vor dem Checkout eine Übersicht anzeigen

**Implementierung:**
1. Neue Komponente: `src/components/cart/CartSidebar.tsx`
2. State für Sidebar-Öffnung im CartContext
3. Trigger: Klick auf Warenkorb-Icon im Header
4. Features:
   - Liste aller Warenkorb-Items
   - Menge ändern
   - Items entfernen
   - Gesamtpreis anzeigen
   - "Zur Kasse" Button → Weiterleitung zu `/checkout`

**Dateien zu erstellen/ändern:**
- `src/components/cart/CartSidebar.tsx` (NEU)
- `src/contexts/CartContext.tsx` (State für `isSidebarOpen`)
- `src/components/frontend/Header.tsx` (Warenkorb-Icon mit Badge)

---

### B) Echtzeit-Bestellungen (KOMPLEX!)
**Ziel:** Neue Bestellungen live im Dashboard anzeigen + Sound

**Technologie:** Server-Sent Events (SSE)

**Implementierung:**

#### 1. Backend: SSE Endpoint
```typescript
// src/app/api/orders/live/route.ts
export async function GET(request: NextRequest) {
  const tenant = await getTenant();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Polling-Mechanismus: Alle 5 Sekunden neue Bestellungen prüfen
      const interval = setInterval(async () => {
        const newOrders = await prisma.order.findMany({
          where: {
            tenantId: tenant.id,
            createdAt: { gte: new Date(Date.now() - 10000) } // Letzte 10 Sekunden
          },
          include: { customer: true }
        });
        
        if (newOrders.length > 0) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(newOrders)}\n\n`));
        }
      }, 5000);
      
      // Cleanup
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

#### 2. Frontend: Hook für SSE
```typescript
// src/hooks/useOrdersSSE.ts
export function useOrdersSSE(onNewOrder: (order: Order) => void) {
  useEffect(() => {
    const eventSource = new EventSource('/api/orders/live');
    
    eventSource.onmessage = (event) => {
      const orders = JSON.parse(event.data);
      orders.forEach(onNewOrder);
    };
    
    return () => eventSource.close();
  }, [onNewOrder]);
}
```

#### 3. Dashboard: Integration
```typescript
// src/app/dashboard/orders/page.tsx
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(new Audio('/sounds/new-order.mp3'));
  
  useOrdersSSE((newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    audioRef.current.play(); // Sound abspielen
    toast.success(`Neue Bestellung #${newOrder.orderNumber}!`);
  });
  
  // ... Rest
};
```

#### 4. Sound-Datei
- MP3-Datei in `public/sounds/new-order.mp3` ablegen
- Benachrichtigungs-Sound (z.B. "Ding!")

**Dateien zu erstellen/ändern:**
- `src/app/api/orders/live/route.ts` (NEU - SSE Endpoint)
- `src/hooks/useOrdersSSE.ts` (NEU - Hook)
- `src/app/dashboard/orders/page.tsx` (SSE Integration)
- `public/sounds/new-order.mp3` (NEU - Sound)

---

### C) Bestellbestätigungsseite - Live Updates
**Ziel:** Bestellstatus in Echtzeit anzeigen

**Implementierung:**
1. Ähnlich wie Dashboard, aber für einzelne Bestellung
2. SSE Endpoint: `/api/orders/[id]/status`
3. Polling alle 3 Sekunden für Status-Updates
4. Anzeige: "Bestätigt" → "In Vorbereitung" → "Unterwegs" → "Geliefert"

**Dateien zu erstellen/ändern:**
- `src/app/api/orders/[id]/status/route.ts` (NEU - SSE für einzelne Bestellung)
- `src/app/orders/[id]/page.tsx` (Live-Updates)

---

## 🎯 **Prioritäten:**

1. **HOCH:** Warenkorb-Overlay (schnell, wichtig für UX)
2. **HOCH:** Echtzeit-Bestellungen (komplex, aber kritisch für Restaurant)
3. **MITTEL:** Bestellbestätigungsseite Live-Updates

---

## 📝 **Nächste Schritte:**

1. Warenkorb-Overlay implementieren (~30 Min)
2. SSE für Bestellungen implementieren (~60 Min)
3. Sound-Benachrichtigungen testen
4. Bestellbestätigungsseite Live-Updates (~30 Min)

**Geschätzte Gesamtzeit:** ~2 Stunden

---

## 🚀 **Danach:**

- Phase 4: CRM Verbindung
- Phase 5: Stripe Integration
- Phase 6: Push Notifications
- Phase 7: PWA
- Phase 8: Deployment
