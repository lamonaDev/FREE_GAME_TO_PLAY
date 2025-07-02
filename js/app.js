'use strict';
const mainCardsContainer = document.getElementById("mainCardsContainer");
const mainModalsContainer = document.getElementById("mainModalsContainer");
const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 hour
const getCachedData = (CAT = "") => {
    const cacheKey = `games_data_${CAT || 'all'}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRATION) return data;
    }
    return null;
};
const setCachedData = (data, CAT = "") => {
    const cacheKey = `games_data_${CAT || 'all'}`;
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
};
const getAllGamesOnLoad = async (CAT = "") => {
    try {
        const cachedData = getCachedData(CAT);
        if (cachedData) { renderGames(cachedData); return; }
        const URL = `https://free-to-play-games-database.p.rapidapi.com/api/games${CAT ? `?category=${CAT}` : ''}`;
        console.log(`Fetching URL: ${URL}`);
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                Accept: "application/json",
                'x-rapidapi-key': '5acd7f32abmsh8e27b45f5a3a4f7p1e56d1jsn70e32897ee94',
                'x-rapidapi-host': 'free-to-play-games-database.p.rapidapi.com'
            }
        });
        const data = await response.json(); setCachedData(data, CAT); renderGames(data);
    } catch (error) {
        throw new Error(error);
    }
};
const renderGames = (games) => {
    let cardsHTML = ''; let modalsHTML = '';
    games.forEach(element => {
        cardsHTML += `
            <div class="col-lg-3 col-md-6 col-sm-12">
                <div class="card card-fixed-height" role="button" data-bs-toggle="modal" data-bs-target="#modal-${element.id}">
                    <img src="${element.thumbnail}" class="card-img-top" alt="${element.title}" loading="lazy">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">${element.title}</h5>
                            <button class="btn btn-free">Free</button>
                        </div>
                        <p class="developer mt-2">${element.short_description}</p>
                        <div class="platforms">
                            <span class="badge badge-custom">${element.platform}</span>
                        </div>
                        <div class="genres">
                            <span class="badge badge-custom">${element.genre}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modalsHTML += `
            <div class="modal fade" id="modal-${element.id}" tabindex="-1" aria-labelledby="modal-${element.title.toLowerCase().trim()}-label" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modal-${element.title.toLowerCase().trim()}-label">${element.title}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <img src="${element.thumbnail}" class="game-image img-fluid" alt="${element.title}" loading="lazy">
                            <div class="text-content">
                                <h6>Title: ${element.title}</h6>
                                <div class="detail"><span class="label">Category:</span> <span class="badge badge-custom">${element.genre}</span></div>
                                <div class="detail"><span class="label">Platform:</span> <span class="badge badge-custom">${element.platform}</span></div>
                                <div class="detail"><span class="label">Status:</span> <span class="badge badge-custom">LIVE</span></div>
                                <p class="description">${element.short_description}</p>
                                <button class="btn btn-free mt-2"><a href="${element.freetogame_profile_url}" target="_blank">Show Game</a></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    mainCardsContainer.innerHTML = cardsHTML;
    mainModalsContainer.innerHTML = modalsHTML;
};
window.addEventListener("DOMContentLoaded", () => {
    getAllGamesOnLoad();
    const navBar = document.querySelector('#navbarNav');
    if (navBar) {
        navBar.addEventListener('click', (event) => {
            const li = event.target.closest('li');
            if (li) {
                const navLink = li.querySelector('.nav-link');
                if (navLink) {
                    event.preventDefault();
                    const linkText = navLink.textContent.toLowerCase().trim();
                    getAllGamesOnLoad(linkText);
                }
            }
        });
    } else  {
        throw new Error("INVAILD OPERATION");
    }
});