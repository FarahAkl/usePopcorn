import { useEffect, useRef, useState } from "react";
import MovieDetails from "./Components/MovieDetails";
import Loader from "./Components/Loader";
import ErrorMessage from "./Components/ErrorMessage";
import WatchedMovie from "./Components/WatchedMovie";
import WatchedSummary from "./Components/WatchedSummary";

const KEY = process.env.REACT_APP_API_KEY;

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  // const [ watched, setWatched ] = useState([]);

  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });

  function handleSelectedMovie(id) {
    setSelectedId((i) => (i === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  const callback = (e) => {
    if (e.code === "Escape") {
      handleCloseMovie();
    }
  };

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  useEffect(() => {
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [handleCloseMovie]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not Found");

        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (error.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (!query.length) {
      setMovies([]);
      setError("");
      return;
    }

    handleCloseMovie();

    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar>
        <Search
          query={query}
          setQuery={setQuery}
          handleCloseMovie={handleCloseMovie}
        />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              handleSelectedMovie={handleSelectedMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {!selectedId ? (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onHandleDelete={handleDeleteWatched}
              />
            </>
          ) : (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery, handleCloseMovie }) {
  // Manually select element without using useRef()
  // useEffect(() => {
  //   const el = document.querySelector('.search')
  //   el.focus()
  // },[])

  const inputEl = useRef(null);

  useEffect(() => {
    inputEl.current.focus();
  }, []);

  useEffect(() => {
    const callback = (e) => {

      if (document.activeElement === inputEl.current) return;

      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
        handleCloseMovie();
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [handleCloseMovie, setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((op) => !op)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesList({ watched, onHandleDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onHandleDelete={onHandleDelete}
        />
      ))}
    </ul>
  );
}
