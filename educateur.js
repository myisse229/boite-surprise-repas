(() => {

  const API = window.API_URL;

  let pin = "";


  const $ = (id) =>
    document.getElementById(id);


  /* =========================
     DATE DU JOUR
  ========================= */

  const dateLabel =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );


  /* =========================
     CONNEXION
  ========================= */

  $("loginBtn")
    .addEventListener(
      "click",
      login
    );


  $("pin")
    .addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter"
        ) {

          login();

        }

      }
    );


  async function login() {

    const entered =
      $("pin").value.trim();


    $("loginMessage")
      .textContent = "";


    if (!entered) {

      $("loginMessage")
        .textContent =
        "⚠️ Saisis le PIN.";

      return;

    }


    try {

      await api(
        "auth",
        {
          pin: entered
        }
      );


      pin = entered;


      $("loginCard")
        .classList
        .add("hidden");


      $("dashboard")
        .classList
        .remove("hidden");


      $("todayLabel")
        .textContent =
        dateLabel.format(
          new Date()
        );


      await load();


    } catch (error) {

      $("loginMessage")
        .textContent =
        "❌ " + error.message;

    }

  }


  /* =========================
     CHARGEMENT
  ========================= */

  async function load() {

    try {

      const data =
        await api(
          "list",
          {
            pin: pin
          }
        );


      const rows =
        data.rows || [];


      render(
        "midi",
        rows.filter(
          row =>
            row.service === "midi"
        )
      );


      render(
        "soir",
        rows.filter(
          row =>
            row.service === "soir"
        )
      );


      renderTasks(
        data.tasks || {}
      );


    } catch (error) {

      alert(
        error.message
      );

    }

  }


  /* =========================
     AFFICHAGE DES TABLEAUX
  ========================= */

  function render(
    service,
    list
  ) {

    const body =
      $(service + "Body");


    const empty =
      $(service + "Empty");


    body.innerHTML = "";


    empty.classList.toggle(
      "hidden",
      list.length > 0
    );


    list.forEach(
      row => {

        const tr =
          document.createElement(
            "tr"
          );


        const status =
          row.done === true ||
          row.done === "true";


        tr.innerHTML = `

          <td>
            <strong>
              ${escapeHtml(
                row.prenom
              )}
            </strong>
          </td>

          <td>
            ${escapeHtml(
              row.task
            )}
          </td>

          <td>
            ${
              status
                ? "✅ FAIT"
                : "⏳ À FAIRE"
            }
          </td>

          <td>

            <button
              class="small-btn"
              data-id="${
                escapeHtml(
                  row.id
                )
              }"
            >

              ${
                status
                  ? "↩️ À faire"
                  : "✅ Fait"
              }

            </button>

          </td>

        `;


        tr
          .querySelector(
            "button"
          )
          .addEventListener(
            "click",
            async () => {

              try {

                await api(
                  "toggle",
                  {
                    pin: pin,
                    id: row.id
                  }
                );


                await load();


              } catch (error) {

                alert(
                  error.message
                );

              }

            }
          );


        body.appendChild(
          tr
        );

      }
    );

  }


  /* =========================
     LISTE DES TÂCHES
  ========================= */

  function renderTasks(
    tasks
  ) {

    const container =
      $("taskList");


    container.innerHTML = "";


    ["midi", "soir"]
      .forEach(
        service => {

          const title =
            document.createElement(
              "div"
            );


          title.style.width =
            "100%";


          title.style.fontWeight =
            "800";


          title.style.marginTop =
            "8px";


          title.textContent =
            service === "midi"
              ? "🍽️ MIDI"
              : "🌙 SOIR";


          container.appendChild(
            title
          );


          (
            tasks[service] || []
          ).forEach(
            task => {

              const chip =
                document.createElement(
                  "span"
                );


              chip.className =
                "task-chip";


              chip.textContent =
                task;


              container.appendChild(
                chip
              );

            }
          );

        }
      );

  }


  /* =========================
     ACTUALISER
  ========================= */

  $("refreshBtn")
    .addEventListener(
      "click",
      load
    );


  /* =========================
     IMPRIMER
  ========================= */

  $("printBtn")
    .addEventListener(
      "click",
      () => {

        window.print();

      }
    );


  /* =========================
     RÉINITIALISER
  ========================= */

  $("resetBtn")
    .addEventListener(
      "click",
      resetToday
    );


  async function resetToday() {

    const confirmation =
      confirm(
        "Réinitialiser toutes les attributions d'aujourd'hui ?"
      );


    if (!confirmation) {

      return;

    }


    try {

      await api(
        "reset",
        {
          pin: pin
        }
      );


      await load();


    } catch (error) {

      alert(
        error.message
      );

    }

  }


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
        API +
        "?" +
        query.toString()
      );


    const data =
      await response.json();


    if (!data.ok) {

      throw new Error(
        data.error ||
        "Erreur serveur."
      );

    }


    return data;

  }


  /* =========================
     SÉCURITÉ AFFICHAGE
  ========================= */

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(
        /[&<>"']/g,
        character => ({

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        }[character])
      );

  }

})();
