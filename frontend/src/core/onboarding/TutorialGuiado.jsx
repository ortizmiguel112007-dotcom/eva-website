import { useEffect, useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";

import { tutoriales } from "./tutoriales";
import "./TutorialGuiado.css";

export default function TutorialGuiado({ user }) {
  const introRef = useRef(null);
  const iniciadoRef = useRef(false);

  const rol = user?.rol;
  const userId = user?.id;

  const clave = `eva_tutorial_${rol}_${userId}`;

  const iniciarTutorial = (automatico = false) => {
    if (!rol || !userId || !tutoriales[rol]) return;

    // Evita iniciar dos recorridos simultáneamente.
    if (introRef.current) {
      introRef.current.exit();
      introRef.current = null;
    }

    const pasosDisponibles = tutoriales[rol].filter((paso) =>
      document.querySelector(paso.element),
    );

    if (pasosDisponibles.length === 0) return;

    const marcarComoVisto = () => {
      localStorage.setItem(clave, "completado");
      introRef.current = null;
    };

    const instancia = introJs();

    instancia.setOptions({
      steps: pasosDisponibles,
      showProgress: true,
      showBullets: true,
      showStepNumbers: true,
      nextLabel: "Siguiente",
      prevLabel: "Anterior",
      doneLabel: "Finalizar",
      skipLabel: "Saltar",
      exitOnOverlayClick: false,
      exitOnEsc: true,
      scrollToElement: true,
      disableInteraction: false,
      overlayOpacity: 0.65,
    });

    instancia.oncomplete(marcarComoVisto);
    instancia.onexit(marcarComoVisto);

    introRef.current = instancia;
    iniciadoRef.current = true;

    instancia.start();
  };

  useEffect(() => {
    if (!rol || !userId || !tutoriales[rol]) return;

    const yaVisto = localStorage.getItem(clave);

    if (yaVisto) return;

    // Espera a que el layout y los elementos estén renderizados.
    const temporizador = setTimeout(() => {
      if (!iniciadoRef.current) {
        iniciarTutorial(true);
      }
    }, 800);

    return () => clearTimeout(temporizador);
  }, [rol, userId]);

  useEffect(() => {
    return () => {
      if (introRef.current) {
        introRef.current.exit();
        introRef.current = null;
      }
    };
  }, []);

  if (!rol || !userId || !tutoriales[rol]) return null;

  return (
    <button
      type="button"
      className="tutorial-button"
      onClick={() => iniciarTutorial(false)}
      title="Ver tutorial de EVA"
    >
      <span aria-hidden="true">ⓘ</span>
      Ver tutorial
    </button>
  );
}