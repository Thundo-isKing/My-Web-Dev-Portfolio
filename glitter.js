// Mouse-reactive glitter movement
document.addEventListener('DOMContentLoaded', () => {
	const bigRibbons = document.querySelectorAll(
		'.ribbon-1, .ribbon-3, .ribbon-5, .ribbon-7, .ribbon-10, .ribbon-12, .ribbon-13, .ribbon-14, .ribbon-15, .ribbon-16'
	);

	if (bigRibbons.length > 0) {
		bigRibbons.forEach((ribbon, index) => {
			const computed = window.getComputedStyle(ribbon);
			const durationToken = computed.animationDuration.split(',')[0].trim();
			const durationSeconds = durationToken.endsWith('ms')
				? parseFloat(durationToken) / 1000
				: parseFloat(durationToken);

			if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

			const phase = (index + 0.5) / bigRibbons.length;
			const delaySeconds = -(phase * durationSeconds);
			ribbon.style.animationDelay = `${delaySeconds}s`;
		});
	}

	const glitterContainer = document.querySelector('.bg-glitter');
	const specialGlitterContainer = document.querySelector('.bg-glitter-special');
	const ribbonsContainer = document.querySelector('.bg-ribbons');
	const bgBase = document.querySelector('.bg-base');
	if (!glitterContainer) return;

	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;
	let scrollY = window.scrollY;

	document.addEventListener('mousemove', (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
	});

	window.addEventListener('scroll', () => {
		scrollY = window.scrollY;
	}, { passive: true });

	function updateGlitterPositions() {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;

		// Mouse parallax
		const offsetX = (centerX - mouseX) / 50;
		const offsetY = (centerY - mouseY) / 50;

		// Scroll parallax — each layer moves at a different rate
		const s = scrollY;
		glitterContainer.style.transform    = `translate(${offsetX}px, ${offsetY - s * 0.25}px)`;
		if (ribbonsContainer) ribbonsContainer.style.transform = `translateY(${-s * 0.08}px)`;
		if (bgBase)           bgBase.style.transform           = `translateY(${-s * 0.04}px)`;

		if (specialGlitterContainer) {
			const specialOffsetX = (centerX - mouseX) * 0.15;
			const specialOffsetY = (centerY - mouseY) * 0.15;
			specialGlitterContainer.style.transform = `translate(${specialOffsetX}px, ${specialOffsetY - s * 0.18}px)`;
		}

		requestAnimationFrame(updateGlitterPositions);
	}

	updateGlitterPositions();

	// Make capital letters significantly larger
	const heading = document.querySelector('.hero h1');
	if (heading) {
		const text = heading.textContent;
		const wrapped = text.replace(/[A-Z]/g, '<span class="cap-letter">$&</span>');
		heading.innerHTML = wrapped;
	}

	// Mouse-following sheen on hero card AND click animation
	const heroCard = document.getElementById('hero-card');
	const contentSection = document.getElementById('content-section');
	const siteShell = document.querySelector('.site-shell');

	const allCards = [
		{ el: document.querySelector('.card-toolbox'),    x: -1, y: 0 },
		{ el: document.querySelector('.card-works'),      x: 0,  y: 1 },
		{ el: document.querySelector('.card-experience'), x: 1,  y: 0 },
		{ el: document.querySelector('.tech-stack'),      x: 0,  y: 1 },
	];

	// Put all cards in hidden off-screen state
	function resetCardsToHidden() {
		allCards.forEach(({ el, x, y }) => {
			if (!el) return;
			el.classList.remove('card-visible');
			el.removeAttribute('data-tilt-ready');
			el.style.animation = 'none';
			el.style.transition = 'none';
			el.style.opacity = '0';
			el.style.transform = `translate(${x * 80}px, ${y * 80}px)`;
		});
	}

	// Animate cards in one by one
	function animateCardsIn() {
		// Animation durations from CSS: 0.8s animation + delay per card (0, 0.35, 0.7, 1.05s)
		const animDelays = [0, 350, 700, 1050];
		const animDuration = 800;

		allCards.forEach(({ el }, i) => {
			if (!el) return;
			el.classList.remove('card-visible');
			el.removeAttribute('data-tilt-ready');
			el.style.animation  = 'none';
			el.style.transition = 'none';
			el.style.opacity    = '0';
			void el.offsetWidth; // force reflow

			setTimeout(() => {
				el.style.animation  = '';
				el.style.transition = '';
				el.classList.add('card-visible');
			}, i * 350);

			// Set tilt-ready after animation fully completes (delay + duration + small buffer)
			const readyAt = i * 350 + animDelays[i] + animDuration + 50;
			setTimeout(() => {
				el.classList.remove('card-visible');
				el.style.opacity   = '1';
				el.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
				el.setAttribute('data-tilt-ready', '1');
			}, readyAt);
		});
	}

	// Init: hidden
	resetCardsToHidden();

	if (heroCard && contentSection && siteShell) {
		heroCard.style.cursor = 'pointer';

		// ── 3D tilt ──
		const MAX_TILT  = 14;        // degrees at the edge
		const TILT_LERP = 0.07;     // lower = more lag / weight
		let tiltTargetX = 0, tiltTargetY = 0;
		let tiltCurrentX = 0, tiltCurrentY = 0;
		let tiltLoopRunning = false;

		function tiltLoop() {
			tiltCurrentX += (tiltTargetX - tiltCurrentX) * TILT_LERP;
			tiltCurrentY += (tiltTargetY - tiltCurrentY) * TILT_LERP;
			heroCard.style.transform =
				`perspective(900px) rotateX(${tiltCurrentX}deg) rotateY(${tiltCurrentY}deg) scale(1.02)`;
			const stillMoving =
				Math.abs(tiltTargetX - tiltCurrentX) > 0.02 ||
				Math.abs(tiltTargetY - tiltCurrentY) > 0.02;
			if (stillMoving) {
				requestAnimationFrame(tiltLoop);
			} else {
				tiltLoopRunning = false;
				// Snap exactly to target to avoid micro-drift
				heroCard.style.transform =
					`perspective(900px) rotateX(${tiltTargetX}deg) rotateY(${tiltTargetY}deg) scale(1.02)`;
			}
		}

		function startTiltLoop() {
			if (tiltLoopRunning) return;
			tiltLoopRunning = true;
			requestAnimationFrame(tiltLoop);
		}

		heroCard.addEventListener('mousemove', (e) => {
			const rect = heroCard.getBoundingClientRect();
			// Sheen
			heroCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
			heroCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
			// Tilt: normalize mouse to -1..1 from card center
			const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
			const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
			// rotateY: mouse right → right comes forward
			// rotateX: mouse top  → top goes back (negative ny = positive rotateX)
			tiltTargetY =  nx * MAX_TILT;
			tiltTargetX = -ny * MAX_TILT;
			startTiltLoop();
		});
		heroCard.addEventListener('mouseleave', () => {
			heroCard.style.setProperty('--mouse-x', '-100%');
			heroCard.style.setProperty('--mouse-y', '-100%');
			// Return to flat
			tiltTargetX = 0;
			tiltTargetY = 0;
			startTiltLoop();
		});

		// ── 3D tilt for info cards ──
		const CARD_MAX_TILT  = 18;
		const CARD_TILT_LERP = 0.07;
		const tiltCards = [
			document.querySelector('.card-toolbox'),
			document.querySelector('.card-works'),
			document.querySelector('.card-experience'),
		].filter(Boolean);

		tiltCards.forEach(card => {
			let tx = 0, ty = 0, cx = 0, cy = 0, looping = false;

			function loop() {
				cx += (tx - cx) * CARD_TILT_LERP;
				cy += (ty - cy) * CARD_TILT_LERP;
				card.style.transform =
					`perspective(500px) rotateX(${cx}deg) rotateY(${cy}deg) scale(1.04)`;
				if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) {
					requestAnimationFrame(loop);
				} else {
					looping = false;
					card.style.transform =
						`perspective(500px) rotateX(${tx}deg) rotateY(${ty}deg) scale(${tx === 0 && ty === 0 ? 1 : 1.04})`;
				}
			}

			function start() {
				if (!card.hasAttribute('data-tilt-ready')) return;
				if (looping) return;
				looping = true;
				requestAnimationFrame(loop);
			}

			card.addEventListener('mousemove', e => {
				const r  = card.getBoundingClientRect();
				const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
				const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
				ty =  nx * CARD_MAX_TILT;
				tx = -ny * CARD_MAX_TILT;
				start();
			});
			card.addEventListener('mouseleave', () => {
				if (!card.hasAttribute('data-tilt-ready')) return;
				tx = 0; ty = 0;
				start();
			});
		});

		let isAnimating = false;
		let isContentActive = false;

		heroCard.addEventListener('click', () => {
			if (isAnimating) return;
			isAnimating = true;
			isContentActive = true;

			siteShell.classList.add('animating');

			setTimeout(() => {
				contentSection.classList.add('active');
				resetCardsToHidden();
				// Small delay so content section is visible before cards fly in
				setTimeout(() => {
					animateCardsIn();
					// Start intro animation after card-toolbox entrance completes
					// Card-toolbox: 0ms delay + 800ms animation + buffer = 1200ms
					setTimeout(() => {
						if (window.startIntroAnimation) {
							window.startIntroAnimation();
						}
					}, 1200);
					// Start works animation after card-works entrance completes
					// Card-works: 350ms delay + 800ms animation + buffer = 1550ms
					setTimeout(() => {
						if (window.startWorksAnimation) {
							window.startWorksAnimation();
						}
					}, 1550);
					// Start experience animation after card-experience entrance completes
					// Card-experience: 700ms delay + 800ms animation + buffer = 1900ms
					setTimeout(() => {
						if (window.startExperienceAnimation) {
							window.startExperienceAnimation();
						}
					}, 1900);
					// Start auto-cycle 17 seconds after hero card click
					setTimeout(() => {
						if (window.autoCyclePieSlices) {
							window.autoCyclePieSlices();
						}
					}, 17000);				}, 100);
			}, 1000);

			setTimeout(() => {
				siteShell.style.display = 'none';
				isAnimating = false;
			}, 1800);
		});

		// ── Scroll-gesture exit ──
		// targetProgress: where the scroll says we should be (0–1)
		// visualProgress: where the cards actually are right now (lerps toward target)
		// A dedicated RAF loop runs while the gesture is active, smoothly interpolating.
		const EXIT_THRESHOLD = 600;   // higher = more scroll needed, feels less twitchy
		let upwardDelta   = 0;
		let gestureTimer  = null;
		let gestureActive = false;    // true while the lerp loop is running
		let snapping      = false;    // true while snapping back via lerp
		let targetProgress  = 0;
		let visualProgress  = 0;
		const LERP_SPEED    = 0.08;   // 0–1: higher = snappier, lower = more lag

		// Strip CSS animation once so inline styles own the cards
		function beginGesture() {
			if (gestureActive) return;
			gestureActive = true;
			snapping = false;
			allCards.forEach(({ el }) => {
				if (!el) return;
				el.classList.remove('card-visible');
				el.style.animation  = 'none';
				el.style.transition = 'none';
				el.style.opacity    = '1';
				el.style.transform  = 'translate(0, 0)';
			});
			runGestureLoop();
		}

		// Apply visual progress to cards (no transition — loop owns the motion)
		function applyVisual(vp) {
			allCards.forEach(({ el, x, y }, i) => {
				if (!el) return;
				const delay = i * 0.06;
				const p    = Math.max(0, Math.min(1, (vp - delay) / (1 - delay * allCards.length * 0.5)));
				const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
				el.style.transform = `translate(${x * 80 * ease}px, ${y * 80 * ease}px)`;
				el.style.opacity   = String(1 - ease * 0.95);
			});
		}

		// The main lerp loop — runs every frame while gesture is active
		function runGestureLoop() {
			if (!gestureActive) return;

			// Lerp visual toward target
			visualProgress += (targetProgress - visualProgress) * LERP_SPEED;

			// Stop looping when close enough and snapping back to 0
			if (snapping && visualProgress < 0.002) {
				visualProgress = 0;
				gestureActive  = false;
				snapping       = false;
				// Restore cards fully
				allCards.forEach(({ el }) => {
					if (!el) return;
					el.style.animation  = '';
					el.style.transition = '';
					el.style.opacity    = '1';
					el.style.transform  = 'translate(0, 0)';
				});
				return;
			}

			applyVisual(visualProgress);
			requestAnimationFrame(runGestureLoop);
		}

		function snapBack() {
			targetProgress = 0;
			snapping       = true;
			upwardDelta    = 0;
			// gestureActive loop continues — it'll auto-stop when close to 0
		}

		function commitExit() {
			// Hand off from lerp loop to CSS transition for the final fly-out
			gestureActive = false;
			allCards.forEach(({ el, x, y }) => {
				if (!el) return;
				el.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 1, 1), opacity 0.45s ease';
				el.style.transform  = `translate(${x * 80}px, ${y * 80}px)`;
				el.style.opacity    = '0';
			});

			setTimeout(() => {
				contentSection.classList.remove('active');
				visualProgress = 0;
				targetProgress = 0;
				resetCardsToHidden();
			}, 450);

			setTimeout(() => {
				siteShell.style.display = '';
				siteShell.classList.remove('animating');
				siteShell.classList.add('fading-in');
				setTimeout(() => {
					siteShell.classList.remove('fading-in');
					isAnimating = false;
					upwardDelta = 0;
				}, 600);
			}, 850);
		}

		window.addEventListener('wheel', (e) => {
			if (!isContentActive || isAnimating) return;

			if (e.deltaY < 0) {
				beginGesture();
				upwardDelta  += Math.abs(e.deltaY);
				targetProgress = Math.min(upwardDelta / EXIT_THRESHOLD, 1);
				clearTimeout(gestureTimer);

				if (upwardDelta >= EXIT_THRESHOLD) {
					isAnimating    = true;
					isContentActive = false;
					commitExit();
				} else {
					gestureTimer = setTimeout(() => snapBack(), 350);
				}
			} else if (e.deltaY > 0 && upwardDelta > 0) {
				upwardDelta    = Math.max(0, upwardDelta - Math.abs(e.deltaY) * 1.5);
				targetProgress = upwardDelta / EXIT_THRESHOLD;
				clearTimeout(gestureTimer);
				if (upwardDelta <= 0) snapBack();
			}
		}, { passive: true });
	}
	// Interactive Pie Chart
	const pieSlices = document.querySelectorAll('.pie-slice');
	const expLabels = document.querySelectorAll('.exp-label');
	const expTitle = document.querySelector('.experience-title');
	
	if (pieSlices.length > 0 && expTitle) {
		const defaultText = expTitle.textContent;
		
		function showYears(category, years) {
			expTitle.style.opacity = '0';
			setTimeout(() => {
				expTitle.textContent = `${years} YRS`;
				expTitle.style.opacity = '1';
			}, 150);
			expLabels.forEach(label => {
				label.classList.toggle('active', label.dataset.category === category);
			});
		}
		
		function resetTitle() {
			expTitle.style.opacity = '0';
			setTimeout(() => {
				expTitle.textContent = defaultText;
				expTitle.style.opacity = '1';
			}, 150);
			expLabels.forEach(label => label.classList.remove('active'));
		}
		
		pieSlices.forEach(slice => {
			slice.addEventListener('mouseenter', () => {
				showYears(slice.dataset.category, slice.dataset.years);
			});
			slice.addEventListener('mouseleave', resetTitle);
		});
		
		expLabels.forEach(label => {
			label.addEventListener('mouseenter', () => {
				const slice = document.querySelector(`.pie-slice[data-category="${label.dataset.category}"]`);
				if (slice) {
					showYears(label.dataset.category, slice.dataset.years);
					slice.classList.add('label-hover');
				}
			});
			label.addEventListener('mouseleave', () => {
				const slice = document.querySelector(`.pie-slice[data-category="${label.dataset.category}"]`);
				if (slice) {
					slice.classList.remove('label-hover');
				}
				resetTitle();
			});
		});
	}

	// ============================================
	// PIE CHART HOVER TEXT TRANSITIONS
	// ============================================
	const introTextElement = document.getElementById('intro-text');
	const textOverlay = document.getElementById('text-transition-overlay');
	
	if (introTextElement && textOverlay && pieSlices.length > 0) {
		let currentCategory = null;
		let isTransitioning = false;
		let transitionTimeout = null;
		let slideInTimeout = null;
		let slideOutTimeout = null;
		let resetTimeout = null;
		let glowInterval = null;
		
		// Match the exact structure created by revealTextWordByWord() with word spans and highlights
		const originalText = '<span class="word">Hey,</span> <span class="word">My</span> <span class="word">name</span> <span class="word">is</span> <span class="word highlight">David.</span> <span class="word">I</span> <span class="word">am</span> <span class="word">a</span> <span class="word highlight">Fullstack</span> <span class="word highlight">Web</span> <span class="word highlight">Developer</span> <span class="word">with</span> <span class="word">experience</span> <span class="word">in</span> <span class="word highlight">Game</span> <span class="word highlight">Development</span> <span class="word">and</span> <span class="word highlight">Graphics</span> <span class="word highlight">Design.</span>';
		
		const categoryDescriptions = {
			'game-dev': "Game Development is where my <span class='highlight glow-word'>journey</span> started. I was introduced to coding in <span class='highlight glow-word'>2nd grade</span> and fell in love with it. This is where I solidified the ability of thinking like a <span class='highlight glow-word'>problem solver</span> and in the next <span class='highlight glow-word'>five years</span> learned <span class='highlight glow-word'>Scratch</span>, <span class='highlight glow-word'>Python</span> and a touch of <span class='highlight glow-word'>JS</span>.",
		'graphics': "Always loved drawing and art but I started taking Graphics Design Classes in <span class='highlight glow-word'>10th grade</span>. After that I took <span class='highlight glow-word'>Adobe Certification</span> for <span class='highlight glow-word'>Photoshop</span> and <span class='highlight glow-word'>Illustrator</span> classes in <span class='highlight glow-word'>11th/12th</span> (Yes i'm Adobe Certified).",
	'front-end': "<span class='highlight glow-word'>Web Development</span> is actually a more recent endeavor for me. I didn't want to wait until college so I started with <span class='highlight glow-word'>HTML</span> and <span class='highlight glow-word'>CSS</span>. <span class='highlight glow-word'>JS</span> is still giving me trouble (: )",
	'back-end': "Figuring out that there were two sides to the Web Dev coin took me longer than I'd like to admit. I practiced my <span class='highlight glow-word'>Backend Dev</span> skills with <span class='highlight glow-word'>PostgreSQL</span>, <span class='highlight glow-word'>Node.js</span> and <span class='highlight glow-word'>frameworks</span> like <span class='highlight glow-word'>Neon</span> for storing data in my project <span class='highlight glow-word'>~TMR~</span> which you'll see in <span class='highlight glow-word'>My Works</span>."
	};
			// Glow wave animation for word spans
		function startWordGlowWave() {
			const wordSpans = introTextElement.querySelectorAll('.word');
			if (wordSpans.length === 0) return;
			
			introTextElement.classList.add('glow-active');
			
			// Glow each word in sequence with increasing brightness
			for (let i = 0; i < wordSpans.length; i++) {
				setTimeout(() => {
					wordSpans[i].classList.add('glowing');
					// Increase overall brightness as we progress
					const progress = (i + 1) / wordSpans.length;
					introTextElement.style.filter = `brightness(${1.1 + progress * 0.3}) drop-shadow(0 0 ${10 + progress * 20}px rgba(255, 215, 0, ${0.3 + progress * 0.4}))`;
					
					// Remove glowing class after animation
					setTimeout(() => {
						wordSpans[i].classList.remove('glowing');
					}, 800);
				}, i * 120); // 120ms between each word glow
			}
			
			// Reset after animation completes
			setTimeout(() => {
				introTextElement.classList.remove('glow-active');
				introTextElement.style.filter = '';
			}, wordSpans.length * 120 + 1000);
		}
		
		// Glow wave for category descriptions (glow highlighted words)
		function startCategoryGlowWave() {
			const glowWords = introTextElement.querySelectorAll('.glow-word');
			if (glowWords.length === 0) return;
			
			introTextElement.style.transition = 'filter 0.3s ease';
			
			// Glow each highlighted word in sequence
			for (let i = 0; i < glowWords.length; i++) {
				setTimeout(() => {
					glowWords[i].classList.add('glowing');
					// Increase overall brightness as we progress
					const progress = (i + 1) / glowWords.length;
					introTextElement.style.filter = `brightness(${1.1 + progress * 0.3}) drop-shadow(0 0 ${10 + progress * 20}px rgba(255, 215, 0, ${0.3 + progress * 0.4}))`;
					
					// Remove glowing class after animation
					setTimeout(() => {
						glowWords[i].classList.remove('glowing');
					}, 800);
				}, i * 250); // 250ms between each highlight glow
			}
			
			// Reset after animation completes
			setTimeout(() => {
				introTextElement.style.filter = '';
			}, glowWords.length * 250 + 1000);
		}
		
		function transitionText(newText, category) {
			// Clear any pending timeouts from previous transitions
			if (transitionTimeout) clearTimeout(transitionTimeout);
			if (slideInTimeout) clearTimeout(slideInTimeout);
			if (slideOutTimeout) clearTimeout(slideOutTimeout);
			if (resetTimeout) clearTimeout(resetTimeout);
			if (glowInterval) clearInterval(glowInterval);
			
			// Reset overlay state
			textOverlay.classList.remove('slide-in', 'slide-out');
			
			isTransitioning = true;
			currentCategory = category;
			
			// Start slide-in
			textOverlay.classList.add('slide-in');
			
			// Change text while covered (after 200ms into slide-in)
			slideInTimeout = setTimeout(() => {
				introTextElement.innerHTML = newText;
				
				// If returning to original text, ensure word spans are visible and maintain flex layout
				if (category === null) {
					introTextElement.classList.add('revealing');
					const wordSpans = introTextElement.querySelectorAll('.word');
					wordSpans.forEach(span => {
						span.style.opacity = '1';
						span.style.animationDelay = '0s';
					});
				} else {
					// Category description - use normal block layout
					introTextElement.classList.remove('revealing');
					introTextElement.style.opacity = '1';
				}
			}, 200);
			
			// Start slide-out after slide-in completes
			slideOutTimeout = setTimeout(() => {
				textOverlay.classList.remove('slide-in');
				textOverlay.classList.add('slide-out');
				
				// Reset after slide-out completes
				resetTimeout = setTimeout(() => {
					textOverlay.classList.remove('slide-out');
					isTransitioning = false;
					
					// Trigger glow animation after transition completes
					if (category === null) {
						// Returning to original text - start word glow wave and repeat every 60 seconds
						setTimeout(() => {
							startWordGlowWave();
							glowInterval = setInterval(startWordGlowWave, 60000);
						}, 500);
				} else {
					// Category description - start highlight glow wave and repeat every 60 seconds
						setTimeout(() => {
							startCategoryGlowWave();
							glowInterval = setInterval(startCategoryGlowWave, 60000);
						}, 500);
					}
				}, 400);
			}, 400);
		}
		
		function showCategoryText(category) {
			// If already showing this category, do nothing
			if (currentCategory === category) return;
			
			const description = categoryDescriptions[category];
			if (description) {
				transitionText(description, category);
			}
		}
		
		function returnToOriginal() {
			// Delay the return slightly to allow smooth transitions when moving between slices
			transitionTimeout = setTimeout(() => {
				if (currentCategory !== null) {
					transitionText(originalText, null);
				}
			}, 150);
		}
		
		// Add hover listeners to pie slices
		pieSlices.forEach(slice => {
			slice.addEventListener('mouseenter', () => {
				if (transitionTimeout) {
					clearTimeout(transitionTimeout);
				}
				showCategoryText(slice.dataset.category);
			});
			slice.addEventListener('mouseleave', returnToOriginal);
		});
		
		// Add hover listeners to labels
		expLabels.forEach(label => {
			label.addEventListener('mouseenter', () => {
				if (transitionTimeout) {
					clearTimeout(transitionTimeout);
				}
				showCategoryText(label.dataset.category);
			});
			label.addEventListener('mouseleave', returnToOriginal);
		});
		
		// ============================================
		// AUTO-CYCLE THROUGH PIE SLICES
		// ============================================
		let autoCycleTimeout = null;
		let isUserInteracting = false;
		
	window.autoCyclePieSlices = function() {
		if (isUserInteracting) return;
		
		const categories = ['game-dev', 'graphics', 'front-end', 'back-end'];
		let currentIndex = 0;
		
		function activateNextSlice() {
			if (isUserInteracting) return;
			
			const category = categories[currentIndex];
			const slice = document.querySelector(`.pie-slice[data-category="${category}"]`);
			const label = document.querySelector(`.exp-label[data-category="${category}"]`);
			
			if (slice && label) {
				// Add hover effect to slice
				slice.classList.add('label-hover');
				
				// Show category text
				showCategoryText(category);
				
				// Show years in title
				const years = slice.dataset.years;
					if (expTitle) {
						expTitle.style.opacity = '0';
						setTimeout(() => {
							expTitle.textContent = `${years} YRS`;
							expTitle.style.opacity = '1';
						}, 150);
					}
					label.classList.add('active');
					
					// Remove hover after duration
					setTimeout(() => {
						if (!isUserInteracting) {
							slice.classList.remove('label-hover');
							label.classList.remove('active');
							
							currentIndex++;
							if (currentIndex < categories.length) {
								// Move to next slice after brief pause
								setTimeout(activateNextSlice, 800);
							} else {
								// All slices shown, return to original
								setTimeout(() => {
									if (!isUserInteracting) {
										returnToOriginal();
										if (expTitle) {
											expTitle.style.opacity = '0';
											setTimeout(() => {
												expTitle.textContent = "10 YEARS";
												expTitle.style.opacity = '1';
											}, 150);
										}
								}
								
								// Restart the cycle after a longer pause
								autoCycleTimeout = setTimeout(window.autoCyclePieSlices, 30000); // Restart every 30 seconds
								}, 1000);
							}
						}
					}, 6000); // Show each slice for 6 seconds
				}
			}
			
			activateNextSlice();
		};
		
		// Detect user interaction to pause auto-cycle
		pieSlices.forEach(slice => {
			slice.addEventListener('mouseenter', () => {
				isUserInteracting = true;
				if (autoCycleTimeout) clearTimeout(autoCycleTimeout);
			});
			slice.addEventListener('mouseleave', () => {
				setTimeout(() => {
					isUserInteracting = false;
				}, 500);
			});
		});
		
		expLabels.forEach(label => {
			label.addEventListener('mouseenter', () => {
				isUserInteracting = true;
				if (autoCycleTimeout) clearTimeout(autoCycleTimeout);
			});
			label.addEventListener('mouseleave', () => {
				setTimeout(() => {
					isUserInteracting = false;
				}, 500);
			});
		});
	}

	// ============================================
	// INTRO ANIMATION SEQUENCE (card-toolbox)
	// ============================================
	const introBars = document.getElementById('intro-bars');
	const introRect = document.getElementById('intro-rect');
	const introText = document.getElementById('intro-text');
	const introOverlay = document.getElementById('intro-overlay');

	if (introBars && introRect && introText && introOverlay) {
		const INTRO_TEXT = "Hey, My name is David. I am a Fullstack Web Developer with experience in Game Development and Graphics Design.";

		// Expose function globally so it can be called after card entrance
		window.startIntroAnimation = function() {
			// Stage 1: Start wave animation
			const bars = introBars.querySelectorAll('.intro-bar');
			bars.forEach(bar => bar.classList.add('waving'));

			// Stage 2: At 5.5s (after all bars finish waving), combine bars into tall rect
			// Last bar finishes at 0.45s delay + 5s animation = 5.45s
			setTimeout(() => {
				introBars.classList.add('combining');
			}, 5500);

			// Stage 3: At 6.1s (after combine completes), make bars invisible and show expanding rect
			setTimeout(() => {
				introBars.style.opacity = '0';
				introRect.classList.add('expanding');
			}, 6100);

			// Stage 4: At 6.9s (after expand completes), pause briefly, then split rect and reveal text
			setTimeout(() => {
				// Brief pause
				setTimeout(() => {
					introRect.classList.add('splitting');
					revealTextWordByWord();
				}, 200);
			}, 6900);

			// Text and overlay stay visible until user hovers over pie chart
			// (will be controlled by future hover interaction)
		};

		function revealTextWordByWord() {
			introText.classList.add('revealing');
			const words = INTRO_TEXT.split(' ');
			
			// Words to highlight in white
			const highlightWords = ['David.', 'Fullstack', 'Web', 'Developer', 'Game', 'Development', 'Graphics', 'Design.'];
			
			introText.innerHTML = words.map(w => {
				const isHighlight = highlightWords.includes(w);
				return `<span class="word${isHighlight ? ' highlight' : ''}">${w}</span>`;
			}).join(' ');

			const wordElements = introText.querySelectorAll('.word');
			wordElements.forEach((word, i) => {
				setTimeout(() => {
					word.style.animationDelay = '0s';
					word.style.opacity = '1';
				}, i * 150); // 150ms between each word
			});
			
			// Start cascading glow wave animation every 60 seconds
			function startGlowWave() {
				introText.classList.add('glow-active');
				
				// Find index of "Design." to know when to stop
				const designIndex = words.indexOf('Design.');
				const endIndex = designIndex >= 0 ? designIndex : words.length - 1;
				
				// Glow each word in sequence with increasing brightness
				for (let i = 0; i <= endIndex; i++) {
					setTimeout(() => {
						wordElements[i].classList.add('glowing');
						// Increase overall brightness as we progress
						const progress = (i + 1) / (endIndex + 1);
						introText.style.filter = `brightness(${1.1 + progress * 0.3}) drop-shadow(0 0 ${10 + progress * 20}px rgba(255, 215, 0, ${0.3 + progress * 0.4}))`;
						
						// Remove glowing class after animation
						setTimeout(() => {
							wordElements[i].classList.remove('glowing');
						}, 800);
					}, i * 120); // 120ms between each word glow
				}
				
				// Reset after animation completes
				setTimeout(() => {
					introText.classList.remove('glow-active');
					introText.style.filter = '';
				}, (endIndex + 1) * 120 + 1000);
			}
			
			// Start first glow wave after text is revealed, then repeat every 60 seconds
			setTimeout(() => {
				startGlowWave();
				setInterval(startGlowWave, 60000);
			}, (words.length * 150) + 1000); // Wait for all words to appear + 1s
		}
	}

	// ============================================
	// WORKS ANIMATION SEQUENCE (card-works)
	// ============================================
	const worksBars = document.getElementById('works-bars');
	const worksRect = document.getElementById('works-rect');
	const worksText = document.getElementById('works-text');
	const worksOverlay = document.getElementById('works-overlay');

	if (worksBars && worksRect && worksText && worksOverlay) {
		const WORKS_TEXT = "Portfolio Showcase Coming Soon";

		// Expose function globally so it can be called after card entrance
		window.startWorksAnimation = function() {
			// Stage 1: Start wave animation
			const bars = worksBars.querySelectorAll('.works-bar');
			bars.forEach(bar => bar.classList.add('waving'));

			// Stage 2: At 5.5s (after all bars finish waving), combine bars into tall rect
			setTimeout(() => {
				worksBars.classList.add('combining');
			}, 5500);

			// Stage 3: At 6.1s (after combine completes), make bars invisible and show expanding rect
			setTimeout(() => {
				worksBars.style.opacity = '0';
				worksRect.classList.add('expanding');
			}, 6100);

			// Stage 4: At 6.9s (after expand completes), pause briefly, then split rect and reveal text
			setTimeout(() => {
				// Brief pause
				setTimeout(() => {
					worksRect.classList.add('splitting');
					revealWorksText();
				}, 200);
			}, 6900);
		};

		function revealWorksText() {
			worksText.classList.add('revealing');
			const words = WORKS_TEXT.split(' ');
			
			worksText.innerHTML = words.map(w => {
				return `<span class="word">${w}</span>`;
			}).join(' ');

			const wordElements = worksText.querySelectorAll('.word');
			wordElements.forEach((word, i) => {
				setTimeout(() => {
					word.style.animationDelay = '0s';
					word.style.opacity = '1';
				}, i * 150);
			});
		}
	}

	// ============================================
	// EXPERIENCE ANIMATION SEQUENCE (card-experience)
	// ============================================
	const experienceBars = document.getElementById('experience-bars');
	const experienceRect = document.getElementById('experience-rect');
	const experienceOverlay = document.getElementById('experience-overlay');

	if (experienceBars && experienceRect && experienceOverlay) {
		const experienceContainer = document.querySelector('.card-experience .experience-container');
		
		// Expose function globally so it can be called after card entrance
		window.startExperienceAnimation = function() {
			// Stage 1: Start wave animation
			const bars = experienceBars.querySelectorAll('.experience-bar');
			bars.forEach(bar => bar.classList.add('waving'));

			// Stage 2: At 5.5s (after all bars finish waving), combine bars into tall rect
			setTimeout(() => {
				experienceBars.classList.add('combining');
			}, 5500);

			// Stage 3: At 6.1s (after combine completes), make bars invisible and show expanding rect
			setTimeout(() => {
				experienceBars.style.opacity = '0';
				experienceRect.classList.add('expanding');
			}, 6100);

			// Stage 4: At 6.9s (after expand completes), pause briefly, then split rect and fade
			setTimeout(() => {
				setTimeout(() => {
					experienceRect.classList.add('splitting');
					
					// Reveal pie chart content after animation completes
					setTimeout(() => {
						if (experienceContainer) {
							experienceContainer.classList.add('visible');
						}
					}, 900); // Wait for split animation to complete
				}, 200);
			}, 6900);
		};
	}
});
