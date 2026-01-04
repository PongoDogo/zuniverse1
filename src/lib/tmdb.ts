const API_KEY = "b2ec786f995dcde6d8d264ecd3cd91e9";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface Movie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type?: "movie" | "tv";
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  tagline?: string;
  seasons?: Season[];
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  overview: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
  vote_average: number;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export const getImageUrl = (path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"): string => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: "w780" | "w1280" | "original" = "original"): string => {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

const fetchTMDB = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const searchParams = new URLSearchParams({
    api_key: API_KEY,
    ...params,
  });
  
  const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
};

export const getTrending = async (mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") => {
  const data = await fetchTMDB<{ results: Movie[] }>(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
};

export const getPopular = async (mediaType: "movie" | "tv") => {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/popular`);
  return data.results;
};

export const getTopRated = async (mediaType: "movie" | "tv") => {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/top_rated`);
  return data.results;
};

export const getNowPlaying = async () => {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/now_playing");
  return data.results;
};

export const getUpcoming = async () => {
  const data = await fetchTMDB<{ results: Movie[] }>("/movie/upcoming");
  return data.results;
};

export const getOnTheAir = async () => {
  const data = await fetchTMDB<{ results: Movie[] }>("/tv/on_the_air");
  return data.results;
};

export const getGenres = async (mediaType: "movie" | "tv") => {
  const data = await fetchTMDB<{ genres: Genre[] }>(`/genre/${mediaType}/list`);
  return data.genres;
};

export const getByGenre = async (mediaType: "movie" | "tv", genreId: number, page: number = 1) => {
  const data = await fetchTMDB<{ results: Movie[]; total_pages: number }>(`/discover/${mediaType}`, {
    with_genres: genreId.toString(),
    page: page.toString(),
  });
  return data;
};

export const search = async (query: string, page: number = 1) => {
  const data = await fetchTMDB<{ results: Movie[]; total_pages: number }>("/search/multi", {
    query,
    page: page.toString(),
  });
  return data;
};

export const getDetails = async (mediaType: "movie" | "tv", id: number): Promise<MovieDetails> => {
  return fetchTMDB<MovieDetails>(`/${mediaType}/${id}`);
};

export const getCredits = async (mediaType: "movie" | "tv", id: number) => {
  const data = await fetchTMDB<{ cast: Cast[] }>(`/${mediaType}/${id}/credits`);
  return data.cast.slice(0, 10);
};

export const getVideos = async (mediaType: "movie" | "tv", id: number) => {
  const data = await fetchTMDB<{ results: Video[] }>(`/${mediaType}/${id}/videos`);
  return data.results.filter((v) => v.site === "YouTube");
};

export const getSimilar = async (mediaType: "movie" | "tv", id: number) => {
  const data = await fetchTMDB<{ results: Movie[] }>(`/${mediaType}/${id}/similar`);
  return data.results;
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number) => {
  const data = await fetchTMDB<{ episodes: Episode[] }>(`/tv/${tvId}/season/${seasonNumber}`);
  return data.episodes;
};
