const movies = [
  {
    id: "ne-zha-2",
    title: "哪吒之魔童闹海",
    release: "2026-02",
    intro: "延续国漫神话宇宙，视觉和动作场面升级。",
  },
  {
    id: "wandering-earth-3",
    title: "流浪地球3（上）",
    release: "2026-01",
    intro: "人类命运共同体面对更宏大的宇宙危机。",
  },
  {
    id: "detective-chinatown-4",
    title: "唐人街探案4",
    release: "2026-07",
    intro: "系列新案再开，悬疑与喜剧继续融合。",
  },
  {
    id: "mission-impossible-8",
    title: "碟中谍8",
    release: "2026-05",
    intro: "伊森团队执行极限任务，动作戏更硬核。",
  },
  {
    id: "avatar-3",
    title: "阿凡达3",
    release: "2026-12",
    intro: "潘多拉新部族登场，继续拓展世界观。",
  },
  {
    id: "inside-out-2-cn",
    title: "头脑特工队2（引进）",
    release: "2026-04",
    intro: "青春期情绪大爆发，适合全年龄共鸣。",
  },
];

const voteForm = document.getElementById("vote-form");
const voteResults = document.getElementById("vote-results");
const movieList = document.getElementById("movie-list");
const template = document.getElementById("movie-template");

const votesKey = "movieVotes";
const ratingsKey = "movieRatings";

const state = {
  votes: JSON.parse(localStorage.getItem(votesKey) || "{}"),
  ratings: JSON.parse(localStorage.getItem(ratingsKey) || "{}"),
};

function persist() {
  localStorage.setItem(votesKey, JSON.stringify(state.votes));
  localStorage.setItem(ratingsKey, JSON.stringify(state.ratings));
}

function renderVoteOptions() {
  voteForm.innerHTML = "";
  movies.forEach((movie) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = movie.id;
    label.append(input, document.createTextNode(movie.title));
    voteForm.append(label);
  });
}

function submitVote() {
  const checkedIds = [...voteForm.querySelectorAll("input:checked")].map((el) => el.value);
  checkedIds.forEach((id) => {
    state.votes[id] = (state.votes[id] || 0) + 1;
  });
  persist();
  renderVotes();
}

function resetSelection() {
  voteForm.querySelectorAll("input").forEach((input) => {
    input.checked = false;
  });
}

function renderVotes() {
  voteResults.innerHTML = "";
  const ranked = movies
    .map((movie) => ({
      movie,
      count: state.votes[movie.id] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  ranked.forEach(({ movie, count }) => {
    const row = document.createElement("div");
    row.className = "result-item";
    row.innerHTML = `<span>${movie.title}</span><strong>${count} 票</strong>`;
    voteResults.append(row);
  });
}

function getMovieRatings(movieId) {
  return state.ratings[movieId] || [];
}

function upsertMovieRating(movieId, score, comment) {
  if (!state.ratings[movieId]) {
    state.ratings[movieId] = [];
  }
  state.ratings[movieId].push({ score, comment, at: Date.now() });
  persist();
}

function computeAverage(entries) {
  if (!entries.length) return null;
  const total = entries.reduce((sum, item) => sum + item.score, 0);
  return (total / entries.length).toFixed(1);
}

function renderMovies() {
  movieList.innerHTML = "";
  movies.forEach((movie) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = movie.id;
    node.querySelector(".movie-title").textContent = movie.title;
    node.querySelector(".movie-release").textContent = `上映：${movie.release}`;
    node.querySelector(".movie-intro").textContent = movie.intro;

    const entries = getMovieRatings(movie.id);
    node.querySelector(".avg-score").textContent = computeAverage(entries) || "暂无";
    node.querySelector(".comment-count").textContent = String(entries.length);

    const commentList = node.querySelector(".comment-list");
    entries.slice(-3).reverse().forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.score} 分：${entry.comment || "（未填写评论）"}`;
      commentList.append(li);
    });

    const form = node.querySelector(".rate-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const score = Number(form.querySelector(".score-input").value);
      const comment = form.querySelector(".comment-input").value.trim();
      if (score < 1 || score > 10) return;
      upsertMovieRating(movie.id, score, comment);
      renderMovies();
    });

    movieList.append(node);
  });
}

renderVoteOptions();
renderVotes();
renderMovies();

document.getElementById("submit-vote").addEventListener("click", submitVote);
document.getElementById("reset-vote").addEventListener("click", resetSelection);
