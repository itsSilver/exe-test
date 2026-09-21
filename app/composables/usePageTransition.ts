import gsap from "gsap";

/**
 * Moving between the list and a ticket slides the incoming page in and the
 * outgoing one out, so the two screens read as one flow rather than a reload.
 * Anyone who asked their system to reduce motion gets no transition at all.
 */
export function usePageTransition() {
	const prefersReducedMotion = import.meta.client
		&& window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const pageTransition = {
		mode: "out-in" as const,
		css: false,

		onEnter(element: Element, done: () => void) {
			if (prefersReducedMotion) {
				done();
				return;
			}

			gsap.fromTo(
				element,
				{ opacity: 0, y: 12 },
				{ opacity: 1, y: 0, duration: 0.25, ease: "power2.out", onComplete: done, clearProps: "all" },
			);
		},

		onLeave(element: Element, done: () => void) {
			if (prefersReducedMotion) {
				done();
				return;
			}

			gsap.to(element, { opacity: 0, y: -8, duration: 0.15, ease: "power1.in", onComplete: done });
		},
	};

	return { pageTransition };
}
