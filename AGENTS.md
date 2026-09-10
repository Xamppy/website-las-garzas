# Contexto y Memoria Técnica del Proyecto — Sitio Mantenimiento GLG

> **Instrucciones para Agentes:** Lee este archivo primero antes de realizar búsquedas o análisis extensos. Contiene las decisiones arquitectónicas, lecciones aprendidas, trampas resueltas y el diseño visual exacto del proyecto.

---

## 1. Resumen del Proyecto

- **Empresa:** Grupo Empresas Las Garzas (Chile).
- **Propósito:** Landing page de mantención / *en renovación* ("Portal empresarial — En renovación").
- **Stack:** Astro 5.14.1 (Static Build, autocontenido, sin librerías externas ni dependencias de CDN porque redes corporativas las bloquean).
- **Repositorio:** `https://github.com/Xamppy/website-las-garzas.git` (rama `main`).
- **Servidor Local:** `npm run dev` corre en `http://localhost:4321`.

---

## 2. Arquitectura de Archivos Clave

```text
sitio-mantenimiento/
├── src/
│   ├── layouts/
│   │   └── Base.astro         # Plantilla HTML base, metadatos, favicon, preload de poster
│   ├── pages/
│   │   └── index.astro        # Página principal (tablero, navbar, video hero, textos, footer)
│   ├── components/
│   │   └── Slat.astro         # Cada una de las 3 franjas diagonales interactivas
│   └── styles/
│       └── global.css         # Reset global, variables CSS de marca, utilidades (.tricolor)
├── public/
│   ├── img/                   # Imágenes WebP optimizadas (slats, logos, poster)
│   ├── icons/                 # Íconos SVG vectoriales monocromáticos
│   └── video/                 # GLG_web_Video.mp4 (video panorámico de fondo)
└── dist/                      # Salida compilada (solo si se ejecuta astro build)
```

---

## 3. Decisiones de Diseño y Reglas Críticas (NO ROMPER)

### A. Franjas Diagonales (`Slat.astro` y `.board__slats`)
1. **Inclinación:** `--slant: -11deg` en desktop.
2. **Ancho total en desktop:** `width: 44%` (alineadas a la derecha). Esto deja libre el 56% izquierdo y central para que el video panorámico de fondo sea plenamente visible.
3. **Desvanecido vertical (Mask Gradient):**
   - Las imágenes **deben ser 100% sólidas desde abajo hasta el 70%** (los 3/4 inferiores de la imagen).
   - A partir del 70% superior se desvanecen gradualmente hacia el 0% (`rgba(0, 0, 0, 0) 98%`), dejando ver el cielo y montañas del video panorámico.
   - **Propiedades usadas:** `mask-image` y `-webkit-mask-image` aplicadas en `.slat__inner`.
4. **Proporción de imágenes (Anti-alargamiento):**
   - El contra-sesgo (`skewX`) comprime el ancho percibido de la imagen.
   - En `.slat__img` se aplica `transform: scaleX(1.08)` (y `scale(1.06) scaleX(1.08)` en hover) para que las 3 personas y camiones mantengan su escala natural sin verse estirados.
   - En móvil se resetea a `transform: none !important`.
5. **Líneas divisorias ahusadas (`.slat::before`):**
   - No son bordes planos; son líneas que van delgadas en extremos (~2px) y más gruesas al centro (~7px).
   - Creadas con `clip-path: polygon(0 0, 2px 0, 7px 50%, 2px 100%, 0 100%)`.
   - Colores corporativos de marca: Verde (`#2d8a48`), Blanco (`#ffffff`), Rojo (`#c8202e`).
6. **Alineación del título vertical en hover (`.slat__hover-title`):**
   - Debe correr pegado al borde diagonal izquierdo (`left: clamp(16px, 1.2vw, 24px)`) para dejar completamente despejadas a las personas y camiones de la fotografía (evita tapar a los dueños en Rental Mining a escala 100%).

### B. Navbar Superior (`.navbar`)
- **Desktop:** Barra flotante translúcida ubicada más abajo del borde superior:
  - `top: clamp(14px, 2.2vh, 26px)`.
  - Fondo: degradado blanco con `backdrop-filter: blur(10px)`.
  - Permite ver el cielo del video pasando por encima y detrás.
- **Móvil:** Bloque superior limpio (`position: relative`), blanco sólido.

### C. Responsividad Móvil (`@media (max-width: 860px)`)
- En móvil, el flujo vertical es:
  1. Navbar blanco.
  2. Hero con texto "Portal empresarial", "En renovación", lema y distintivos (con video difuminado detrás).
  3. Franjas fotográficas apiladas verticalmente con etiquetas de sección visibles en pastillas de vidrio (`.slat__label`).
  4. Footer negro con íconos blancos y marca.
- **¡ALERTA CRÍTICA!:** NUNCA usar `(hover: none)` en la misma media query que `@media (max-width: 860px)` para anular máscaras o estilos de escritorio. En Windows, muchas laptops tienen pantallas táctiles que activan `hover: none` y destruían de inmediato el degradado y las franjas de escritorio.

### D. Footer (`.footer`)
- Fondo negro sólido `#000000` con íconos SVG blancos (`public/icons/`).
- Distintivos alineados a la izquierda y bloque de marca/tricolor a la derecha.

---

## 4. Flujo de Trabajo Rápido

- Para probar estilos: editar directamente en `src/components/Slat.astro` o `src/pages/index.astro`. Astro HMR actualiza instantáneamente en `http://localhost:4321`.
- Antes de proponer comandos de consola pesados o lecturas recursivas innecesarias, consultar las líneas exactas indicadas en este documento.
- Commits se realizan a `main` y push a `origin/main`.
