import React, { useRef, useState } from "react";
import "./VideoSection.css";
import Video from "../../assets/video.mp4";

const VideoSection = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <section className="video-section" data-framer-name="Video Section">
      <div className="video-container" data-framer-name="Container">
        <div
          className="video-label"
          data-border="true"
          data-framer-name="Label"
        >
          <div className="video-label-icon">
            <img
              width="12"
              height="12"
              src="https://framerusercontent.com/images/MbKThG8TQUD10dVa0MCU8F4Dfs.svg"
              alt="Icon"
              className="video-label-img"
            />
          </div>
          <div
            className="video-label-text"
            data-framer-component-type="RichTextContainer"
          >
            <p className="video-label-title">
              Experience Real Protection in Real Time
            </p>
          </div>
        </div>
        <div className="video-player-wrapper">
          <div className="video-player">
            <video
              ref={videoRef}
              src={Video}
              loop
              preload="none"
              muted
              playsInline
              className="video-element"
              poster="https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&w=1200"
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            <button
              className="video-overlay-btn"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause video" : "Watch our video"}
            >
              {isPlaying ? (
                <svg
                  className="video-pause-svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="4"
                    y="4"
                    width="5"
                    height="16"
                    rx="2"
                    fill="#D3ED05"
                  />
                  <rect
                    x="15"
                    y="4"
                    width="5"
                    height="16"
                    rx="2"
                    fill="#D3ED05"
                  />
                </svg>
              ) : (
                <svg
                  className="video-play-svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="5,4 19,12 5,20"
                    stroke="#D3ED05"
                    strokeWidth="2.5"
                    fill="none"
                  />
                </svg>
              )}
              <span className="video-overlay-text">
                {isPlaying ? "Pause video" : "Watch our video"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
