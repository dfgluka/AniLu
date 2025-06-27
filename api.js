// Отримання популярних аніме
export async function getPopularAnime() {
    try {
        const response = await fetch('https://shikimori.one/api/animes?order=popularity&limit=12');
        return await response.json();
    } catch (error) {
        console.error('Помилка завантаження аніме:', error);
        return [];
    }
}

// Пошук аніме
export async function searchAnime(query) {
    try {
        const response = await fetch(`https://shikimori.one/api/animes?search=${encodeURIComponent(query)}`);
        return await response.json();
    } catch (error) {
        console.error('Помилка пошуку:', error);
        return [];
    }
}

// Деталі аніме
export async function getAnimeDetails(id) {
    try {
        const response = await fetch(`https://shikimori.one/api/animes/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Помилка завантаження деталей:', error);
        return null;
    }
}
