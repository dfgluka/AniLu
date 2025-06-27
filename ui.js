import { getPopularAnime, searchAnime } from './api.js';

// Відображення аніме-карток
export function renderAnimeGrid(animeList) {
    const grid = document.getElementById('anime-grid');
    grid.innerHTML = '';

    animeList.forEach(anime => {
        const animeCard = document.createElement('a');
        animeCard.href = `anime.html?id=${anime.id}`;
        animeCard.className = 'anime-card';
        animeCard.innerHTML = `
            <img src="https://shikimori.one${anime.image.original}" alt="${anime.name}">
            <h3>${anime.russian || anime.name}</h3>
        `;
        grid.appendChild(animeCard);
    });
}

// Пошук
document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if (query) {
        const results = await searchAnime(query);
        renderAnimeGrid(results);
    }
});

// Завантаження популярних аніме при старті
window.addEventListener('DOMContentLoaded', async () => {
    const popularAnime = await getPopularAnime();
    renderAnimeGrid(popularAnime);
});
