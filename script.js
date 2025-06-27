// Ініціалізація Supabase
const supabaseUrl = 'https://ymkzolqrqbwbfkfsbimd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3pvbHFycWJ3YmZrZnNiaW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODMzOTUsImV4cCI6MjA2NjU1OTM5NX0.1Ds6AAm-fCMVcdy7ZF0ionf5Q-pRVJFktXXXt15y7Mk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Глобальні змінні
let currentUser = null;
let currentAnime = null;

// Завантаження даних при старті
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadAnime();
});

// ====================== АВТОРИЗАЦІЯ ======================
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    updateAuthUI();
}

function updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    
    if (currentUser) {
        authSection.innerHTML = `
            <button onclick="logout()">Вийти</button>
            <button onclick="showProfile()">Профіль</button>
        `;
    } else {
        authSection.innerHTML = `
            <button onclick="loginWithGoogle()">Увійти через Google</button>
        `;
    }
}

async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
}

async function logout() {
    await supabase.auth.signOut();
    location.reload();
}

// ====================== АНІМЕ ======================
async function loadAnime(searchQuery = '') {
    const animeList = document.getElementById('anime-list');
    animeList.innerHTML = '<div class="skeleton">Завантаження...</div>';
    
    let query = supabase
        .from('anime')
        .select(`
            *,
            user_favorites (user_id)
        `);
    
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Помилка:', error);
        animeList.innerHTML = '<div class="error">Помилка завантаження</div>';
        return;
    }

    renderAnimeList(data);
}

function renderAnimeList(animeData) {
    const animeList = document.getElementById('anime-list');
    animeList.innerHTML = '';

    animeData.forEach(anime => {
        const isFav = currentUser && anime.user_favorites.some(fav => fav.user_id === currentUser.id);
        
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="${anime.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${anime.title}">
            <div class="anime-info">
                <h3>${anime.title}</h3>
                <p>${anime.year} • ${anime.status}</p>
                <button onclick="toggleFavorite(event, ${anime.id})">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
        `;
        
        card.addEventListener('click', () => showAnimeDetails(anime.id));
        animeList.appendChild(card);
    });
}

// ====================== ОБРАНЕ ======================
async function toggleFavorite(event, animeId) {
    event.stopPropagation();
    
    if (!currentUser) return alert('Увійдіть у акаунт!');
    
    const { error } = await supabase
        .from('user_favorites')
        .upsert({
            user_id: currentUser.id,
            anime_id: animeId
        }, {
            onConflict: ['user_id', 'anime_id']
        });
    
    if (error) alert('Помилка: ' + error.message);
    else loadAnime(); // Оновлюємо список
}

// ====================== ПЛЕЄР ======================
async function showAnimeDetails(animeId) {
    const { data: anime } = await supabase
        .from('anime')
        .select('*')
        .eq('id', animeId)
        .single();

    const { data: episodes } = await supabase
        .from('episodes')
        .select('*')
        .eq('anime_id', animeId)
        .order('number', { ascending: true });

    currentAnime = anime;
    
    // Оновлюємо інтерфейс плеєра
    document.getElementById('player-overlay').style.display = 'block';
    const episodeList = document.getElementById('episode-list');
    episodeList.innerHTML = '';
    
    episodes.forEach(ep => {
        const btn = document.createElement('button');
        btn.className = 'episode-btn';
        btn.textContent = `Серія ${ep.number}`;
        btn.onclick = () => playEpisode(ep.video_url);
        episodeList.appendChild(btn);
    });
    
    if (episodes.length > 0) {
        playEpisode(episodes[0].video_url);
    }
}

function playEpisode(videoUrl) {
    const player = document.getElementById('anime-player');
    
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(player);
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = videoUrl;
    }
    
    player.play();
}

function closePlayer() {
    document.getElementById('player-overlay').style.display = 'none';
    const player = document.getElementById('anime-player');
    player.pause();
    player.src = '';
}

// ====================== ПОШУК ======================
function searchAnime() {
    const query = document.getElementById('search-input').value.trim();
    loadAnime(query);
}

// ====================== ПРОФІЛЬ ======================
async function showProfile() {
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

    alert(`Профіль: ${profile?.display_name || 'Немає даних'}\nBio: ${profile?.bio || '...'}`);
        }
// У script.js
async function fillTestData() {
  const testAnime = {
    title: "Attack on Titan",
    poster_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    year: 2013,
    status: "finished"
  };
  
  await supabase.from('anime').insert(testAnime);
}
