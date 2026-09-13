import { videos } from "../data/videos";

const frame = document.querySelector<HTMLElement>("[data-video-frame]");
const title = document.querySelector<HTMLElement>("[data-video-title]");
const summary = document.querySelector<HTMLElement>("[data-video-summary]");
const channel = document.querySelector<HTMLElement>("[data-video-channel]");
const year = document.querySelector<HTMLElement>("[data-video-year]");
const position = document.querySelector<HTMLElement>("[data-video-position]");
const external = document.querySelector<HTMLAnchorElement>("[data-video-external]");
const status = document.querySelector<HTMLElement>("[data-video-status]");
const search = document.querySelector<HTMLInputElement>("#video-search");
const count = document.querySelector<HTMLElement>("[data-video-count]");
const empty = document.querySelector<HTMLElement>("[data-video-empty]");
const selections = [...document.querySelectorAll<HTMLButtonElement>("[data-video-select]")];
let active = videos[0];

function showVideo(id: string | null, updateHistory = false) {
  active = videos.find(video => video.id === id) ?? videos[0];
  if (!frame || !title || !summary || !channel || !year || !position || !external || !status) return;
  // Replacing the frame removes any previous player, stopping its playback.
  const poster = document.createElement("button");
  poster.type = "button";
  poster.className = "video-poster";
  poster.dataset.videoLoad = "";
  poster.setAttribute("aria-label", `Load video: ${active.title}`);
  const image = document.createElement("img");
  image.src = active.image;
  image.alt = "";
  image.width = 480;
  image.height = 270;
  const play = document.createElement("span");
  play.className = "video-play-mark";
  play.setAttribute("aria-hidden", "true");
  play.textContent = "▶";
  const label = document.createElement("span");
  label.className = "video-poster-label";
  label.textContent = "Load video";
  const note = document.createElement("span");
  note.textContent = "Playback starts only when you press play";
  label.append(note);
  poster.append(image, play, label);
  frame.replaceChildren(poster);
  title.textContent = active.title;
  summary.textContent = active.summary;
  channel.textContent = active.channel;
  year.textContent = `Published ${active.year}`;
  position.textContent = `${String(videos.indexOf(active) + 1).padStart(2, "0")} / ${String(videos.length).padStart(2, "0")}`;
  external.href = active.url;
  status.textContent = `Selected ${active.channel} appearance. No autoplay.`;
  selections.forEach(link => {
    if (link.dataset.videoSelect === active.id) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set("v", active.id);
    history.pushState(null, "", url);
  }
}

selections.forEach(link => link.disabled = false);
selections.forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  showVideo(link.dataset.videoSelect ?? null, true);
  if (window.matchMedia("(max-width: 860px)").matches) {
    frame?.querySelector<HTMLButtonElement>("[data-video-load]")?.focus({ preventScroll: true });
    frame?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }
}));

frame?.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof Element) || !target.closest("[data-video-load]")) return;
  event.preventDefault();
  const player = document.createElement("iframe");
  player.src = `https://www.youtube-nocookie.com/embed/${active.id}?autoplay=0&rel=0`;
  player.title = active.title;
  player.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  player.allowFullscreen = true;
  player.referrerPolicy = "strict-origin-when-cross-origin";
  frame.replaceChildren(player);
  player.focus();
  if (status) status.textContent = "Player ready. Press play to start, or open on YouTube.";
});

function filterVideos() {
  const query = search?.value.trim().toLocaleLowerCase() ?? "";
  let visible = 0;
  document.querySelectorAll<HTMLElement>("[data-video-item]").forEach(item => {
    const video = videos.find(video => video.id === item.dataset.videoItem);
    const matches = Boolean(video && `${video.title} ${video.channel} ${video.summary} ${video.format} ${video.year}`.toLocaleLowerCase().includes(query));
    item.hidden = !matches;
    if (matches) visible++;
  });
  if (count) count.textContent = String(visible);
  if (empty) empty.hidden = visible !== 0;
}
search?.addEventListener("input", filterVideos);
document.querySelector("[data-video-reset]")?.addEventListener("click", () => {
  if (search) search.value = "";
  filterVideos();
  search?.focus();
});
window.addEventListener("popstate", () => showVideo(new URL(location.href).searchParams.get("v")));
showVideo(new URL(location.href).searchParams.get("v"));
