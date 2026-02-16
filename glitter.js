// Mouse-reactive glitter movement
document.addEventListener('DOMContentLoaded', () => {
	const glitterContainer = document.querySelector('.bg-glitter');
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
		
		requestAnimationFrame(updateGlitterPositions);
	}

	updateGlitterPositions();
});
