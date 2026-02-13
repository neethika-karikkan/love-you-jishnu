import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
// Import your photo from assets folder
import ourPhoto from './assets/our-photo.png'; // Your photo

function App() {
  const [showApp, setShowApp] = useState(false)
  const [flashScreen, setFlashScreen] = useState(true)
  const [hearts, setHearts] = useState([])
  const [clickHearts, setClickHearts] = useState([])
  const [showLetter, setShowLetter] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  
  // Use refs for video popup to prevent re-renders
  const playingVideoRef = useRef(null)
  const videoLoadingRef = useRef(false)
  const [videoCloseTrigger, setVideoCloseTrigger] = useState(0)

  // Updated memories array with video support - Use actual video files or placeholder URLs
  const [memories] = useState([
    {
      id: 1,
      title: "first video",
      emoji: "💕",
      description: "Our first video, where our story truly started.",
      videoSrc: "/videos/first-meeting.mp4" // Make sure these files exist in public/videos/
    },
    {
      id: 2,
      title: "Our beautiful communication",
      emoji: "💬",
      description: "In our communication, even silence feels like love",
      videoSrc: "/videos/special-talks.mp4"
    },
    {
      id: 3,
      title: "Heart Connection",
      emoji: "💞",
      description: "Feeling our souls connect deeply",
      videoSrc: "/videos/heart-connection.mp4"
    },
    {
      id: 4,
      title: "Beautiful Love",
      emoji: "🌸",
      description: "Your Love brightens my darkest days",
      videoSrc: "/videos/beautiful-smiles.mp4"
    },
    {
      id: 5,
      title: "Endless Love",
      emoji: "∞",
      description: "A love that grows stronger every day",
      videoSrc: "/videos/endless-love.mp4"
    }
  ])

  const [clickCount, setClickCount] = useState(0)
  const [secretMessage, setSecretMessage] = useState("")
  const [volume, setVolume] = useState(0.7)
  const [audioReady, setAudioReady] = useState(false)

  // Create audio ref
  const audioRef = useRef(null)
  // Refs for videos
  const videoRefs = useRef({})
  // Ref to store scroll position
  const scrollPosition = useRef(0)

  // Prevent background scrolling when modal is open and save scroll position
  useEffect(() => {
    if (showLetter || playingVideoRef.current) {
      scrollPosition.current = window.scrollY
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"

      // Delay scroll restore to ensure DOM is fully updated
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition.current)
          })
        })
      }, 50)
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showLetter])

  // Effect to restore scroll when video closes
  useEffect(() => {
    if (!playingVideoRef.current && videoCloseTrigger > 0) {
      document.body.style.overflow = "auto"
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition.current)
          })
        })
      }, 100)
    }
  }, [videoCloseTrigger])


  // Flash screen animation - show for 2 seconds then transition
  useEffect(() => {
    if (flashScreen) {
      const timer = setTimeout(() => {
        setFlashScreen(false)
        setShowApp(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [flashScreen])

  // Initialize audio
  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sneham-cherum-neram.mp3') // Path to your song
    audio.loop = true // Loop the song
    audio.volume = volume

    // Handle audio events
    const handleCanPlay = () => {
      console.log('Audio is ready to play')
      setAudioReady(true)
    }

    const handleError = (e) => {
      console.error('Audio error:', e)
      setSecretMessage("Audio error. Please check the file path!")
      setTimeout(() => setSecretMessage(""), 3000)
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('canplay', handleCanPlay)
        audioRef.current.removeEventListener('error', handleError)
        audioRef.current = null
      }
    }
  }, [])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Create floating hearts animation (background hearts - bottom to top)
  useEffect(() => {
    if (!showApp) return;

    const createHeart = () => {
      const heart = {
        id: Date.now(),
        left: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 4 + 3,
        emoji: ['💖', '💗'][Math.floor(Math.random())],
        type: 'background'
      }
      setHearts(prev => [...prev.slice(-40), heart])

      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== heart.id))
      }, 4000)
    }

    const interval = setInterval(createHeart, 400)
    return () => clearInterval(interval)
  }, [showApp])

  // Clean up click hearts after they disappear
  useEffect(() => {
    if (!showApp) return;

    const interval = setInterval(() => {
      setClickHearts(prev => prev.filter(heart => {
        const elapsed = Date.now() - heart.createdAt
        return elapsed < 4000 // Remove after 4 seconds
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [showApp])

  // Function to create light pink small hearts that drop from top
  const createClickHeart = (count) => {
    const newHearts = [];
    const lightPinkHearts = ['💗', '💕', '💓']; // Light pink heart emojis

    for (let i = 0; i < count; i++) {
      const heart = {
        id: Date.now() + i,
        left: Math.random() * 85 + 7.5, // Keep hearts in viewport
        top: -30, // Start from above the screen
        size: Math.random() * 20 + 18, // Smaller hearts: 18-38px
        duration: Math.random() * 3 + 4, // 4-7 seconds to fall (slower)
        rotation: Math.random() * 720 - 360, // -360 to +360 degrees
        emoji: lightPinkHearts[Math.floor(Math.random() * lightPinkHearts.length)],
        type: 'click',
        createdAt: Date.now(),
        opacity: 0.6 + Math.random() * 0.3, // 0.6-0.9 opacity for light effect
        speed: Math.random() * 0.8 + 0.5, // Slower falling speed
        sway: Math.random() * 20 - 10, // Side-to-side sway motion
        scale: 0.8 + Math.random() * 0.4, // Scale variation,
      };
      newHearts.push(heart);
    }
    return newHearts;
  };

  const handleHeartClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Create hearts based on click count (1 heart on first click, 2 on second, etc.)
    const newClickHearts = createClickHeart(newClickCount);

    // Add the click hearts to state
    setClickHearts(prev => [...prev, ...newClickHearts]);

    // Special messages when clicking
    if (newClickCount === 5) setSecretMessage("You're on my mind always! 💕")
    else if (newClickCount === 10) setSecretMessage("My heart beats only for you! 💖")
    else if (newClickCount === 15) setSecretMessage("Infinite love unlocked! Forever yours! 🌸")
    else if (newClickCount === 20) setSecretMessage("You complete my universe! ✨")
    else if (newClickCount === 25) setSecretMessage("Soulmate status: Found & Loved! 💫")

    if (secretMessage) {
      setTimeout(() => setSecretMessage(""), 3000)
    }
  };

  const toggleMusic = async () => {
    if (!audioRef.current) {
      setSecretMessage("Audio not loaded yet. Please wait...")
      setTimeout(() => setSecretMessage(""), 2000)
      return
    }

    try {
      if (musicPlaying) {
        audioRef.current.pause()
        setMusicPlaying(false)
        setSecretMessage("Music paused 🎵")
        setTimeout(() => setSecretMessage(""), 2000)
      } else {
        // For autoplay policies, we need to ensure this is triggered by user interaction
        await audioRef.current.play()
        setMusicPlaying(true)
        setSecretMessage("Playing: Sneham Cherum Neram 🎶")
        setTimeout(() => setSecretMessage(""), 3000)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setSecretMessage("Click anywhere first to enable audio! 🎵")
      setTimeout(() => setSecretMessage(""), 3000)
    }
  }

  const increaseVolume = () => {
    if (volume < 1) {
      setVolume(prev => Math.min(1, prev + 0.1))
    }
  }

  const decreaseVolume = () => {
    if (volume > 0) {
      setVolume(prev => Math.max(0, prev - 0.1))
    }
  }

  // Handle user interaction for audio autoplay
  const handleUserInteraction = () => {
    // This function helps with autoplay policies
    if (audioRef.current && audioRef.current.paused) {
      // Audio context can be resumed here if needed
    }
  }

  // Play video function - uses ref to avoid re-renders
  const playVideo = async (videoId) => {
    const memory = memories.find(m => m.id === videoId)
    if (!memory) return

    // Save scroll position before opening video
    scrollPosition.current = window.scrollY
    
    videoLoadingRef.current = true
    playingVideoRef.current = videoId

    // Stop any currently playing video
    if (playingVideoRef.current && videoRefs.current[playingVideoRef.current]) {
      videoRefs.current[playingVideoRef.current].pause()
    }
    
    // Trigger scroll effect
    setVideoCloseTrigger(0)
  }

  // Close video player - uses ref to avoid re-renders
  const closeVideo = () => {
    if (playingVideoRef.current && videoRefs.current[playingVideoRef.current]) {
      videoRefs.current[playingVideoRef.current].pause()
      videoRefs.current[playingVideoRef.current].currentTime = 0;
    }
    playingVideoRef.current = null
    videoLoadingRef.current = false
    
    // Trigger effect to restore scroll
    setVideoCloseTrigger(prev => prev + 1)
  }

  // Handle video loaded - uses ref
  const handleVideoLoaded = (videoId) => {
    videoLoadingRef.current = false
    const video = videoRefs.current[videoId]
    if (video) {
      video.play().catch(error => {
        console.error('Error playing video:', error)
        setSecretMessage("Click the play button in video controls! 🎬")
        setTimeout(() => setSecretMessage(""), 3000)
      })
    }
  }

  // Handle video error - uses ref with fallback
  const handleVideoError = (videoId) => {
    videoLoadingRef.current = false
    setSecretMessage("Video not found. Using placeholder... 🎥")
    setTimeout(() => setSecretMessage(""), 3000)

    const video = videoRefs.current[videoId]
    if (video) {
      video.src = `https://assets.mixkit.co/videos/preview/mixkit-heart-shaped-balloon-flying-away-3973-large.mp4`
      video.load();
      video.play().catch(e => console.error('Error playing fallback video:', e));
    }
  }

  // Cleanup video refs on unmount
  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.pause()
        }
      })
    }
  }, [])

  // Flash Screen Component - Simple and beautiful
  if (flashScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-400 to-rose-600 flex flex-col items-center justify-center overflow-hidden relative">
        {/* Animated floating hearts in background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 40 + 20}px`,
                animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              {['❤️', '💖', '💗', '💕', '💓'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-6">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-dancing font-bold text-white mb-4 animate-pulse">
            For My Jishnu
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-pink-100 font-playfair mb-8 animate-fadeIn">
            A Special Valentine's Day Gift 💕
          </p>

          {/* Loading Animation */}
          <div className="mt-12">
            <div className="flex justify-center space-x-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-white rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                  }}
                ></div>
              ))}
            </div>
            <p className="text-white/90 text-lg animate-pulse">
              Loading love...
            </p>
          </div>

          {/* Signature */}
          <div className="absolute bottom-8 left-0 right-0">
            <p className="text-xl text-white/80 font-light">
              Made with by Neethii
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-white relative ${showApp ? 'opacity-100' : 'opacity-0'}`}
      style={{ overflowX: 'hidden' }}
      onClick={handleUserInteraction}
    >
      {/* Background Floating Hearts (Bottom to Top) */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="fixed text-pink-300 opacity-40 z-0 pointer-events-none"
          style={{
            left: `${heart.left}vw`,
            bottom: '-50px',
            fontSize: `${heart.size}px`,
            animation: `float ${heart.duration}s ease-in-out forwards`,
            animationDelay: `${heart.duration * 0.5}s`
          }}
        >
          {heart.emoji}
        </div>
      ))}

      {/* Click Hearts (Top to Bottom) - Light Pink Small Hearts */}
      {clickHearts.map(heart => (
        <div
          key={heart.id}
          className="fixed text-pink-300 opacity-90 z-20 pointer-events-none"
          style={{
            left: `${heart.left}vw`,
            top: '-30px',
            fontSize: `${heart.size}px`,
            animation: `gentleFall ${heart.duration}s ease-in forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
            transform: `rotate(${heart.rotation}deg) scale(${heart.scale})`,
            filter: `blur(${Math.random() * 0.5}px)`,
            opacity: heart.opacity,
            textShadow: '0 0 10px rgba(255, 182, 193, 0.5)',
            willChange: 'transform, opacity'
          }}
        >
          {heart.emoji}
        </div>
      ))}

      {/* Background Blurs */}
      <div className="fixed top-20 -left-20 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 -right-20 w-96 h-96 bg-red-300/20 rounded-full blur-3xl"></div>

      {/* Music Controls */}
      <div className="fixed top-8 right-8 z-50 flex flex-col items-end space-y-3">
        {/* Volume Controls - Only show when music is playing */}
        {musicPlaying && (
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-xl border border-white/40 animate-fadeIn">
            <button
              onClick={decreaseVolume}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
              title="Decrease volume"
            >
              <span className="text-red-500">🔉</span>
            </button>
            <div className="w-24">
              <div className="relative h-2 bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-red-600 text-center mt-1 font-medium">
                {Math.round(volume * 100)}%
              </div>
            </div>
            <button
              onClick={increaseVolume}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
              title="Increase volume"
            >
              <span className="text-red-500">🔊</span>
            </button>
          </div>
        )}

        {/* Music Button */}
        <button
          onClick={toggleMusic}
          className="bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-white/40 relative group"
          title={musicPlaying ? "Pause music" : "Play our song"}
        >
          <div className={`w-7 h-7 ${musicPlaying ? 'text-pink-500 animate-pulse' : 'text-red-500'}`}>
            {musicPlaying ? '🎵' : '🎶'}
          </div>

          {/* Audio status indicator */}
          {!audioReady && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
          )}

          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
              <p className="text-sm text-red-600 font-medium">
                {musicPlaying ? 'Sneham Cherum Neram' : 'Click to play'}
              </p>
              <p className="text-xs text-pink-500">Our Special Song 💖</p>
            </div>
          </div>
        </button>
      </div>

      {/* ============================== */}
      {/* VIDEO PLAYER MODAL - FIXED POPUP */}
      {/* ============================== */}
      {playingVideoRef.current && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={closeVideo}
            className="absolute top-6 right-6 z-20 bg-gradient-to-r from-pink-500 to-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-90"
          >
            <span className="text-2xl">✕</span>
          </button>

          {/* Video Container */}
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="relative bg-gradient-to-br from-pink-900/30 to-red-900/30 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">

              {/* Video Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4 shadow-lg">
                  <span className="text-3xl">{memories.find(m => m.id === playingVideoRef.current)?.emoji}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-dancing font-bold text-white mb-3">
                  {memories.find(m => m.id === playingVideoRef.current)?.title}
                </h2>
                <p className="text-pink-200 text-lg max-w-2xl mx-auto">
                  {memories.find(m => m.id === playingVideoRef.current)?.description}
                </p>
              </div>

              {/* Video Player */}
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                <video
                  ref={el => {
                    if (el && playingVideoRef.current) {
                      videoRefs.current[playingVideoRef.current] = el;
                    }
                  }}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted={false}
                  playsInline
                  onLoadedData={() => handleVideoLoaded(playingVideoRef.current)}
                  onError={() => handleVideoError(playingVideoRef.current)}
                >
                  <source
                    src={memories.find(m => m.id === playingVideoRef.current)?.videoSrc}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>

                {/* Video Loading Overlay */}
                {videoLoadingRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                    <div className="text-center">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mb-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl text-pink-500">💖</span>
                        </div>
                      </div>
                      <p className="text-white text-xl font-medium mb-2">Loading precious moments...</p>
                      <p className="text-pink-300">Your special memory is being prepared</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Footer */}
              <div className="mt-6 text-center">
                <p className="text-pink-200 text-lg italic">
                  Every moment with you is a treasure 💕
                </p>
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* LOVE LETTER MODAL - FIXED SCROLL */}
      {/* ============================== */}
      {showLetter && (
        <div className="fixed inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-rose-600 z-[100] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => setShowLetter(false)}
            className="fixed top-6 right-6 z-20 bg-gradient-to-r from-pink-500 to-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-90"
          >
            <span className="text-2xl">✕</span>
          </button>

          {/* Love Letter Container */}
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-12">
              {/* Letter Header */}
              <div className="text-center p-8 bg-gradient-to-r from-pink-900/50 to-red-900/50 border-b border-white/10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4 shadow-lg">
                  <span className="text-4xl">💌</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-2">
                  My Dearest Jishnu,
                </h2>
                <div className="flex justify-center items-center space-x-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-pink-100 to-transparent"></div>
                  <span className="text-pink-300 text-xl">❤️</span>
                  <div className="w-16 h-1 bg-gradient-to-l from-red-400 to-transparent"></div>
                </div>
              </div>

              {/* Letter Content */}
              <div className="p-8 space-y-6 text-white text-lg leading-relaxed">
                <p className="text-justify">
                  When I start writing this, my heart feels full of love for you.
                  You are the most important person in my life. When I think about you, my heart feels calm and happy.
                  Being with you makes every day feel special.
                </p>

                <p className="text-justify">
                  Even the simplest moments become beautiful when you are around. Your smile brings light to my day,
                  and your presence makes me feel safe and comfortable. Every moment with you is a treasure.
                </p>

                <div className="relative p-8 rounded-2xl bg-gradient-to-r from-pink-900/30 to-red-900/30 border-l-4 border-pink-400 shadow-inner">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md">
                    My Promise to You
                  </div>
                  <p className="text-center text-2xl md:text-3xl font-sacramento text-pink-200 italic">
                    "I will love you in every universe, in every lifetime, in every possible way."
                  </p>
                </div>

                <p className="text-justify">
                  What I love most about you is your kind heart. You care deeply,
                  and that kindness shows in everything you do. It makes me admire you more each day.
                  Your patience, your understanding, and the way you listen - these are gifts I cherish.
                </p>

                <p className="text-justify">
                  Your kindness lights my path, your strength gives me courage,
                  and your love fills my heart with happiness and warmth. You make my life brighter just by being in it.
                  With you, I've found a home in your heart.
                </p>

                <p className="text-justify">
                  On this Valentine's Day, I want to make you a promise: I will care for you, respect you, support you,
                  and love you more every day. I choose you today, tomorrow, and forever.
                </p>
              </div>

              {/* Signature Section */}
              <div className="p-8 bg-gradient-to-r from-pink-900/30 to-red-900/30 border-t border-white/10 text-center">
                <p className="text-2xl font-sacramento text-pink-200 mb-3">
                  With all my heart,
                </p>
                <p className="text-xl text-white font-semibold mb-2">
                  Your Forever Valentine
                </p>
                <p className="text-2xl text-pink-300 font-dancing mb-4">
                  Your Neethii 💕
                </p>
                <p className="text-pink-200 italic mb-6">
                  You are the most beautiful part of my life.
                </p>

                {/* Decorative Elements */}
                <div className="flex justify-center space-x-4">
                  {['🌹', '💐', '❤️', '💮', '💖'].map((emoji, i) => (
                    <span
                      key={i}
                      className="text-2xl transform hover:scale-125 transition-transform"
                      style={{ animation: `bounce-slow 2s infinite ${i * 0.2}s` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* MAIN APP CONTENT (Only shown when no modal is open) */}
      {/* ============================== */}
      {!showLetter && !playingVideoRef.current && (
        <>
          {/* Main Content */}
          <main>
            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
              <div className="text-center z-10 max-w-5xl mx-auto" style={{ animation: 'fadeIn 1s ease-out' }}>
                {/* Decorative Header */}
                <div className="mb-10">
                  <div className="inline-flex items-center space-x-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/40 shadow-lg">
                    <span className="text-red-600 font-medium text-lg">Happy Valentine's Day</span>
                    <span className="text-pink-500">🌹</span>
                  </div>
                </div>

                {/* Main Title */}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-dancing font-bold mb-8">
                  <span className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 bg-clip-text text-transparent block">For My</span>
                  <span className="text-7xl md:text-9xl lg:text-[10rem] block mt-2 text-red-800">
                    Jishnu
                    <span className="inline-block ml-4" style={{ animation: 'heartbeat 1.5s ease-in-out infinite' }}>💝</span>
                  </span>
                </h1>

                {/* Interactive Heart */}
                <div className="mb-10">
                  <button
                    onClick={handleHeartClick}
                    className="group relative w-32 h-32 mx-auto mb-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="text-6xl" style={{ animation: 'heartbeat 1.5s ease-in-out infinite', color: '#e11d48' }}>
                        ❤️
                      </div>
                    </div>
                  </button>
                  <p className="text-red-700 font-medium mb-2">
                    Click the heart! ({clickCount} clicks)
                  </p>

                  {secretMessage && (
                    <p className="text-pink-500 font-semibold" style={{ animation: 'bounce-slow 2s infinite' }}>
                      {secretMessage}
                    </p>
                  )}
                </div>

                {/* Romantic Quote */}
                <div className="relative mb-10 max-w-2xl mx-auto">
                  <p className="text-xl md:text-2xl text-red-700/80 italic font-playfair mb-2">
                    "My love for you is written in the stars, painted in sunsets, and whispered by the wind..."
                  </p>
                </div>

                {/* Love Letter Button */}
                <button
                  onClick={() => setShowLetter(true)}
                  className="group relative bg-gradient-to-r from-pink-500 to-red-500 text-white px-12 py-5 rounded-full text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 overflow-hidden mb-16"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <span className="text-2xl">💌</span>
                    <span>Open My Love Letter</span>
                  </span>
                </button>

                {/* Scroll Indicator */}
                <div style={{ animation: 'bounce-slow 2s infinite' }}>
                  <p className="text-pink-600 mb-3 font-medium">Scroll for more love</p>
                  <div className="text-3xl text-red-500">↓</div>
                </div>
              </div>
            </section>

            {/* Photo & Video Collage Section - FIXED PHOTO FOR MOBILE */}
            <section className="py-24 px-6 bg-gradient-to-b from-white to-pink-50 relative">
              {/* Background Elements */}
              <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-pink-300/20 to-red-300/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-red-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

              <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                  <h2 className="text-5xl md:text-6xl font-dancing bg-gradient-to-r from-pink-500 to-red-600 bg-clip-text text-transparent mb-6">
                    Our Beautiful Memories
                  </h2>
                  <p className="text-xl text-red-700/80 max-w-2xl mx-auto font-playfair mb-12">
                    Every moment with you is a treasure I hold close to my heart
                  </p>

                  {/* Decorative Divider */}
                  <div className="flex items-center justify-center space-x-4 mb-16">
                    <div className="w-20 h-1 bg-gradient-to-r from-transparent to-pink-400"></div>
                    <div className="flex space-x-2">
                      <span className="text-3xl text-pink-500">💕</span>
                    </div>
                    <div className="w-20 h-1 bg-gradient-to-l from-transparent to-red-400"></div>
                  </div>
                </div>

                {/* Photo Collage Container */}
                <div className="relative">
                  {/* Main Photo Frame - Fixed for mobile view */}
                  <div className="max-w-3xl mx-auto mb-16 px-4">
                    <div className="relative group">
                      {/* Polaroid-style Frame */}
                      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 rotate-2 transform hover:rotate-0 transition-transform duration-500">
                        <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-xl overflow-hidden shadow-inner">
                          <img
                            src={ourPhoto}
                            alt="Our beautiful memory"
                            className="w-full h-auto object-contain max-h-[80vh] md:max-h-[500px] transform group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>

                        {/* Polaroid Bottom */}
                        <div className="mt-4 md:mt-6 p-4 border-t border-pink-100">
                          <p className="text-xl md:text-2xl font-dancing text-red-700 text-center mb-2">
                            Our Special Moment 💕
                          </p>
                          <p className="text-sm md:text-base text-red-600 text-center">
                            This photo captures the love we share
                          </p>
                        </div>
                      </div>

                      {/* Decorative Elements Around Photo */}
                      <div className="absolute -top-4 md:-top-6 -left-4 md:-left-6 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 blur-xl"></div>
                      <div className="absolute -bottom-4 md:-bottom-6 -right-4 md:-right-6 w-20 md:w-28 h-20 md:h-28 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>

                      {/* Floating Hearts */}
                      <div className="absolute -top-4 -right-4 w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
                        <span className="text-xl md:text-2xl text-white">💖</span>
                      </div>
                      <div className="absolute -bottom-4 -left-4 w-10 md:w-14 h-10 md:h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                        <span className="text-lg md:text-xl text-white">🌸</span>
                      </div>
                    </div>
                  </div>

                  {/* Video Memory Cards - Normal grid layout (no horizontal scroll) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
                    {memories.map((memory, index) => (
                      <div
                        key={memory.id}
                        onClick={() => playVideo(memory.id)}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 transform hover:scale-[1.05] transition-all duration-500 shadow-xl hover:shadow-2xl border border-white/50 hover:border-pink-200 relative overflow-hidden cursor-pointer"
                        style={{
                          animation: `fadeIn 1s ease-out ${index * 0.2}s forwards`,
                          opacity: 0
                        }}
                      >
                        {/* Memory Emoji Icon */}
                        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-r from-pink-400 to-red-400 flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                          <span className="text-3xl md:text-4xl">{memory.emoji}</span>
                        </div>

                        {/* Memory Info */}
                        <div className="relative z-10">
                          <h3 className="text-xl md:text-2xl font-bold text-red-700 text-center mb-3 md:mb-4">
                            {memory.title}
                          </h3>
                          <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                            {memory.description}
                          </p>

                          {/* Play Video Button */}
                          <div className="flex justify-center">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-red-100 px-4 md:px-6 py-2 md:py-3 rounded-full group-hover:from-pink-200 group-hover:to-red-200 transition-all duration-300">
                              <span className="text-red-600 text-lg md:text-xl">▶️</span>
                              <span className="text-red-700 text-sm md:text-base font-medium">Click to Watch Video</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-red-500/0 group-hover:from-pink-500/10 group-hover:to-red-500/10 transition-all duration-500"></div>

                        {/* Corner Accent */}
                        <div className="absolute top-0 right-0 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-bl-2xl"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Music Section */}
            <section className="py-24 px-6 bg-gradient-to-b from-pink-100 to-white">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center space-x-3 mb-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center shadow-xl">
                    <span className="text-3xl">🎵</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-dancing bg-gradient-to-r from-pink-500 to-red-600 bg-clip-text text-transparent">
                    Our Special Song
                  </h2>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/50 mb-10">
                  <div className="flex flex-col md:flex-row items-center gap-10 mb-8">
                    <div className="flex-shrink-0">
                      <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-2xl animate-pulse">
                        <span className="text-6xl">🎶</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-3xl font-bold text-red-700 mb-3">
                        Sneham Cherum Neram
                      </h3>
                      <p className="text-red-600 mb-4">
                        “The song ‘Sneham Cherum Neram’ holds a very special place in my heart. On my birthday, you shared it on your story with my photo, and that moment is something I’ll never forget. Om Shanti Om is one of my favorite movies, and because of that, this song has become our love anthem.”
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-gradient-to-r from-pink-100 to-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
                          💖 Our Love Anthem
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-6">
                    <button
                      onClick={toggleMusic}
                      className={`px-8 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 ${musicPlaying
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                        }`}
                    >
                      <span className="text-xl">
                        {musicPlaying ? '⏸️' : '▶️'}
                      </span>
                      <span>{musicPlaying ? 'Pause Music' : 'Play Our Song'}</span>
                    </button>

                    {musicPlaying && (
                      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                        <button
                          onClick={decreaseVolume}
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-100 to-red-100 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                          title="Decrease volume"
                        >
                          <span className="text-xl text-red-600">🔉</span>
                        </button>
                        <div className="w-48">
                          <div className="text-sm text-red-600 mb-1 font-medium">Volume Control</div>
                          <div className="relative h-3 bg-pink-100 rounded-full overflow-hidden">
                            <div
                              className="absolute h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-300"
                              style={{ width: `${volume * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-pink-600 text-center mt-1">
                            Current: {Math.round(volume * 100)}%
                          </div>
                        </div>
                        <button
                          onClick={increaseVolume}
                          className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-100 to-red-100 flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                          title="Increase volume"
                        >
                          <span className="text-xl text-red-600">🔊</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {musicPlaying && (
                    <div className="mt-8 pt-8 border-t border-pink-200">
                      <p className="text-pink-600 font-medium mb-2 animate-pulse">
                        🎵 Now playing...
                      </p>
                      <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="w-1 h-6 rounded-full bg-gradient-to-r from-pink-500 to-red-500 animate-bounce"
                              style={{
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: `${0.5 + Math.random() * 0.5}s`
                              }}
                            ></div>
                          ))}
                        </div>
                        <p className="text-red-600 font-semibold text-lg">
                          Sneham Cherum Neram
                        </p>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="w-1 h-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-bounce"
                              style={{
                                animationDelay: `${i * 0.15}s`,
                                animationDuration: `${0.5 + Math.random() * 0.5}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <p className="text-pink-500 text-sm mt-2">Our love theme 💖</p>
                    </div>
                  )}
                </div>

                <p className="text-xl text-red-600/80 italic font-playfair max-w-2xl mx-auto">
                  "Music is the language of love, and this song speaks our heart's story"
                </p>
              </div>
            </section>

            {/* Final Message Section */}
            <section className="py-24 px-6 bg-gradient-to-r from-red-600 via-pink-500 to-red-700 text-white relative overflow-hidden">
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <h2 className="text-5xl md:text-6xl font-dancing mb-12">
                  To My Forever Valentine
                </h2>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 max-w-3xl mx-auto border border-white/20 shadow-2xl mb-16">
                  <p className="text-2xl font-great font-light italic mb-8">
                    പ്രതീക്ഷിക്കാതെ എന്റെ ജീവിതത്തിലേക്ക് വന്ന നീ, ഇന്ന് എന്റെ ജീവിതത്തിന്റെ ഏറ്റവും വലിയ ഭാഗമാണ്.
                    നീ എന്റെ ജീവിതത്തിലേക്ക് വന്നതോടെ എന്റെ ജീവിതം കുറച്ച് കൂടി മനോഹരമായി. നിന്റെ അടുത്ത് ഇരിക്കുമ്പോഴും, നീ കൂടെ ഉണ്ടാകുമ്പോഴും, ഞാൻ ഈ ലോകത്തിലെ ഏറ്റവും ഭാഗ്യവാനാണെന്ന് തോന്നുന്നു. എന്നും എപ്പോഴും,
                    ജീവിതം മുഴുവൻ നീ എന്റെ കൂടെ വേണം.
                  </p>
                  <div className="flex justify-center space-x-6 text-4xl">
                    {['💖'].map((emoji, i) => (
                      <span
                        key={i}
                        className="transform hover:scale-125 transition-transform"
                        style={{ animation: `bounce-slow 2s infinite ${i * 0.2}s` }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Final Heart */}
                <div className="mt-12">
                  <div className="text-8xl mb-6" style={{ animation: 'heartbeat 1.5s ease-in-out infinite' }}>

                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-red-800 text-white py-16 px-6 text-center relative overflow-hidden">
            {/* Background Hearts */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-pink-300"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    fontSize: `${Math.random() * 30 + 20}px`,
                    animation: `float ${Math.random() * 4 + 2}s infinite`,
                    animationDelay: `${i * 0.3}s`
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Main Message */}
              <div className="mb-10">
                <p className="text-2xl mb-4">
                  Made with infinite love for the most amazing person
                </p>
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-600 to-red-600 px-8 py-3 rounded-full mb-6">
                  <p className="text-3xl font-dancing">
                    Jishnuuu...
                  </p>
                </div>
                <p className="text-xl text-red-200 mb-8">
                  Happy Valentine's Day, my love! 💕
                </p>
              </div>

              {/* Neethii Signature Section */}
              <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-red-600/30 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-3xl">💝</span>
                  </div>
                  <h3 className="text-2xl font-dancing text-pink-200 mb-2">
                    From Your Love
                  </h3>
                  <p className="text-3xl font-dancing text-white font-bold mb-4">
                    Neethiiii
                  </p>
                  <p className="text-red-200 max-w-md mx-auto italic">
                    Forever yours, today and always. Every beat of my heart whispers your name.
                  </p>
                </div>
              </div>

              {/* Emoji Buttons */}
              <div className="flex justify-center space-x-8 mb-10">
                {[ '💕' ].map((emoji, i) => (
                  <button
                    key={i}
                    className="text-3xl hover:scale-125 hover:text-pink-300 transition-all duration-300 transform hover:rotate-12"
                    style={{ animation: `bounce-slow 2s infinite ${i * 0.1}s` }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Final Message */}
              <div className="pt-6 border-t border-red-700">
                <p className="text-lg text-red-300">
                  With all my love, today and forever 💖
                </p>
                <p className="text-sm text-red-400 mt-2">
                  Created specially for you, Jishnu ❤️
                </p>
              </div>
            </div>
          </footer>

          {/* Floating Message */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-100 to-red-100 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl border border-pink-300 z-40" style={{ animation: 'bounce-slow 2s infinite' }}>
            <p className="text-red-700 font-semibold flex items-center space-x-3">
              <span className="flex items-center space-x-2">
                <span>I love you, Jishnu!</span>
                <span className="text-pink-500 font-dancing">- Neethii 💖</span>
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default App