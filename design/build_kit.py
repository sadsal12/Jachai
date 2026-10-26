# Generates the Jachai app UI asset kit SVGs into design/app-kit. Run: python design/build_kit.py
import os

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "app-kit"))

LIGHT = "--primary:#111111;--secondary:#F2F2F0;--bg:#FFFFFF;--accent:#8CA8F9"
DARK = "--primary:#F5F5F4;--secondary:#1C1C1E;--bg:#0E0E0F;--accent:#8CA8F9"


def style(responsive, tokens=LIGHT):
    s = "svg{%s}" % tokens
    if responsive:  # in-app art follows the system theme; icons stay fixed (launchers don't theme them)
        s += "@media (prefers-color-scheme:dark){svg{%s}}svg.dark{%s}" % (DARK, DARK)
    return "<style>%s</style>" % s


def write(name, body):
    with open(name, "w", encoding="utf-8") as f:
        f.write(body.strip() + "\n")


# B3 tile drawn on its own 256 grid: tile 16..240 (rx 60), bite r50 + dot r30 at (186,62), j stroke 36.
def b3_tile(tile, dot, mark, uid):
    return f"""<defs><mask id="{uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
        <rect width="256" height="256" fill="#fff"/><circle cx="186" cy="62" r="50" fill="#000"/></mask></defs>
      <rect x="16" y="16" width="224" height="224" rx="60" mask="url(#{uid})" style="fill:var({tile})"/>
      <!-- The floating dot: sits in a bite outside the tile, like Jachai's bubble over other apps -->
      <circle cx="186" cy="62" r="30" style="fill:var({dot})"/>
      <path d="M140 128V164A42 42 0 0 1 98 206H92" fill="none" stroke-width="36" stroke-linecap="round" style="stroke:var({mark})"/>"""


# ---------------------------------------------------------------- store icon (512, full bleed)
# Grid: 512 canvas = the B3 tile scaled x2.2857 to full bleed. Dot (389,105) r69, bite r114, j stroke 82.
def store_icon(tile, mark, bite, dot, tokens):
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  {style(False, tokens)}
  <defs>
    <!-- Icon shape check: rounded rect, rx 115 = 22.5 % of 512 (close to the iOS / Play squircle).
         Stores and launchers apply their own mask; this one is for previews and border-radius checks. -->
    <mask id="app-icon-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
      <rect width="512" height="512" rx="115" fill="#fff"/>
    </mask>
  </defs>
  <g mask="url(#app-icon-mask)">
    <rect width="512" height="512" style="fill:var({tile})"/>
    <!-- The bite + floating dot -->
    <circle cx="389" cy="105" r="114" style="fill:var({bite})"/>
    <circle cx="389" cy="105" r="69" style="fill:var({dot})"/>
    <!-- j: stem + hook, round ends -->
    <path d="M283 256V338A96 96 0 0 1 187 434H174" fill="none" stroke-width="82" stroke-linecap="round" style="stroke:var({mark})"/>
  </g>
</svg>"""


write("app-icon.svg", store_icon("--primary", "--bg", "--bg", "--primary", LIGHT))
write("app-icon-dark.svg", store_icon("--primary", "--bg", "--bg", "--primary", DARK))

# ---------------------------------------------------------------- Android adaptive icon (108 dp)
# The whole tile and dot fit inside the 66 dp safe circle, so a round launcher mask never cuts the dot.
write("app-icon-adaptive-foreground.svg", f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">
  {style(False)}
  <!-- Android adaptive icon foreground, 108 x 108 dp. Safe zone = 66 dp circle; the mark fits inside it. -->
  <!-- <circle cx="54" cy="54" r="33" fill="none" stroke="red" stroke-width="0.5"/>  Safe zone guide -->
  <g transform="translate(54 54) scale(0.247) translate(-128 -128)">
      {b3_tile("--primary", "--primary", "--bg", "bite")}
  </g>
</svg>""")
write("app-icon-adaptive-background.svg", f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">
  {style(False)}
  <rect width="108" height="108" style="fill:var(--bg)"/>
</svg>""")

# ---------------------------------------------------------------- favicon (16 px grid cut)
# Redrawn on the 16 px grid: thicker j, bigger bite, so it survives 1:1 pixels.
write("favicon-16.svg", f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  {style(False)}
  <defs><mask id="app-icon-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
    <rect width="16" height="16" rx="3.6" fill="#fff"/></mask></defs>
  <g mask="url(#app-icon-mask)">
    <rect width="16" height="16" style="fill:var(--primary)"/>
    <circle cx="12" cy="4" r="4" style="fill:var(--bg)"/>
    <circle cx="12" cy="4" r="2.2" style="fill:var(--primary)"/>
    <path d="M8.4 8V10.2A2.6 2.6 0 0 1 5.8 12.8H5.4" fill="none" stroke-width="2.6" stroke-linecap="round" style="stroke:var(--bg)"/>
  </g>
</svg>""")

# ---------------------------------------------------------------- B2 in-app mark
write("mark-j.svg", f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  {style(True)}
  <!-- B2: the j whose dot is a speech bubble. In-app mark: headers, empty states, loading. -->
  <path d="M150 18A32 32 0 1 1 132 76.5L112 86L119 66A32 32 0 0 1 150 18Z" style="fill:var(--accent)"/>
  <path d="M150 120V170A52 52 0 0 1 98 222H94" fill="none" stroke-width="40" stroke-linecap="round" style="stroke:var(--primary)"/>
</svg>""")


# ---------------------------------------------------------------- promo banners
def banner(w, h, tile, safe, title):
    tx, ty, ts = tile  # tile centre + size on screen
    sx, sy, sw, sh = safe
    k = ts / 224
    # where the floating dot lands on the banner, for the ripple rings
    dx, dy = tx + (186 - 128) * k, ty + (62 - 128) * k
    return f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" preserveAspectRatio="xMinYMid slice">
  {style(False)}
  <!-- {title}. Fixed ink palette in both themes: a promo card stays dark on a light page and on a dark one. Responsive: 'xMinYMid slice' crops from the right, so the text zone on the left always survives. -->
  <defs>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2.5" style="fill:var(--bg)"/></pattern>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
    <mask id="fadeMask" maskUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}">
      <rect width="{w}" height="{h}" fill="url(#fade)"/></mask>
  </defs>

  <!-- Layer 1: canvas -->
  <rect width="{w}" height="{h}" style="fill:var(--primary)"/>

  <!-- Layer 2: quiet dot grid, right side only, fading out towards the text -->
  <rect width="{w}" height="{h}" fill="url(#dots)" mask="url(#fadeMask)" opacity="0.12"/>

  <!-- Layer 3: ripple rings around the floating dot -->
  <g fill="none" stroke-width="2" opacity="0.16" style="stroke:var(--bg)">
    <circle cx="{dx:.0f}" cy="{dy:.0f}" r="{ts * 0.30:.0f}"/>
    <circle cx="{dx:.0f}" cy="{dy:.0f}" r="{ts * 0.50:.0f}"/>
    <circle cx="{dx:.0f}" cy="{dy:.0f}" r="{ts * 0.72:.0f}"/>
  </g>

  <!-- Layer 4: the B3 tile, reversed (light tile on the dark canvas); the dot carries the accent -->
  <g transform="translate({tx} {ty}) scale({k:.4f}) translate(-128 -128)">
      {b3_tile("--bg", "--accent", "--primary", "bite")}
  </g>

  <!-- Text Safe Zone: x {sx}-{sx + sw}, y {sy}-{sy + sh}. Headline, body and CTA go here; no decoration overlaps it. -->
  <!-- <rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="none" stroke="#f0f" stroke-dasharray="12 8"/> -->
  <!-- Sample placement (uncomment to preview; ship real text from the app, not baked into the SVG):
  <text x="{sx}" y="{sy + sh * 0.30:.0f}" font-family="Roboto, sans-serif" font-size="{min(h * 0.085, sw / 17):.0f}" font-weight="700" fill="#FFFFFF">Check it before you forward it.</text>
  <text x="{sx}" y="{sy + sh * 0.52:.0f}" font-family="Roboto, sans-serif" font-size="{min(h * 0.042, sw / 24):.0f}" opacity="0.75" fill="#FFFFFF">Jachai spots fake news, AI photos and hoaxes.</text>
  <rect x="{sx}" y="{sy + sh * 0.68:.0f}" width="{h * 0.36:.0f}" height="{h * 0.1:.0f}" rx="{h * 0.05:.0f}" fill="#FFFFFF"/>  CTA button (the sample uses hex: XML comments can't contain a double hyphen)
  -->
</svg>"""


write("banner-16x9.svg", banner(1600, 900, (1170, 480, 420), (112, 200, 760, 520), "In-app promo banner, 16:9 (1600 x 900)"))
write("banner-8x3.svg", banner(1600, 600, (1300, 320, 330), (96, 110, 900, 400), "In-app promo card, 8:3 (1600 x 600)"))

# ---------------------------------------------------------------- feature header background
W, H = 1440, 480
write("header-bg.svg", f"""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" preserveAspectRatio="xMidYMin slice">
  {style(True)}
  <!-- Feature header canvas for dashboards (e.g. the top of the Text tab). Subtle on purpose: content sits on top.
       'xMidYMin slice' keeps the top band on narrow phones. -->
  <defs>
    <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--secondary)"/>
      <stop offset="1" style="stop-color:var(--bg)"/>
    </linearGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="2" style="fill:var(--primary)"/></pattern>
    <linearGradient id="dotFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.8" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="dotMask" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">
      <rect width="{W}" height="{H}" fill="url(#dotFade)"/></mask>
  </defs>

  <!-- Layer 1: canvas fading into the page colour, so the header has no hard bottom edge -->
  <rect width="{W}" height="{H}" fill="url(#fadeDown)"/>

  <!-- Layer 2: dot grid, fading downwards -->
  <rect width="{W}" height="{H}" fill="url(#dots)" mask="url(#dotMask)" opacity="0.07"/>

  <!-- Layer 3: pills and bubbles from the j's vocabulary (round ends only, nothing sharp) -->
  <g opacity="0.07" style="fill:var(--primary)">
    <rect x="980" y="-40" width="80" height="300" rx="40"/>
    <circle cx="1180" cy="70" r="56"/>
    <rect x="1240" y="150" width="80" height="220" rx="40"/>
    <circle cx="1360" cy="40" r="28"/>
  </g>
  <circle cx="1180" cy="70" r="88" fill="none" stroke-width="3" opacity="0.10" style="stroke:var(--primary)"/>
  <circle cx="1180" cy="70" r="124" fill="none" stroke-width="2" opacity="0.06" style="stroke:var(--primary)"/>

  <!-- Text Safe Zone: x 48-900, y 40-300 (title, greeting, stats). The shapes stay right of x 960. -->
  <!-- <rect x="48" y="40" width="852" height="260" fill="none" stroke="#f0f" stroke-dasharray="12 8"/> -->
</svg>""")

print("wrote", sorted(f for f in os.listdir(".") if f.endswith(".svg")))
