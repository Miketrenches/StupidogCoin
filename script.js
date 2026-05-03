(() => {
  const VIDEO_ID = "fzepGtfHL9A";
  const musicBtn = document.getElementById("music");
  const panel = document.getElementById("audio-panel");
  const slider = document.getElementById("volume");
  const audioWrap = document.getElementById("audio");
  if (!musicBtn || !panel || !slider || !audioWrap) return;

  let player = null;
  let ready = false;
  let userInteracted = false;
  let hasStartedOnce = false;
  let currentVolume = Number(slider.value) || 22;

  const setSliderFill = (v) => {
    slider.style.setProperty("--vol", `${v}%`);
  };
  setSliderFill(currentVolume);

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("player", {
      height: "1",
      width: "1",
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        loop: 1,
        playlist: VIDEO_ID,
      },
      events: {
        onReady: () => {
          ready = true;
          tryAutoplay();
        },
        onStateChange: (e) => {
          if (!window.YT) return;
          if (e.data === YT.PlayerState.PLAYING) {
            musicBtn.classList.add("playing");
            musicBtn.setAttribute("aria-label", "Pause music");
            musicBtn.setAttribute("title", "Pause music");
          } else if (
            e.data === YT.PlayerState.PAUSED ||
            e.data === YT.PlayerState.ENDED
          ) {
            musicBtn.classList.remove("playing");
            musicBtn.setAttribute("aria-label", "Play music");
            musicBtn.setAttribute("title", "Play music");
          }
        },
      },
    });
  };

  function tryAutoplay() {
    if (!ready || !player) return;
    try {
      player.setVolume?.(currentVolume);
      if (userInteracted && currentVolume > 0) {
        player.unMute?.();
      } else {
        player.mute?.();
      }
      player.playVideo();
      hasStartedOnce = true;
    } catch {
      /* swallow */
    }
  }

  const interactionEvents = ["pointerdown", "keydown", "touchstart", "scroll"];
  const onFirstInteraction = () => {
    if (userInteracted) return;
    userInteracted = true;
    interactionEvents.forEach((ev) =>
      window.removeEventListener(ev, onFirstInteraction, true),
    );
    if (ready && player && currentVolume > 0) {
      try {
        player.unMute?.();
        player.setVolume?.(currentVolume);
        if (!hasStartedOnce) player.playVideo();
      } catch {
        /* swallow */
      }
    }
  };
  interactionEvents.forEach((ev) =>
    window.addEventListener(ev, onFirstInteraction, {
      capture: true,
      passive: true,
    }),
  );

  const setPanelOpen = (open) => {
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    musicBtn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userInteracted = true;
    setPanelOpen(!panel.classList.contains("open"));
    if (ready && player && !hasStartedOnce) {
      try {
        if (currentVolume > 0) player.unMute?.();
        player.setVolume?.(currentVolume);
        player.playVideo();
      } catch {
        /* swallow */
      }
    }
  });

  slider.addEventListener("input", () => {
    currentVolume = Number(slider.value);
    setSliderFill(currentVolume);
    userInteracted = true;
    if (!ready || !player) return;
    try {
      if (currentVolume === 0) {
        player.mute?.();
      } else {
        player.unMute?.();
        player.setVolume?.(currentVolume);
      }
    } catch {
      /* swallow */
    }
  });

  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("open")) return;
    if (!audioWrap.contains(e.target)) setPanelOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      setPanelOpen(false);
    }
  });
})();
