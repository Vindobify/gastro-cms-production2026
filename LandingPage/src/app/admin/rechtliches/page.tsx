'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save, Wand2, X, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false })

type TabType = 'impressum' | 'datenschutz'

interface GeneratorData {
  name: string
  rechtsform: string
  strasse: string
  plz: string
  ort: string
  telefon: string
  email: string
  website: string
  uid: string
  fn_nummer: string
  firmenbuchgericht: string
  gewerbe: string
  behoerde: string
  inhaber: string
}

function generateImpressum(d: GeneratorData): string {
  return `<h1>Impressum</h1>

<p>Informationspflicht laut § 5 E-Commerce Gesetz, § 14 Unternehmensgesetzbuch, § 63 Gewerbeordnung und Offenlegungspflicht laut § 25 Mediengesetz.</p>

<h2>Angaben zum Unternehmen</h2>
<p>
  <strong>${d.name}</strong><br>
  ${d.rechtsform ? d.rechtsform + '<br>' : ''}
  ${d.inhaber ? 'Inhaber: ' + d.inhaber + '<br>' : ''}
  ${d.strasse}<br>
  ${d.plz} ${d.ort}<br>
  Österreich
</p>

<h2>Kontakt</h2>
<p>
  <strong>Telefon:</strong> ${d.telefon}<br>
  <strong>E-Mail:</strong> <a href="mailto:${d.email}">${d.email}</a><br>
  <strong>Website:</strong> <a href="${d.website}" target="_blank" rel="noopener noreferrer">${d.website}</a>
</p>

${d.uid ? `<h2>Umsatzsteuer-Identifikationsnummer</h2>\n<p>${d.uid}</p>\n` : ''}

${d.fn_nummer ? `<h2>Firmenbucheintrag</h2>\n<p>FN ${d.fn_nummer}${d.firmenbuchgericht ? ' · ' + d.firmenbuchgericht : ''}</p>\n` : ''}
<h2>Berufsrecht und Berufsbezeichnung</h2>
<p>
  <strong>Gewerbe:</strong> ${d.gewerbe}<br>
  <strong>Aufsichtsbehörde:</strong> ${d.behoerde || 'Magistrat der Stadt Wien'}<br>
  <strong>Berufsrecht:</strong> Gewerbeordnung: <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer">www.ris.bka.gv.at</a>
</p>

<h2>EU-Streitschlichtung</h2>
<p>Gemäß Verordnung über Online-Streitbeilegung in Verbraucherangelegenheiten (ODR-Verordnung) möchten wir Sie über die Online-Streitbeilegungsplattform (OS-Plattform) informieren.<br>
Verbraucher haben die Möglichkeit, Beschwerden an die Online Streitbeilegungsplattform der Europäischen Kommission unter <a href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=DE" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a> zu richten. Die dafür notwendige E-Mail-Adresse lautet: <a href="mailto:${d.email}">${d.email}</a></p>

<h2>Haftung für Inhalte dieser Website</h2>
<p>Wir entwickeln die Inhalte dieser Website ständig weiter und bemühen uns korrekte und aktuelle Informationen bereitzustellen. Leider können wir keine Haftung für die Korrektheit aller Inhalte auf dieser Website übernehmen, speziell für jene, die seitens Dritter bereitgestellt wurden. Sollten Ihnen problematische oder rechtswidrige Inhalte auffallen, bitten wir Sie uns umgehend zu kontaktieren, Sie finden die Angaben im Impressum.</p>

<h2>Haftung für Links auf dieser Website</h2>
<p>Unsere Website enthält Links zu anderen Websites für deren Inhalt wir nicht verantwortlich sind. Haftung für verlinkte Websites besteht für uns nicht, da wir keine Kenntnis rechtswidriger Tätigkeiten hatten und haben, uns solche Rechtswidrigkeiten auch bisher nicht aufgefallen sind und wir Links sofort entfernen würden, wenn uns Rechtswidrigkeiten bekannt werden.</p>

<h2>Urheberrechtshinweis</h2>
<p>Alle Inhalte dieser Webseite (Bilder, Fotos, Texte, Videos) unterliegen dem Urheberrecht. Bitte fragen Sie uns bevor Sie die Inhalte dieser Website verbreiten, vervielfältigen oder verwerten, wie zum Beispiel auf anderen Websites erneut veröffentlichen. Falls notwendig, werden wir die unerlaubte Nutzung von Teilen der Inhalte unserer Seite rechtlich verfolgen.</p>

<p><em>Alle Angaben ohne Gewähr. Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</em></p>`
}

function generateDatenschutz(d: GeneratorData): string {
  return `<h1>Datenschutzerklärung</h1>

<h2>1. Datenschutz auf einen Blick</h2>

<h3>Allgemeine Hinweise</h3>
<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.</p>

<h3>Datenerfassung auf dieser Website</h3>
<p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br>
Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.</p>

<h2>2. Hosting und Content Delivery Networks (CDN)</h2>
<p>Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.</p>

<h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

<h3>Datenschutz</h3>
<p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

<h3>Hinweis zur verantwortlichen Stelle</h3>
<p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
<p>
  <strong>${d.name}</strong><br>
  ${d.inhaber ? d.inhaber + '<br>' : ''}
  ${d.strasse}<br>
  ${d.plz} ${d.ort}<br>
  <br>
  Telefon: ${d.telefon}<br>
  E-Mail: <a href="mailto:${d.email}">${d.email}</a>
</p>
<p>Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.) entscheidet.</p>

<h3>Speicherdauer</h3>
<p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe.</p>

<h3>Ihre Rechte als betroffene Person</h3>
<p>Sie haben jederzeit das Recht:</p>
<ul>
  <li>unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)</li>
  <li>die Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
  <li>die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen (Art. 17 DSGVO)</li>
  <li>die Einschränkung der Datenverarbeitung zu verlangen (Art. 18 DSGVO)</li>
  <li>der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen (Art. 21 DSGVO)</li>
  <li>Ihre Daten in einem strukturierten, gängigen Format zu erhalten (Art. 20 DSGVO)</li>
</ul>
<p>Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden. Sie haben zudem das Recht, bei der zuständigen Aufsichtsbehörde Beschwerde einzulegen. In Österreich ist dies die <strong>Datenschutzbehörde</strong> (<a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer">www.dsb.gv.at</a>), Barichgasse 40-42, 1030 Wien.</p>

<h2>4. Datenerfassung auf dieser Website</h2>

<h3>Kontaktformular / Reservierungsanfragen</h3>
<p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
<p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist jederzeit widerrufbar.</p>
<p>Die von Ihnen im Kontaktformular eingegebenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z. B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere Aufbewahrungsfristen – bleiben unberührt.</p>

<h3>Anfrage per E-Mail oder Telefon</h3>
<p>Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>

<h2>5. Cookies</h2>
<p>Unsere Website verwendet technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind. Diese Cookies speichern keine personenbezogenen Daten und sind für die Grundfunktionen der Website notwendig. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des Browsers aktivieren.</p>

<h2>6. Plugins und Tools</h2>

<h3>Google Maps</h3>
<p>Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Zur Nutzung der Funktionen von Google Maps ist es notwendig, Ihre IP-Adresse zu speichern. Diese Informationen werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert. Der Anbieter dieser Seite hat keinen Einfluss auf diese Datenübertragung. Wenn Google Maps aktiviert ist, kann Google zum Zwecke der einheitlichen Darstellung der Schriftarten Google Web Fonts verwenden. Beim Aufruf von Google Maps lädt Ihr Browser die benötigten Web Fonts in ihren Browsercache, um Texte und Schriftarten korrekt anzuzeigen.</p>
<p>Die Nutzung von Google Maps erfolgt im Interesse einer ansprechenden Darstellung unserer Online-Angebote und an einer leichten Auffindbarkeit der von uns auf der Website angegebenen Orte. Dies stellt ein berechtigtes Interesse im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar.</p>
<p>Mehr Informationen zum Umgang mit Nutzerdaten finden Sie in der Datenschutzerklärung von Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></p>

<p><em>Stand: ${new Date().toLocaleDateString('de-AT', { month: 'long', year: 'numeric' })}</em></p>`
}

const defaultGeneratorData: GeneratorData = {
  name: '',
  rechtsform: 'Einzelunternehmen',
  strasse: '',
  plz: '1140',
  ort: 'Wien',
  telefon: '',
  email: '',
  website: 'https://pizzeria1140.at',
  uid: '',
  fn_nummer: '',
  firmenbuchgericht: '',
  gewerbe: 'Gastronomie (Gastgewerbe)',
  behoerde: 'Magistrat der Stadt Wien / Bezirkshauptmannschaft',
  inhaber: '',
}

export default function RechtlichesAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>('impressum')
  const [content, setContent] = useState({ impressum: '', datenschutz: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [genData, setGenData] = useState<GeneratorData>(defaultGeneratorData)

  useEffect(() => {
    Promise.all([
      fetch('/api/legal').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()).catch(() => []),
    ]).then(([pages, settingsArr]) => {
      const mapped = { impressum: '', datenschutz: '' }
      for (const p of pages) {
        if (p.type === 'impressum') mapped.impressum = p.content || ''
        if (p.type === 'datenschutz') mapped.datenschutz = p.content || ''
      }
      setContent(mapped)

      // Pre-fill generator from settings
      if (settingsArr && typeof settingsArr === 'object' && !Array.isArray(settingsArr)) {
        const s = settingsArr as Record<string, string>
        setGenData(prev => ({
          ...prev,
          name: s.restaurant_name || prev.name,
          telefon: s.restaurant_phone || prev.telefon,
          email: s.restaurant_email || prev.email,
          strasse: s.restaurant_strasse || s.restaurant_address || prev.strasse,
          plz: s.restaurant_plz || prev.plz,
          ort: s.restaurant_ort || prev.ort,
          inhaber: s.inhaber_name || prev.inhaber,
          rechtsform: s.rechtsform || prev.rechtsform,
          uid: s.atu_nummer || prev.uid,
          fn_nummer: s.fn_nummer || prev.fn_nummer,
          firmenbuchgericht: s.firmenbuchgericht || prev.firmenbuchgericht,
          gewerbe: s.gewerbe || prev.gewerbe,
          behoerde: s.behoerde || prev.behoerde,
          website: s.restaurant_website || prev.website,
        }))
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, content: content[activeTab] }),
      })
      if (res.ok) {
        toast.success(`${activeTab === 'impressum' ? 'Impressum' : 'Datenschutz'} gespeichert`)
      } else {
        toast.error('Fehler beim Speichern')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = () => {
    const impressum = generateImpressum(genData)
    const datenschutz = generateDatenschutz(genData)
    setContent({ impressum, datenschutz })
    setShowGenerator(false)
    toast.success('Impressum & Datenschutz wurden generiert!')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Rechtliches</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Wand2 size={18} /> Generator
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Save size={18} /> {saving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['impressum', 'datenschutz'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            {tab === 'impressum' ? 'Impressum' : 'Datenschutz'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <RichEditor
          key={activeTab}
          value={content[activeTab]}
          onChange={val => setContent(c => ({ ...c, [activeTab]: val }))}
        />
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Wand2 size={20} className="text-green-600" /> Impressum & Datenschutz Generator</h2>
                <p className="text-sm text-gray-500 mt-0.5">Österreich-konform nach ECG, MedienG & DSGVO</p>
              </div>
              <button onClick={() => setShowGenerator(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unternehmensname *</label>
                  <input value={genData.name} onChange={e => setGenData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Pizzeria Da Corrado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rechtsform</label>
                  <select value={genData.rechtsform} onChange={e => setGenData(p => ({ ...p, rechtsform: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Einzelunternehmen</option>
                    <option>GmbH</option>
                    <option>OG</option>
                    <option>KG</option>
                    <option>e.U.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inhaber / Geschäftsführer</label>
                  <input value={genData.inhaber} onChange={e => setGenData(p => ({ ...p, inhaber: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Max Mustermann" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Straße & Hausnummer *</label>
                  <input value={genData.strasse} onChange={e => setGenData(p => ({ ...p, strasse: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Musterstraße 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PLZ *</label>
                  <input value={genData.plz} onChange={e => setGenData(p => ({ ...p, plz: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="1140" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ort *</label>
                  <input value={genData.ort} onChange={e => setGenData(p => ({ ...p, ort: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Wien" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                  <input value={genData.telefon} onChange={e => setGenData(p => ({ ...p, telefon: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="+43 1 ..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                  <input value={genData.email} onChange={e => setGenData(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="office@..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input value={genData.website} onChange={e => setGenData(p => ({ ...p, website: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ATU-Nummer (UID, optional)</label>
                  <input value={genData.uid} onChange={e => setGenData(p => ({ ...p, uid: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="ATU12345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firmenbuchnummer FN (optional)</label>
                  <input value={genData.fn_nummer} onChange={e => setGenData(p => ({ ...p, fn_nummer: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="123456a" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firmenbuchgericht</label>
                  <input value={genData.firmenbuchgericht} onChange={e => setGenData(p => ({ ...p, firmenbuchgericht: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Handelsgericht Wien" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gewerbe / Branche</label>
                  <input value={genData.gewerbe} onChange={e => setGenData(p => ({ ...p, gewerbe: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Gastronomie (Gastgewerbe)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gewerbebehörde</label>
                  <input value={genData.behoerde} onChange={e => setGenData(p => ({ ...p, behoerde: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Magistrat der Stadt Wien" />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <strong>Hinweis:</strong> Dieser Generator erstellt einen rechtlichen Basistext für Österreich. Für eine rechtssichere Prüfung empfehlen wir die Beratung durch einen Rechtsanwalt oder Notar.
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowGenerator(false)} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors">Abbrechen</button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors"
                >
                  <Wand2 size={18} /> Generieren <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
