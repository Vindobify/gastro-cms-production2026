'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { STANDARD_ALLERGENS } from '@/lib/constants'

interface AllergenModalProps {
  isOpen: boolean
  onClose: () => void
  allergenCode: string
}

// Detaillierte Allergen-Informationen basierend auf WKO-Richtlinien
function getAllergenDetails(code: string): string {
  const allergenDetails: { [key: string]: string } = {
    'A': 'Weizen, Roggen, Gerste, Hafer, Dinkel, Kamut, Emmer, Einkorn, Grünkern, Triticale, Bulgur, Couscous, Grieß, Mehl, Stärke, Brot, Gebäck, Nudeln, Paniermehl, Malz, Bier, Whisky, Sojasauce (wenn mit Weizen hergestellt)',
    'B': 'Krabben, Hummer, Langusten, Garnelen, Krebse, Scampi, Shrimps, Krebsfleisch, Krebssuppe, Krebssauce, Krebsextrakt',
    'C': 'Eier, Eigelb, Eiklar, Eipulver, Eierlikör, Mayonnaise, Aioli, Remoulade, Backwaren mit Eiern, Nudeln mit Eiern, Eiernudeln, Spätzle, Kaiserschmarrn, Tiramisu, Mousse, Soufflé',
    'D': 'Fisch, Fischfilet, Fischstäbchen, Fischsuppe, Fischsauce, Anchovis, Sardellen, Thunfisch, Lachs, Hering, Makrele, Kabeljau, Seelachs, Forelle, Zander, Hecht, Karpfen, Aal, Muscheln, Austern, Hummer, Krabben, Garnelen, Scampi, Tintenfisch, Oktopus, Schnecken',
    'E': 'Erdnüsse, Erdnussöl, Erdnussbutter, Erdnussflips, Erdnusskerne, Erdnussmehl, Erdnusspaste, Erdnusscreme, Satay-Sauce, Erdnusssoße, Müsli mit Erdnüssen, Schokolade mit Erdnüssen',
    'F': 'Sojabohnen, Sojamehl, Sojaöl, Sojasauce, Sojamilch, Tofu, Tempeh, Miso, Natto, Sojalecithin, Sojaprotein, Sojaeiweiß, Sojabohnenkeime, Edamame, Sojajoghurt, Sojaeis, Sojabutter',
    'G': 'Milch, Milchpulver, Milchzucker (Laktose), Milcheiweiß, Milchfett, Butter, Buttermilch, Sahne, Rahm, Schlagobers, Sauerrahm, Crème fraîche, Joghurt, Quark, Käse, Molke, Molkenpulver, Kefir, Buttermilch, Kondensmilch, Schokolade mit Milch, Eiscreme, Pudding, Milchreis',
    'H': 'Mandeln, Haselnüsse, Walnüsse, Cashewnüsse, Pistazien, Paranüsse, Macadamianüsse, Pekannüsse, Pinienkerne, Marzipan, Nougat, Nussöl, Nussbutter, Nusscreme, Nussmehl, Nusskuchen, Nussbrot, Nussmüsli, Nussriegel, Nussschokolade, Nusseis, Nusslikör',
    'L': 'Sellerie, Sellerieblätter, Selleriesamen, Selleriesalz, Selleriepulver, Selleriesaft, Selleriesuppe, Selleriesalat, Selleriecreme, Selleriesauce, Gewürzmischungen mit Sellerie, Brühe mit Sellerie, Suppenwürfel mit Sellerie',
    'M': 'Senf, Senfkörner, Senfpulver, Senfsauce, Senföl, Senfcreme, Senfmayonnaise, Senfdressing, Senfsoße, Gewürzmischungen mit Senf, Brühe mit Senf, Suppenwürfel mit Senf, Wurst mit Senf',
    'N': 'Sesam, Sesamöl, Sesamsamen, Sesampaste, Tahini, Hummus, Sesambrot, Sesamkekse, Sesamriegel, Sesamöl, Gewürzmischungen mit Sesam, Brühe mit Sesam, Suppenwürfel mit Sesam',
    'O': 'Schwefeldioxid, Sulfite, E220-E228, Wein, Sekt, Champagner, getrocknete Früchte, Rosinen, Aprikosen, Feigen, Pflaumen, Apfelringe, Kartoffelchips, Kartoffelstärke, Essig, Bier, Fruchtsäfte, Fruchtsirup, Marmelade, Konfitüre, Gelee, Fruchtgummi, Lakritz',
    'P': 'Lupinen, Lupinenmehl, Lupinensamen, Lupinenprotein, Lupinenöl, Lupinenkaffee, Lupinenmilch, Lupinenjoghurt, Lupinenbrot, Lupinenkekse, Lupinenriegel, Gewürzmischungen mit Lupinen',
    'R': 'Schnecken, Muscheln, Austern, Miesmuscheln, Jakobsmuscheln, Venusmuscheln, Herzmuscheln, Tintenfisch, Oktopus, Sepia, Calamari, Kraken, Schneckenbutter, Schneckensauce, Muschelsauce, Austernsauce'
  };

  return allergenDetails[code] || 'Informationen zu diesem Allergen sind nicht verfügbar.';
}

export default function AllergenModal({ isOpen, onClose, allergenCode }: AllergenModalProps) {
  const allergen = STANDARD_ALLERGENS.find(a => a.code === allergenCode);
  const allergenDetails = getAllergenDetails(allergenCode);

  if (!allergen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} role="dialog" aria-labelledby="allergen-modal-title" aria-describedby="allergen-modal-description">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all" role="document">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${allergen.color}`}
                      aria-label={`Allergen-Code: ${allergen.code}`}
                    >
                      {allergen.code}
                    </span>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                      id="allergen-modal-title"
                    >
                      {allergen.name}
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    onClick={onClose}
                    aria-label="Allergen-Information schließen"
                  >
                    <span className="sr-only">Schließen</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="space-y-4" id="allergen-modal-description">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Beschreibung:
                    </h4>
                    <p className="text-sm text-gray-600">
                      {allergen.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Enthalten in:
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg" role="region" aria-label="Zutatenliste">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {allergenDetails}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" role="region" aria-label="Wichtiger Hinweis">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      ℹ️ Hinweis:
                    </h4>
                    <p className="text-xs text-blue-800">
                      Bei Fragen zu Allergenen wenden Sie sich bitte an unser Personal.
                      Wir beraten Sie gerne bei der Auswahl geeigneter Gerichte.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
                    onClick={onClose}
                    aria-label="Allergen-Information verstanden und schließen"
                  >
                    Verstanden
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
