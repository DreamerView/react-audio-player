import { useState, useRef, useEffect } from "react";
import playlist from "../playlist";

export default function AudioPlayer() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  const audioRef = useRef(null);
  const currentTrack = playlist[current];

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    isPlaying ? audio.pause() : audio.play();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (isShuffle) {
      let next;
      do {
        next = Math.floor(Math.random() * playlist.length);
      } while (next === current);
      setCurrent(next);
    } else {
      setCurrent((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevTrack = () => {
    setCurrent((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    }
  };

  const onSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = e.target.value;
      setProgress(audio.currentTime);
    }
  };

  const onVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
      audio.volume = 0;
    } else {
      setVolume(previousVolume);
      audio.volume = previousVolume;
    }
  };

  const changeSpeed = (value) => {
    setSpeed(value);
    if (audioRef.current) {
      audioRef.current.playbackRate = value;
    }
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = speed;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.play();
      audio.playbackRate = speed;
    }
    setProgress(0);
  }, [current]);

  return (
    <div className="container pt-4">
      <div className="row g-4">
        {/* 🎧 Плеер */}
        <div className="col-lg-5">
          <div className="p-md-5 p-4 bg-body shadow-md rounded-5">
            <div className="w-100 d-flex justify-content-center">
              <img
                src={currentTrack.promo}
                className="mx-auto rounded-4 mb-5"
                style={{ maxWidth: 200, width: "100%" }}
                alt={currentTrack.title}
              />
            </div>
            <div className="card-body">
              <h5 className="card-title text-center">{currentTrack.title}</h5>
              <p className="card-text text-muted mt-3 text-center">{currentTrack.artist}</p>

              <audio
                ref={audioRef}
                src={currentTrack.src}
                onEnded={nextTrack}
                onTimeUpdate={onTimeUpdate}
              />

              {/* Основное управление */}
              <div className="d-flex gap-3 justify-content-center my-4">
                <button className={`btn ${isShuffle ? "btn-warning" : "btn-outline-secondary"} border-0 rounded-4 btn-lg`} onClick={() => setIsShuffle(!isShuffle)}>
                  <i className="bi bi-shuffle"></i>
                </button>
                <button className="btn btn-outline-secondary border-0 rounded-4 btn-lg" onClick={prevTrack}>
                  <i className="bi bi-skip-start-fill"></i>
                </button>
                <button className="btn btn-primary border-0 rounded-4 btn-lg" onClick={togglePlay}>
                  <i className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}></i>
                </button>
                <button className="btn btn-outline-secondary border-0 rounded-4 btn-lg" onClick={nextTrack}>
                  <i className="bi bi-skip-end-fill"></i>
                </button>
                <button className={`btn ${isRepeat ? "btn-warning" : "btn-outline-secondary"} border-0 rounded-4 btn-lg`} onClick={() => setIsRepeat(!isRepeat)}>
                  <i className="bi bi-repeat"></i>
                </button>
              </div>

              {/* Прогресс трека */}
              <input
                type="range"
                className="form-range"
                min="0"
                max={duration}
                value={progress}
                step="0.1"
                onChange={onSeek}
              />
              <div className="d-flex justify-content-between small text-muted mb-4">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Громкость + скорость */}
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn btn-outline-secondary border-0 rounded-4 btn-sm"
                  onClick={toggleMute}
                >
                  <i className={`bi ${
                    volume === 0
                      ? "bi-volume-mute-fill"
                      : volume < 0.5
                      ? "bi-volume-down-fill"
                      : "bi-volume-up-fill"
                  }`}></i>
                </button>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={onVolumeChange}
                  style={{ flex: 1 }}
                />
                <div className="dropdown">
                  <button
                    className="btn btn-outline-dark border-0 rounded-4 btn-sm dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    {speed}x
                  </button>
                  <ul className="dropdown-menu bg-body-secondary px-2 py-1 rounded-4 dropdown-menu-end" data-bs-theme="dark">
                    {[0.5, 1, 1.25, 1.5, 2].map((val) => (
                      <li key={val}>
                        <button
                          className={`dropdown-item rounded-4 ${speed === val ? "active" : ""}`}
                          onClick={() => changeSpeed(val)}
                        >
                          {val}x
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 📜 Плейлист */}
        <div className="col-lg-7">
          <div className="px-md-5">
            <h1 className="text-center my-5">🎧 React Audio Player</h1>
            <h5 className="text-center mb-4">Плейлист</h5>
            <ul className="d-flex flex-column gap-4 bg-dark text-white p-4 rounded-5">
              {playlist.map((track, index) => (
                <li
                  key={index}
                  className={`list-group-item d-flex align-items-center gap-3 ${index === current ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setCurrent(index)}
                >
                  <img
                    src={track.promo}
                    alt={track.title}
                    width="48"
                    height="48"
                    className="rounded"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <div>{track.title}</div>
                    <small className="opacity-50">{track.artist}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
