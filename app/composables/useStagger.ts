import gsap from "gsap";

/**
 * Fades a list in from below, one item shortly after the other. Used when the
 * ticket groups render, and skipped entirely for anyone who asked their system
 * to reduce motion.
 */
export function useStagger() {
	const prefersReducedMotion = import.meta.client
		&& window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	function play(targets: string | Element | Element[], delay = 0) {
		if (prefersReducedMotion || !import.meta.client) {
			return;
		}

		gsap.from(targets, {
			opacity: 0,
			y: 16,
			duration: 0.4,
			ease: "power2.out",
			stagger: 0.05,
			delay,
			clearProps: "all",
		});
	}

	return { play, prefersReducedMotion };
}
