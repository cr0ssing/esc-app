import { getImpressConfig } from "../lib/runtimeConfig";
import { LegalPage } from "./LegalPage";

function AddressLines({ address }: { address: string }) {
  const lines = address.split("\n").filter((line) => line.length > 0);
  if (lines.length === 0) {
    return <p>[Anschrift]</p>;
  }
  return lines.map((line, index) => <p key={index}>{line}</p>);
}

export function ImpressumView() {
  const impress = getImpressConfig();

  return (
    <LegalPage label="Rechtliches" title="Impressum">
      <p>Angaben gemäß § 5 TMG und § 18 Abs. 2 MStV.</p>

      <section className="grid gap-2">
        <h3>Anbieter</h3>
        {impress ? (
          <>
            <p>{impress.name}</p>
            <AddressLines address={impress.address} />
          </>
        ) : (
          <>
            <p>[Name / Firma]</p>
            <p>[Straße und Hausnummer]</p>
            <p>[PLZ Ort]</p>
            <p>[Land]</p>
          </>
        )}
      </section>

      <section className="grid gap-2">
        <h3>Kontakt</h3>
        {impress ? <p>E-Mail: {impress.email}</p> : <p>E-Mail: [E-Mail-Adresse]</p>}
      </section>

      <section className="grid gap-2">
        <h3>Verantwortlich für den Inhalt</h3>
        {impress ? (
          <>
            <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: {impress.name}</p>
            <AddressLines address={impress.address} />
          </>
        ) : (
          <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: [Name, Anschrift wie oben]</p>
        )}
      </section>

      <section className="grid gap-2">
        <h3>EU-Streitschlichtung</h3>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben.
        </p>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </LegalPage>
  );
}
