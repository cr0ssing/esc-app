import { SOURCE_CODE_URL } from "../config/legal";
import { LegalPage } from "./LegalPage";

export function DatenschutzView() {
  return (
    <LegalPage label="Rechtliches" title="Datenschutz">
      <p>
        Diese Hinweise beschreiben die Verarbeitung personenbezogener Daten beim Besuch und der Nutzung von ESC 2026.
        Verantwortliche Stelle ist der im Impressum genannte Anbieter.
      </p>

      <section className="grid gap-2">
        <h3>1. Verarbeitete Daten</h3>
        <ul>
          <li>
            <strong>Lokale Speicherung (localStorage):</strong> Deine persönliche Wertung (Punkte, Notizen, Ranking)
            wird im Browser gespeichert, damit deine Eingaben erhalten bleiben.
          </li>
          <li>
            <strong>Technisch notwendiges Cookie:</strong> Bei Nutzung der Watchparty wird ein Session-Cookie
            (<code className="text-foreground">esc_session</code>) gesetzt, um deine Teilnahme serverseitig zuzuordnen.
          </li>
          <li>
            <strong>Watchparty-Daten:</strong> Anzeigename und Wertungsdaten werden an den Backend-Server
            übermittelt, den der Betreiber dieser App betreibt.
          </li>
          <li>
            <strong>PWA / Service Worker:</strong> Beim Installieren als App können App-Dateien im Browser-Cache
            gespeichert werden, damit die Anwendung offline nutzbar ist.
          </li>
        </ul>
        <p>Es werden keine Analyse-, Marketing- oder Tracking-Cookies eingesetzt.</p>
      </section>

      <section className="grid gap-2">
        <h3>2. Zwecke und Rechtsgrundlagen</h3>
        <ul>
          <li>
            Bereitstellung der Voting-Funktion und Speicherung deiner Eingaben (Art. 6 Abs. 1 lit. b DSGVO — Vertrag /
            vorvertragliche Maßnahmen bzw. Nutzung auf Anfrage).
          </li>
          <li>
            Watchparty-Synchronisation (Art. 6 Abs. 1 lit. b DSGVO).
          </li>
          <li>
            Technisch notwendige Cookies und Cache (Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse an einem
            sicheren, funktionsfähigen Betrieb; § 25 Abs. 2 Nr. 2 TDDDG).
          </li>
        </ul>
      </section>

      <section className="grid gap-2">
        <h3>3. Speicherdauer</h3>
        <p>
          Lokale Wertungsdaten bleiben gespeichert, bis du sie im Browser löschst. Das Session-Cookie der Watchparty
          läuft nach 30 Tagen ab oder wird beim Verlassen der Watchparty gelöscht. Serverseitige Watchparty-Daten
          werden vom Betreiber nach [Speicherdauer / Löschfrist eintragen] gelöscht.
        </p>
      </section>

      <section className="grid gap-2">
        <h3>4. Empfänger und Drittanbieter</h3>
        <p>
          Beim Aufruf externer Links (z. B. Eurovision-Teilnehmerseiten, YouTube, Spotify) gelten die Datenschutzbestimmungen
          der jeweiligen Anbieter. Bilder können von externen Servern geladen werden.
        </p>
      </section>

      <section className="grid gap-2">
        <h3>5. Deine Rechte</h3>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
          und Widerspruch gegen die Verarbeitung, soweit die gesetzlichen Voraussetzungen erfüllt sind, sowie das Recht
          auf Beschwerde bei einer Aufsichtsbehörde.
        </p>
      </section>

      <section className="grid gap-2">
        <h3>6. Quellcode</h3>
        <p>
          Der Quellcode dieser Anwendung ist unter der GNU Affero General Public License (AGPL-3.0) veröffentlicht:{" "}
          <a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer">
            {SOURCE_CODE_URL}
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
