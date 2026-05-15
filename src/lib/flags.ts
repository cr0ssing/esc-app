import al from "flag-icons/flags/4x3/al.svg";
import at from "flag-icons/flags/4x3/at.svg";
import au from "flag-icons/flags/4x3/au.svg";
import be from "flag-icons/flags/4x3/be.svg";
import bg from "flag-icons/flags/4x3/bg.svg";
import cy from "flag-icons/flags/4x3/cy.svg";
import cz from "flag-icons/flags/4x3/cz.svg";
import de from "flag-icons/flags/4x3/de.svg";
import dk from "flag-icons/flags/4x3/dk.svg";
import fi from "flag-icons/flags/4x3/fi.svg";
import fr from "flag-icons/flags/4x3/fr.svg";
import gb from "flag-icons/flags/4x3/gb.svg";
import gr from "flag-icons/flags/4x3/gr.svg";
import hr from "flag-icons/flags/4x3/hr.svg";
import il from "flag-icons/flags/4x3/il.svg";
import it from "flag-icons/flags/4x3/it.svg";
import lt from "flag-icons/flags/4x3/lt.svg";
import md from "flag-icons/flags/4x3/md.svg";
import mt from "flag-icons/flags/4x3/mt.svg";
import no from "flag-icons/flags/4x3/no.svg";
import pl from "flag-icons/flags/4x3/pl.svg";
import ro from "flag-icons/flags/4x3/ro.svg";
import rs from "flag-icons/flags/4x3/rs.svg";
import se from "flag-icons/flags/4x3/se.svg";
import ua from "flag-icons/flags/4x3/ua.svg";

const flags: Record<string, string> = {
  al,
  at,
  au,
  be,
  bg,
  cy,
  cz,
  de,
  dk,
  fi,
  fr,
  gb,
  gr,
  hr,
  il,
  it,
  lt,
  md,
  mt,
  no,
  pl,
  ro,
  rs,
  se,
  ua,
};

export function getFlagUrl(countryCode: string) {
  return flags[countryCode];
}
