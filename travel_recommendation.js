document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const clearButton = document.getElementById("clearButton");

  if (!searchInput || !searchButton || !clearButton) {
    console.error("Les éléments de recherche sont introuvables.");
    return;
  }

  /*
   * Création automatique de la zone des résultats.
   * Elle est placée dans le body sans modifier la navigation.
   */
  let resultsContainer = document.getElementById(
    "recommendationResults"
  );

  if (!resultsContainer) {
    resultsContainer = document.createElement("section");
    resultsContainer.id = "recommendationResults";
    resultsContainer.className = "recommendation-results";

    document.body.appendChild(resultsContainer);
  }

  let recommendationsData = {};

  /*
   * Chargement des données avec fetch()
   */
  fetch("./travel_recommendation_api.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du fichier JSON.");
      }

      return response.json();
    })
    .then((data) => {
      recommendationsData = data;
    })
    .catch((error) => {
      console.error(error);
      displayMessage("Impossible de charger les recommandations.");
    });

  /*
   * Normalisation du mot-clé :
   * BEACH, Beach, beaches, etc. deviennent "beach".
   */
  function normalizeKeyword(keyword) {
    return keyword
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/s$/, "");
  }

  /*
   * Recherche des résultats correspondant au mot-clé.
   */
  function searchRecommendations() {
    const keyword = normalizeKeyword(searchInput.value);

    resultsContainer.innerHTML = "";

    if (!keyword) {
      displayMessage("Veuillez saisir un mot-clé.");
      return;
    }

    let results = [];

    if (keyword === "beach") {
      results = recommendationsData.beaches || [];
    } else if (keyword === "temple") {
      results = recommendationsData.temples || [];
    } else if (keyword === "country") {
      results = getCountryCities();
    } else {
      displayMessage(
        'Veuillez rechercher "beach", "temple" ou "country".'
      );
      return;
    }

    if (results.length === 0) {
      displayMessage("Aucun résultat trouvé.");
      return;
    }

    displayResults(results);
  }

  /*
   * Les pays du fichier JSON contiennent généralement
   * un tableau de villes.
   */
  function getCountryCities() {
    const countries = recommendationsData.countries || [];
    const cities = [];

    countries.forEach((country) => {
      if (Array.isArray(country.cities)) {
        country.cities.forEach((city) => {
          cities.push(city);
        });
      }
    });

    return cities;
  }

  /*
   * Affichage des cartes de résultats.
   */
  function displayResults(results) {
    resultsContainer.innerHTML = `
      <h2 class="results-title">Search Results</h2>
      <div class="results-list"></div>
    `;

    const resultsList = resultsContainer.querySelector(".results-list");

    results.forEach((recommendation) => {
      const card = document.createElement("article");
      card.className = "recommendation-card";

      const image = recommendation.imageUrl || "";
      const name = recommendation.name || "Destination";
      const description = recommendation.description || "";

      card.innerHTML = `
        <img
          class="recommendation-image"
          src="${image}"
          alt="${name}"
        >

        <div class="recommendation-info">
          <h3>${name}</h3>
          <p>${description}</p>
        </div>
      `;

      resultsList.appendChild(card);
    });
  }

  /*
   * Affichage d'un message.
   */
  function displayMessage(message) {
    resultsContainer.innerHTML = `
      <p class="search-message">${message}</p>
    `;
  }

  /*
   * Bouton Search de la navigation.
   */
  searchButton.addEventListener("click", searchRecommendations);

  /*
   * Recherche avec la touche Entrée.
   */
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchRecommendations();
    }
  });

  /*
   * Bouton Clear de la navigation.
   */
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
  });
});
