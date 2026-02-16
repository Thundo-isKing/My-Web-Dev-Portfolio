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
	if (!glitterContainer) return;

	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;

	document.addEventListener('mousemove', (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;
	});

	function updateGlitterPositions() {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;
		
		// Calculate offset from center (inverse of mouse position)
		const offsetX = (centerX - mouseX) / 50; // Divided by 50 to make movement subtle
		const offsetY = (centerY - mouseY) / 50;
		
		// Apply transform to container
		glitterContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
		
		// Special glitters - soft mystical repulsion from mouse
		if (specialGlitterContainer) {
			const specialOffsetX = (centerX - mouseX) * 0.15; // Gentle push away
			const specialOffsetY = (centerY - mouseY) * 0.15;
			specialGlitterContainer.style.transform = `translate(${specialOffsetX}px, ${specialOffsetY}px)`;
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
	
	if (heroCard && contentSection && siteShell) {
		heroCard.style.cursor = 'pointer';
		
		// Sheen follows mouse
		heroCard.addEventListener('mousemove', (e) => {
			const rect = heroCard.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			
			heroCard.style.setProperty('--mouse-x', `${x}px`);
			heroCard.style.setProperty('--mouse-y', `${y}px`);
		});
		
		heroCard.addEventListener('mouseleave', () => {
			heroCard.style.setProperty('--mouse-x', '-100%');
			heroCard.style.setProperty('--mouse-y', '-100%');
		});
		
		// Click to animate
		let isAnimating = false;
		let isContentActive = false;
		
		heroCard.addEventListener('click', () => {
			if (isAnimating) return;
			isAnimating = true;
			isContentActive = true;
			
			// Trigger hero exit animation
			siteShell.classList.add('animating');
			
			// Show content section after animation starts
			setTimeout(() => {
				contentSection.classList.add('active');
			}, 1000);
			
			// Hide hero container after animation completes
			setTimeout(() => {
				siteShell.style.display = 'none';
				isAnimating = false;
			}, 1800);
		});
		
		// Better scroll detection - use wheel event for immediate response
		window.addEventListener('wheel', (e) => {
			const scrollingUp = e.deltaY < 0;
			
			if (scrollingUp && isContentActive && !isAnimating) {
				isAnimating = true;
				isContentActive = false;
				
				// Hide content section
				contentSection.classList.remove('active');
				
				// Show and reset hero
				setTimeout(() => {
					siteShell.style.display = '';
					siteShell.classList.remove('animating');
					siteShell.classList.add('fading-in');
					
					setTimeout(() => {
						siteShell.classList.remove('fading-in');
						isAnimating = false;
					}, 600);
				}, 300);
			}
		}, { passive: true });
	}
});
