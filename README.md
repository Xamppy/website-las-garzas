# Sitio en mantención — Grupo Empresas Las Garzas

Landing "portal en renovación" construida en **Astro**, pensada para servirse
en varios dominios del grupo desde un mismo VPS mientras se reestructura cada
sitio real.

Sigue la estructura del diseño entregado: **una sola pantalla**, sin scroll en
escritorio.

- **Columna izquierda** sobre fondo claro: logo, "En renovación", barra
  tricolor, párrafo, los cinco distintivos en fila, botón y cierre.
- **Video de fondo** que arranca difuminado bajo el texto y gana presencia
  hacia la derecha. En loop, sin audio.
- **Tres franjas diagonales** a la derecha (Rental Mining · Logística ·
  Servicios) separadas por filos verde, blanco y rojo. Al pasar el cursor la
  franja se ensancha y sube un panel con el icono y la descripción.
- Iconos y logo vectorizados a SVG; fotos en WebP.
- Sin dependencias de CDN externo: la red corporativa los bloquea.

## Comandos

```bash
npm install
npm run dev       # servidor local en http://localhost:4321
npm run build     # genera dist/
npm run preview   # sirve dist/ para revisar antes de subir
```

## Estructura

```
sitio-mantenimiento/
├── images/                     # ORIGINALES sin tocar (no se despliegan)
│   ├── banner pagina web 2HD.mp4.mp4
│   ├── GLG_web_Video.mp4       # version 4K del mismo video
│   ├── GLG.png                 # isotipo 1920x1920
│   ├── Iconos1.png             # tira de 5 iconos de servicio
│   ├── Iconos2.png             # tira de 4 iconos de footer
│   ├── logistica.jpg · servicios.jpg · rental_mining.png
│   └── ...
├── public/                     # assets ya procesados que Astro copia a dist/
│   ├── video/GLG_web_Video.mp4 # 7,0 MB — 720p, 25 fps, sin audio
│   ├── img/*-slat.webp         # fotos de las franjas (1:2) en dos tamaños
│   ├── img/video-poster.webp   # primer cuadro del video
│   ├── img/glg-logo.svg        # isotipo vectorizado (5,4 KB)
│   ├── icons/*.svg             # 9 iconos vectorizados (26 KB en total)
│   └── favicon.ico
├── src/
│   ├── layouts/Base.astro      # head, SEO, canonical, noindex
│   ├── components/Slat.astro   # franja diagonal con panel en hover
│   ├── pages/index.astro       # la página (layout, video, columna de texto)
│   └── styles/global.css       # tokens de marca y base
├── deploy/coming-soon.conf     # vhost Nginx multi-dominio
└── dist/                       # salida del build (esto es lo que se sube)
```

De los 9 iconos, **5 se usan** en la fila de distintivos (Logística, Servicios,
Rental Mining, Maquinaria, Compromiso Sostenible). Los otros 4 —los de la tira
`Iconos2.png`: nuevas áreas, conectividad, seguridad, entorno— quedan
vectorizados y disponibles por si más adelante se agrega el pie de página del
diseño original. Usan `fill="currentColor"`, así que su color se define por CSS.

## Cómo se generaron los assets

Los originales de `images/` **no se tocan**. Todo lo servido vive en `public/`.

### Video — de 85 MB a 7,0 MB

El fuente `banner pagina web 2HD.mp4.mp4` son 2560×1440, 50,3 s, 85 MB. Como
fondo web eso es inviable, así que se recodificó:

```bash
ffmpeg -i "images/banner pagina web 2HD.mp4.mp4" \
  -an -vf "scale=1280:720:flags=lanczos,fps=25" \
  -c:v libx264 -profile:v main -crf 32 -preset slow \
  -pix_fmt yuv420p -g 50 -movflags +faststart \
  public/video/GLG_web_Video.mp4
```

Decisiones y por qué:

| Ajuste | Motivo |
|---|---|
| `-an` (sin audio) | Los navegadores bloquean el autoplay con sonido. Sin la pista, además, se ahorra ~800 KB. |
| 720p | Es un fondo detrás de un degradado oscuro; a 1080p pesaba 19 MB sin diferencia perceptible. |
| 25 fps | El original va a 29,97. Bajar a 25 quita un 16 % de cuadros sin que se note en footage de dron. |
| `-crf 32` | Punto de equilibrio. A 30 pesaba 12 MB; a 34 aparecían bloques en el cielo. |
| `+faststart` | Mueve el índice al principio del archivo para que empiece a reproducir sin descargarlo entero. |

También se probó **VP9/WebM**, que en teoría comprime mejor: dio **20,7 MB**,
peor que h264 por el mucho movimiento del material. Se descartó. h264 además
funciona en todos los navegadores sin fallback.

> **Pendiente de decisión:** 7,0 MB sigue siendo pesado para un placeholder.
> El peso viene de la duración, no de la calidad. Recortar el video a un
> tramo de 15–20 s en loop lo dejaría en 2–3 MB sin perder nada visual,
> porque nadie mira 50 s de un fondo. Ver "Recortar el video" más abajo.

### Iconos — PNG a SVG

`Iconos1.png` y `Iconos2.png` venían como tiras horizontales. Se detectaron los
límites de cada icono por columnas de alfa, se recortaron, se posterizaron a
colores planos (el antialiasing genera miles de nodos al vectorizar) y se
trazaron con `vtracer`, luego optimizados con SVGO.

Resultado: **9 SVG, 26 KB en total**, escalables y nítidos a cualquier tamaño.

El parámetro que importa es `filter_speckle`: con 60 los iconos se destruían
(el camión quedaba en un círculo vacío) y con 4 pesaban 25 KB cada uno. **6 es
el punto correcto.** Si hay que regenerarlos, ese es el valor a respetar.

Los 4 iconos del footer usan `fill="currentColor"`, así que su color se
controla desde CSS y no hay que reeditar el SVG para cambiarlo.

### Imágenes — WebP

Las tres fotos se recortaron a **1:2** (760×1520), la proporción que piden las
franjas diagonales: altas y angostas. `rental_mining.png` venía en 16:9 y se
recortó desplazando el encuadre hacia los camiones. Se exportaron en dos
tamaños, servidos con `srcset` para que un teléfono no baje la versión grande.

### Logo

`GLG.png` (1920×1920) se vectorizó igual que los iconos: **5,4 KB de SVG**
en vez de 213 KB de PNG, y nítido en cualquier tamaño.

## Comportamiento de las franjas

En reposo cada franja muestra la foto con su rótulo. Al pasar el cursor la
franja se ensancha, el rótulo se retira y sube un panel con el icono y la
descripción entrando escalonados.

Detalles que no son accidentales:

- **En táctil el panel va siempre visible.** En un teléfono nadie puede "pasar
  por encima": ocultar el texto ahí sería esconder información sin forma de
  recuperarla. Lo resuelve `@media (hover: none)`.
- **Funciona con teclado.** La franja es focusable y `:focus-visible` dispara
  la misma animación que el hover.
- **Respeta `prefers-reduced-motion`**: sin animaciones y con el video
  reemplazado por su poster estático.
- **En móvil se apilan sin diagonal.** Inclinadas y angostas se leen mal y
  recortan demasiado la foto, así que bajo 860 px `--slant` pasa a `0deg` y
  las tres van una debajo de la otra con su filo de color abajo.

### Tres trampas del CSS que ya están resueltas

Si hay que retocar el layout, conviene conocerlas porque los síntomas no
apuntan a la causa:

1. **`.board > *` no sirve para apilar las capas.** Astro añade su atributo de
   scope también al `*`, lo que sube la especificidad por encima de los
   overrides del media query móvil: las tres capas se quedaban en `grid-area:
   stack` y el texto se superponía a las franjas. Por eso las clases se listan
   una a una.
2. **`flex: 1 1 0` colapsa las franjas en móvil.** Es correcto en fila, pero al
   pasar a `column` fija la base en 0 y cada franja queda de la altura de su
   borde. En el bloque móvil se anula con `flex: 0 0 auto`.
3. **El rótulo necesita corrección geométrica.** Con la franja inclinada, su
   zona visible arriba se corre a la derecha y un texto centrado se sale por la
   izquierda. Lo compensa `--label-shift`, en `vh` para que escale con la
   altura; la última franja lleva un valor distinto porque se extiende más allá
   del borde del tablero.

## Notas de SEO — importante con múltiples dominios

Todos los dominios sirven **el mismo HTML**, y los buscadores lo leen como
contenido duplicado. Dos líneas en `src/layouts/Base.astro` lo cubren:

- `canonical` apunta al dominio principal. **Cambiar el valor si el dominio
  principal no es `grupolasgarzas.cl`** (está en las props por defecto del
  layout y en `astro.config.mjs`).
- `noindex, follow` evita que el placeholder quede indexado compitiendo con el
  sitio definitivo. **Quitar esa línea el día que este contenido sea el real.**

## Despliegue en el VPS

```bash
npm run build

rsync -avz --delete dist/ usuario@vps:/var/www/coming-soon/dist/

scp deploy/coming-soon.conf usuario@vps:/etc/nginx/sites-available/coming-soon.conf
ssh usuario@vps '
  ln -sf /etc/nginx/sites-available/coming-soon.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
'
```

Editar `server_name` en `coming-soon.conf` con los dominios reales antes de
subirlo. No hay wildcard a propósito: conviene que quede explícito qué dominios
están mostrando el placeholder en un momento dado.

## Cloudflare — por cada dominio

1. **DNS → Records**: registro `A` a la IP del VPS con la nube **naranja**
   (proxied). Igual para `www`, o un `CNAME` de `www` al apex.
2. **SSL/TLS → Overview**: modo **Flexible** para partir (el VPS solo escucha
   HTTP en :80). Subir a **Full (strict)** más adelante generando un
   certificado de origen en *SSL/TLS → Origin Server*.
3. **SSL/TLS → Edge Certificates**: activar **Always Use HTTPS**.
4. **Caching**: con el placeholder estático conviene un Edge Cache TTL alto.
   **Purgar el caché** (*Caching → Configuration → Purge Everything*) cada vez
   que se actualice el HTML, la imagen o el video: con cache agresivo el cambio
   no se refleja solo.

## Tareas pendientes

### Recortar el video (recomendado)

Bajaría de 7,0 MB a ~2–3 MB. Elegir un tramo y recodificar:

```bash
# ejemplo: 18 segundos desde el segundo 6
ffmpeg -ss 6 -t 18 -i "images/banner pagina web 2HD.mp4.mp4" \
  -an -vf "scale=1280:720:flags=lanczos,fps=25" \
  -c:v libx264 -profile:v main -crf 32 -preset slow \
  -pix_fmt yuv420p -g 50 -movflags +faststart \
  public/video/GLG_web_Video.mp4
```

Conviene elegir un tramo cuyo primer y último cuadro se parezcan, para que el
loop no dé un salto visible.

### Textos de las franjas

Las descripciones actuales son de relleno, escritas a partir de los nombres de
área. Están en `src/pages/index.astro`, en el arreglo `areas`. Reemplazarlas
por el texto real del negocio.

### Nombres de área

El diseño de referencia decía "Transporte Minero" y "Áridos"; aquí figuran como
**Logística** y **Servicios** según la indicación posterior. "Rental Mining" se
mantiene. Están en los arreglos `areas` y `distintivos` de
`src/pages/index.astro`.

### Imagen sin usar

`images/IMG-20251016-WA0048.jpg` (camión y excavadora cargando) quedó
disponible por si alguna tarjeta debe cambiar de foto.
# website-las-garzas
