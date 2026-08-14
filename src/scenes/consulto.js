/**
 * 08 · CONSULTO — validazione a misura di scheda clinica.
 *
 * Il modulo non è collegato a un backend: questo è il livello di
 * presentazione. Perché non sembri funzionante quando non lo è, la
 * conferma dice esplicitamente cosa è successo.
 */
export function initConsulto() {
  const form = document.querySelector("[data-consulto]");
  if (!form) return;

  const esito = form.querySelector("[data-consulto-esito]");
  const originale = esito?.textContent;

  const segnala = (campo, messaggio) => {
    const box = campo.closest(".campo");
    if (!box) return;
    if (messaggio) {
      box.setAttribute("data-errore", messaggio);
      campo.setAttribute("aria-invalid", "true");
    } else {
      box.removeAttribute("data-errore");
      campo.removeAttribute("aria-invalid");
    }
  };

  form.addEventListener("input", (e) => {
    if (e.target.matches("input, textarea")) segnala(e.target, null);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = form.querySelector("#c-nome");
    const email = form.querySelector("#c-email");
    let primo = null;

    if (!nome.value.trim()) {
      segnala(nome, "campo obbligatorio");
      primo ||= nome;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
      segnala(email, email.value.trim() ? "indirizzo non valido" : "campo obbligatorio");
      primo ||= email;
    }

    if (primo) {
      primo.focus();
      return;
    }

    if (esito) {
      esito.textContent =
        "Questo è un sito dimostrativo: la scheda non è stata inviata a nessuno.";
      esito.classList.add("tech--accent");
      setTimeout(() => {
        esito.textContent = originale;
        esito.classList.remove("tech--accent");
      }, 6000);
    }
  });
}
