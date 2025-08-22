import confetti from 'canvas-confetti';

document.addEventListener('DOMContentLoaded', () => {
    const cake = document.getElementById('birthday-cake');
    const heading = document.getElementById('birthday-heading');
    const videoModal = document.getElementById('video-modal');
    const birthdayVideo = document.getElementById('birthday-video');
    const closeVideo = document.getElementById('close-video');

    let audioContext;
    let audioBuffer;
    let audioSource; // Keep track of the audio source to pause it
    let hasPlayed = false;
    let clickCount = 0;

    // --- Web Audio API setup for sound ---
    async function initAudio() {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const response = await fetch('happy-birthday.mp3');
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    }

    function playSound() {
        if (!audioContext || !audioBuffer) return;
        
        // Ensure we can play audio after user interaction
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Stop any existing sound before playing a new one
        if (audioSource) {
            audioSource.stop();
        }

        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);
        audioSource.start(0);
    }

    function pauseSound() {
        if (audioSource && audioContext.state === 'running') {
            audioContext.suspend();
        }
    }
    
    // --- Confetti setup ---
    const myCanvas = document.getElementById('confetti-canvas');
    const myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true
    });

    function launchConfetti() {
        // The big, long-lasting confetti effect
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    function burstFromCake() {
        // A single, more intense burst from the cake's position
        const rect = cake.getBoundingClientRect();
        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = (rect.top + rect.height / 2) / window.innerHeight;

        myConfetti({
            particleCount: 150,
            spread: 90,
            startVelocity: 60,
            origin: { x: originX, y: originY },
            zIndex: 1000 // Make sure it's above the card
        });
    }

    function triggerAnimations() {
        // Add animation classes
        cake.classList.add('animate');
        heading.classList.add('animate');

        // Remove classes after animation ends to allow re-triggering
        setTimeout(() => {
            cake.classList.remove('animate');
            heading.classList.remove('animate');
        }, 1000); // Duration should match the CSS animation duration
    }

    // --- Video Modal ---
    function showVideo() {
        pauseSound();
        videoModal.classList.remove('hidden');
        birthdayVideo.currentTime = 0;
        birthdayVideo.play();
    }

    function hideVideo() {
        birthdayVideo.pause();
        videoModal.classList.add('hidden');
        if (audioContext && audioContext.state === 'suspended') {
             audioContext.resume(); // Resume birthday music if it was paused
        }
    }

    closeVideo.addEventListener('click', hideVideo);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) { // only close if overlay is clicked
            hideVideo();
        }
    });

    // --- Event Listener ---
    cake.addEventListener('click', async () => {
        clickCount++;

        // These effects happen on every click
        triggerAnimations();
        burstFromCake();
        
        if (clickCount === 1) {
            // Effects for the very first click
            await initAudio(); 
            playSound();
            launchConfetti();
        } else if (clickCount >= 2) {
            // Effects for the second click and onwards
            showVideo();
        }
    });
});