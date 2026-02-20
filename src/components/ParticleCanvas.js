'use client';
import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const C = canvasRef.current;
        if (!C) return;
        const cx = C.getContext('2d');
        let W, H, P = [], mouse = { x: 0, y: 0 }, animId;

        function rsz() { W = C.width = window.innerWidth; H = C.height = window.innerHeight; }
        rsz();
        window.addEventListener('resize', rsz);
        const onMouse = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
        document.addEventListener('mousemove', onMouse);

        class Pt {
            constructor() { this.r(); }
            r() {
                this.x = Math.random() * W; this.y = Math.random() * H;
                this.rs = Math.random() * 1.2 + .4; this.o = Math.random() * .25 + .04;
                this.vx = (Math.random() - .5) * .25; this.vy = (Math.random() - .5) * .25;
                this.life = 0; this.ml = Math.random() * 200 + 80;
            }
            u() {
                const dx = mouse.x - this.x, dy = mouse.y - this.y, d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) { const f = .00025 * (110 - d); this.vx -= dx * f; this.vy -= dy * f; }
                this.x += this.vx; this.y += this.vy; this.life++;
                if (this.x < 0 || this.x > W || this.y < 0 || this.y > H || this.life > this.ml) this.r();
            }
            d() { cx.beginPath(); cx.arc(this.x, this.y, this.rs, 0, Math.PI * 2); cx.fillStyle = `rgba(0,229,255,${this.o})`; cx.fill(); }
        }
        for (let i = 0; i < 70; i++) P.push(new Pt());

        function anim() {
            cx.clearRect(0, 0, W, H);
            P.forEach(p => p.u());
            for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
                const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y, d = Math.sqrt(dx * dx + dy * dy);
                if (d < 90) { cx.beginPath(); cx.moveTo(P[i].x, P[i].y); cx.lineTo(P[j].x, P[j].y); cx.strokeStyle = `rgba(0,229,255,${.05 * (1 - d / 90)})`; cx.lineWidth = .4; cx.stroke(); }
            }
            P.forEach(p => p.d());
            animId = requestAnimationFrame(anim);
        }
        anim();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', rsz);
            document.removeEventListener('mousemove', onMouse);
        };
    }, []);

    return <canvas ref={canvasRef} id="particle-canvas" />;
}
