// Конфігурація Supabase
const supabaseUrl = 'ВАШ_SUPABASE_URL';
const supabaseKey = 'ВАШ_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Елементи DOM
const animeList = document.getElementById('anime-list');
const searchInput = document.getElementById('search-input');

// Завантаження аніме при старті
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnime();
});

// Функція завантаження аніме
async function loadAnime(searchQuery = '') {
    animeList.innerHTML = '<div class="skeleton">Завантаження...</div>';
    
    let query = supabase
        .from('anime')
        .select('*')
        .order('title', { ascending: true });

    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Помилка завантаження:', error);
        animeList.innerHTML = '<div class="error">Помилка завантаження</div>';
        return;
    }

    renderAnimeList(data);
}

// Відображення списку аніме
function renderAnimeList(animeData) {
    animeList.innerHTML = '';

    animeData.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="${anime.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${anime.title}">
            <h3>${anime.title}</h3>
        `;
        
        card.addEventListener('click', () => {
            openPlayer(anime.id);
        });

        animeList.appendChild(card);
    });
}

// Пошук аніме
function searchAnime() {
    const query = searchInput.value.trim();
    loadAnime(query);
}

// Відкриття плеєра
async function openPlayer(animeId) {
    // Отримуємо посилання на відео (приклад)
    const videoUrl = await getVideoUrl(animeId); 
    
    const player = document.getElementById('anime-player');
    const overlay = document.getElementById('player-overlay');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, () => player.play());
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = videoUrl;
        player.addEventListener('loadedmetadata', () => player.play());
    }

    overlay.style.display = 'block';
}

// Закриття плеєра
function closePlayer() {
    const player = document.getElementById('anime-player');
    player.pause();
    document.getElementById('player-overlay').style.display = 'none';
}

// Функція для отримання посилання на відео (замініть на реальну логіку)
async function getVideoUrl(animeId) {
    // Тут ви можете:
    // 1. Використовувати Consumet API
    // 2. Брати посилання з вашої бази даних
    // 3. Використовувати WebTorrent
    
    // Приклад для тесту:
    return 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
}
