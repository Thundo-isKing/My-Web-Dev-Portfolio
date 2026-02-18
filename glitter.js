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
				setTimeout(() => animateCardsIn(), 100);
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
});
