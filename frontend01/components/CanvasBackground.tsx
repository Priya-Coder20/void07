'use client';

import React, { useEffect, useRef } from 'react';

export default function CanvasBackground({ children }: { children?: React.ReactNode }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationFrameId: number;
		let particles: Particle[] = [];
		let mouseX = -1000;
		let mouseY = -1000;

		// Configuration
		const SPACING = 30;
		const RADIUS_INTERACTION = 300;
		// Cool color palette: Cyan, Blue, Purple, Magenta
		const COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#d946ef'];

		class Particle {
			x: number;
			y: number;
			baseSize: number;
			size: number;
			color: string;
			angle: number;
			speed: number;

			constructor(x: number, y: number) {
				this.x = x;
				this.y = y;
				this.baseSize = 1.5; // Restored to original size
				this.size = this.baseSize;
				this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
				this.angle = Math.random() * Math.PI * 2;
				this.speed = 0.02 + Math.random() * 0.03;
			}

			update() {
				this.angle += this.speed;
				const breathingOffset = Math.sin(this.angle) * 0.5; // Restored to original intensity

				const dx = this.x - mouseX;
				const dy = this.y - mouseY;
				const distance = Math.sqrt(dx * dx + dy * dy);

				let mouseScale = 0;
				if (distance < RADIUS_INTERACTION) {
					mouseScale = (1 - distance / RADIUS_INTERACTION) * 2.5;
				}

				this.size = this.baseSize + breathingOffset + mouseScale;
				if (this.size < 0.5) this.size = 0.5;
			}

			draw(context: CanvasRenderingContext2D) {
				context.beginPath();
				context.arc(this.x, this.y, this.size, 0, Math.PI * 2);

				const opacity = this.size > 2 ? 0.8 : 0.3;
				context.globalAlpha = opacity;
				context.fillStyle = this.color;
				context.fill();
				context.globalAlpha = 1.0;
			}
		}

		const init = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			particles = [];
			const cols = Math.ceil(canvas.width / SPACING);
			const rows = Math.ceil(canvas.height / SPACING);

			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					particles.push(new Particle(j * SPACING, i * SPACING));
				}
			}
		};

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			particles.forEach(particle => {
				particle.update();
				particle.draw(ctx);
			});

			animationFrameId = requestAnimationFrame(animate);
		};

		const handleMouseMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			mouseX = e.clientX - rect.left;
			mouseY = e.clientY - rect.top;
		};

		const handleResize = () => {
			init();
		};

		init();
		animate();

		window.addEventListener('resize', handleResize);
		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleMouseMove);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center text-white selection:bg-white/20"
		>
			<canvas
				ref={canvasRef}
				className="absolute inset-0 z-0"
			/>
			<div
				className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-transparent via-black/20 to-black/80"
			/>

			<div className="relative z-10 w-full h-full">
				{children}
			</div>
		</div>
	);
}
