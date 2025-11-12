const API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w1280';
const YOUTUBE = 'https://www.youtube.com/embed/';

let featuredMovie = null;

// Load popular movies
async function loadPopular() {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=vi-VN&page=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      displayMovies(data.results.slice(0,12));
      setFeatured(data.results[0]);
    }
  } catch(e) { console.error(e); alert('Không thể tải phim, vui lòng thử lại sau.'); }
}

function setFeatured(movie){
  featuredMovie = movie;
  document.getElementById('bannerImg').src = IMG_URL + (movie.backdrop_path || movie.poster_path);
  document.getElementById('bannerTitle').innerText = movie.title;
  document.getElementById('bannerOverview').innerText = movie.overview || 'Không có mô tả.';
}

function displayMovies(movies){
  const container = document.getElementById('movies');
  container.innerHTML = '';
  movies.forEach(movie=>{
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3 col-xl-2 mb-4';
    col.innerHTML = `
      <div class="card h-100" onclick="showMovie(${movie.id})">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
        <div class="card-overlay">
          <h6 class="m-0">${movie.title}</h6>
          <small>${movie.release_date?.split('-')[0] || 'N/A'}</small>
          <span class="badge bg-danger ms-2">★ ${movie.vote_average.toFixed(1)}</span>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

async function showMovie(id){
  try {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos&language=vi-VN`);
    const movie = await res.json();
    const trailer = movie.videos.results.find(v=>v.type==='Trailer' && v.site==='YouTube');
    if(trailer){
      document.getElementById('movieTitle').innerText = movie.title;
      document.getElementById('trailerFrame').src = YOUTUBE + trailer.key + '?autoplay=1';
      new bootstrap.Modal(document.getElementById('trailerModal')).show();
    } else alert('Không có trailer cho phim này!');
  } catch(e){ console.error(e); alert('Lỗi tải chi tiết phim!'); }
}

function playFeatured(){ if(featuredMovie) showMovie(featuredMovie.id); }

// Search with debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', e=>{
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async ()=>{
    const q = e.target.value.trim();
    if(!q) return loadPopular();
    try{
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}&language=vi-VN`);
      const data = await res.json();
      displayMovies(data.results);
    }catch(e){ console.error(e); }
  }, 500);
});

// Stop trailer when modal closes
document.getElementById('trailerModal').addEventListener('hidden.bs.modal', ()=>{
  document.getElementById('trailerFrame').src = '';
});

// Dark/Light toggle
const themeToggle = document.getElementById('themeToggle');
if(localStorage.getItem('theme')==='light') document.body.classList.add('light-mode');
updateToggleIcon();
themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light-mode');
  const theme = document.body.classList.contains('light-mode')?'light':'dark';
  localStorage.setItem('theme', theme);
  updateToggleIcon();
});
function updateToggleIcon(){
  const icon = themeToggle.querySelector('i');
  icon.className = document.body.classList.contains('light-mode')?'fas fa-sun':'fas fa-moon';
}

// Init
loadPopular();
