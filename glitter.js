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
});
