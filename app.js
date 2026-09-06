(() => {

  const API = window.API_URL;

  let service = "midi";


  const $ = (id) =>
    document.getElementById(id);


  /* =========================
     CHOIX MIDI / SOIR
  ========================= */

  document
    .querySelectorAll(".service")
    .forEach((button) => {

      button.addEventListener("click", () => {

        service =
          button.dataset.service;

        document
          .querySelectorAll(".service")
          .forEach((b) =>
            b.classList.remove("active")
          );

        button.classList.add("active");

        $("result")
          .classList.add("hidden");

        $("message").textContent = "";

      });

    });


  /* =========================
     OUVRIR LA BOÎTE
  ========================= */

  $("openBox")
    .addEventListener("click", async () => {

      const prenom =
        $("prenom").value.trim();


      $("message").textContent = "";

      $("result")
        .classList.add("hidden");


      if (!prenom) {

        $("message").textContent =
          "⚠️ Indique ton prénom.";

        return;

      }


      if (API.includes("COLLER_ICI")) {

        $("message").textContent =
          "⚠️ Le serveur n'est pas configuré.";

        return;

      }


      const button =
        $("openBox");


      button.disabled = true;

      button.textContent =
        "🎲 TIRAGE EN COURS...";


      try {

        const data =
          await api(
            "assign",
            {
              prenom: prenom,
              service: service
            }
          );


        $("task").textContent =
          data.task;


        $("resultMeta").textContent =
          service === "midi"
            ? "🍽️ Service du midi"
            : "🌙 Service du soir";


        $("result")
          .classList.remove("hidden");


        $("message").textContent =
          "✅ Attribution enregistrée.";


        $("prenom").value = "";


      } catch (error) {

        $("message").textContent =
          "⚠️ " + error.message;

      }


      button.disabled = false;

      button.textContent =
        "🎁 OUVRIR MA BOÎTE";

    });


  /* =========================
     COMMUNICATION SERVEUR
  ========================= */

  async function api(
    action,
    params = {}
  ) {

    const query =
      new URLSearchParams({

        action,

        ...params

      });


    const response =
      await fetch(
        API + "?" + query.toString()
      );


    const data =
      await response.json();


    if (!data.ok) {

      throw new Error(
        data.error ||
        "Une erreur est survenue."
      );

    }


    return data;

  }


})();
