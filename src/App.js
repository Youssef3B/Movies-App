import { useEffect, useState } from "react";
import "./App.css";

import { AiFillStar } from "react-icons/ai";
import { AiOutlineFieldTime } from "react-icons/ai";
import { FaStar } from "react-icons/fa";

function App() {
  const [Query, setQuery] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [Search, setSearch] = useState([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [SelectedId, setSelectedId] = useState(null);
  const [Page, setPage] = useState(1);

  const [movies, setMovies] = useState([]);

  function handleSelectMovie(id) {
    setSelectedId((selectid) => (selectid === id ? null : id));
  }
  function NextPage() {
    setPage(Page + 1);
  }
  function PreviousPage() {
    setPage(Page - 1);
  }

  function handleAddWatch(movie) {
    // Get the existing watched movies from local storage or initialize an empty array
    const existingWatchedMovies =
      JSON.parse(localStorage.getItem("watchedMovies")) || [];

    // Check if the movie is already in the watched list
    const isDuplicate = existingWatchedMovies.some((m) => m.Id === movie.Id);

    if (!isDuplicate) {
      // Add the new movie to the watched list
      const updatedWatchedMovies = [...existingWatchedMovies, movie];

      // Save the updated watched list to local storage
      localStorage.setItem(
        "watchedMovies",
        JSON.stringify(updatedWatchedMovies)
      );

      // Update the state
      setMovies(updatedWatchedMovies);
    }
  }
  function Delete(id) {
    console.log("Delete function called with id:", id);

    // Remove the movie from local storage
    const updatedWatchedMovies = movies.filter((e) => e.Id !== id);
    localStorage.setItem("watchedMovies", JSON.stringify(updatedWatchedMovies));

    // Update the state to remove the movie from the UI
    setMovies(updatedWatchedMovies);
  }

  useEffect(() => {
    // Get the watched movies from local storage
    const watchedMovies =
      JSON.parse(localStorage.getItem("watchedMovies")) || [];

    // Set the watched movies in the state
    setMovies(watchedMovies);
  }, []);

  useEffect(
    function () {
      async function searchMovie() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${Query}&api_key=c304bc735c8be64a60b32b0288dd6136`
          );
          if (!res.ok) throw new Error("Something went wrong fetching movies");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");

          setSearch(data);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      searchMovie();
    },
    [Query]
  );

  useEffect(
    function () {
      async function fetchMovies() {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${Page}&api_key=c304bc735c8be64a60b32b0288dd6136`
        );
        const data = await res.json();
        setMovieList(data);
      }
      fetchMovies();
    },
    [Page]
  );

  return (
    <>
      <Navbar Query={Query} setQuery={setQuery} />
      <div className="menu">
        {IsLoading && <Loader />}
        {!IsLoading && !error && (
          <ListMovies
            movieList={movieList}
            Search={Search}
            Query={Query}
            handleSelectMovie={handleSelectMovie}
            SelectedId={SelectedId}
            handleAddWatch={handleAddWatch}
          />
        )}
        <WatchedMovies movies={movies} Delete={Delete} />
      </div>
      {Search.length === 0 ? (
        ""
      ) : (
        <div className="grid">
          {Page && Page === 1 ? (
            ""
          ) : (
            <Button onClick={PreviousPage} className="center">
              PreviousPage
            </Button>
          )}
          <Button onClick={NextPage} className="center">
            NextPage
          </Button>
        </div>
      )}
    </>
  );
}

function Loader() {
  return <h1 className="text-white">Loading...</h1>;
}
function Navbar({ Query, setQuery }) {
  return (
    <nav>
      <div className="logo">
        <img src="/download.png" alt="Logo"></img>
      </div>
      <div>
        <input
          value={Query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search a Movie"
        ></input>
      </div>
    </nav>
  );
}
function ListMovies({
  movieList,
  Search,
  Query,
  handleSelectMovie,
  SelectedId,
  handleAddWatch,
}) {
  const hasSearchResults =
    Search && Search.results && Search.results.length > 0;
  const hasMovieListResults =
    movieList && movieList.results && movieList.results.length > 0;
  const isQueryEmpty = Query.trim() === "";

  return (
    <div className="ListMovies">
      <h2>{Query ? `${Query}` : "Movies"}</h2>
      <div className="cards">
        {hasSearchResults ? (
          Search.results.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              handleSelectMovie={handleSelectMovie}
              SelectedId={SelectedId}
              handleAddWatch={handleAddWatch}
            />
          ))
        ) : isQueryEmpty && hasMovieListResults ? (
          movieList.results.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              handleSelectMovie={handleSelectMovie}
              SelectedId={SelectedId}
              handleAddWatch={handleAddWatch}
            />
          ))
        ) : (
          <p className="text-white">No movies found</p>
        )}
      </div>
    </div>
  );
}

function WatchedMovies({ movies, Delete }) {
  const HowManys = movies.length;

  return (
    <div className="watched">
      <div className="d-flex-between">
        <h3>Your List WatchedMovies</h3>
        <h5>{HowManys} Movies</h5>
      </div>
      {movies &&
        movies.map((movie) => (
          <CardWatchedMovies movie={movie} key={movie.Id} Delete={Delete} />
        ))}
    </div>
  );
}
function CardWatchedMovies({ movie, Delete }) {
  return (
    <div className="card-watched">
      <div>
        <img
          src={`https://image.tmdb.org/t/p/original/${movie.Poster}`}
          alt="poster"
        ></img>
      </div>
      <div className="details-watched">
        <h3>{movie.Title}</h3>
        <div className="details-watched-right">
          <div className="d-flex ml-3">
            <AiFillStar color="E9B824" />
            <p>{movie.ImdbRate}</p>
          </div>
          <div className="d-flex ml-3">
            <AiFillStar color="E9B824" />
            <p>{movie.UserRating}</p>
          </div>
          <div className="d-flex ml-3">
            <AiOutlineFieldTime />
            <p>{movie.Time} mn</p>
          </div>
        </div>
        <button onClick={() => Delete(movie.Id)} className="Delete">
          Delete
        </button>
      </div>
    </div>
  );
}

function MovieCard({ movie, handleSelectMovie, SelectedId, handleAddWatch }) {
  const [modal, setModal] = useState(false);

  function toggleModal() {
    setModal(!modal);
    handleSelectMovie(movie.id);
  }

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }

  return (
    <>
      <div
        onClick={() => {
          toggleModal(); // Call the toggleModal function after updating SelectedId
        }}
        key={movie.id}
        className="card"
      >
        <img
          src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
          alt="poster"
        ></img>
        <h3>{movie.original_title}</h3>

        <div className="d-flex-between">
          <div className="d-flex">
            <AiFillStar color="E9B824" />
            <p>{movie.vote_average}</p>
          </div>
          <div className="date">
            <p>{movie.release_date.slice(0, 4)}</p>
          </div>
        </div>
      </div>
      {modal === true ? (
        <Modal
          SelectedId={SelectedId}
          toggleModal={toggleModal}
          handleAddWatch={handleAddWatch}
        />
      ) : (
        ""
      )}
    </>
  );
}
function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="Btn">
      {children}
    </button>
  );
}
function Modal({ toggleModal, SelectedId, handleAddWatch }) {
  const [movie, setMovie] = useState({});
  const [video, setVideo] = useState({});
  const [video2, setVideo2] = useState({});
  const [UserRating, setUserRating] = useState("");
  const [Hover, setHover] = useState(null);

  function Add() {
    const newobj = {
      Title: movie.original_title,
      ImdbRate: movie.vote_average,
      Poster: movie.backdrop_path,
      Time: movie.runtime,
      Id: movie.id,
      UserRating: UserRating,
    };
    handleAddWatch(newobj);
    toggleModal(false);
    console.log(newobj);
  }
  useEffect(() => {
    async function getMovieDetails() {
      if (SelectedId !== null) {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${SelectedId}?api_key=c304bc735c8be64a60b32b0288dd6136`
        );

        if (res.status === 200) {
          const data = await res.json();
          setMovie(data);
        } else {
          console.error(
            "Failed to fetch movie details:",
            res.status,
            res.statusText
          );
        }
      }
    }

    getMovieDetails();
  }, [SelectedId]);

  useEffect(
    function () {
      async function getTrailer() {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${SelectedId}/videos?language=en-US&api_key=c304bc735c8be64a60b32b0288dd6136`
        );
        const data = await res.json();

        // Check if there are videos available
        if (data.results.length > 0) {
          // Set the first video's key as the source for the iframe
          setVideo(data.results[0].key);
        }
        const officialTrailer = data.results.find(
          (video) => video.name === "Official Trailer"
        );

        // Check if the officialTrailer is found
        if (officialTrailer) {
          // Set the officialTrailer's key as the source for the iframe
          setVideo2(officialTrailer.key);
        }
      }
      getTrailer();
    },
    [SelectedId]
  );

  return (
    <div className="modal">
      <div onClick={toggleModal} className="overlay"></div>
      <div className="modal-content">
        <div>
          <img
            src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
            alt="poster"
          ></img>
        </div>
        <div>
          <h2>{movie.original_title}</h2>
          <div className="d-flex">
            <div className="d-flex">
              <AiFillStar color="E9B824" />
              <p className="secondary ml-3 mb-3">{movie.vote_average}</p>
            </div>
            <p className="secondary ml-3 mb-3">{movie.runtime}</p>
            <p className="secondary ml-3 mb-3">{movie.release_date}</p>
          </div>
          <div className="d-flex">
            <p className="secondary mb-3">
              {/* Check if movie and movie.genres are defined */}
              {movie && movie.genres && Array.isArray(movie.genres) && (
                <p className="secondary mb-3">
                  {movie.genres.map((e) => e.name)}
                </p>
              )}
            </p>
          </div>
          <div className="star">
            {Array.from({ length: 10 }).map((_, i) => {
              const currValue = i + 1;
              return (
                <label key={currValue}>
                  <input value={UserRating} type="radio" name="rating"></input>
                  <FaStar
                    onClick={() => setUserRating(currValue)}
                    onMouseEnter={() => setHover(currValue)}
                    onMouseLeave={() => setHover(null)}
                    size={24}
                    color={
                      (Hover || UserRating) < currValue ? "#e4e5e9" : "#ffc107"
                    }
                  />
                </label>
              );
            })}
            <p>{Hover || UserRating}</p>
          </div>
          <Button onClick={Add}>Add To WatchedList</Button>
          <div className="desc">
            <p className="mb-3">{movie.overview}</p>
          </div>

          <h4 className="mb-3">Trailers and Clips</h4>
          <div className="">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${video}`}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={true}
            ></iframe>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${video2}`}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={true}
            ></iframe>
          </div>
        </div>
        <button onClick={toggleModal} className="close-modal">
          Close
        </button>
      </div>
    </div>
  );
}
export default App;
