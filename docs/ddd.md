# Domain-Driven Design: Eskdale Art Show Website

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| **Art Show** | The annual community exhibition event at St Bega's Primary School |
| **Gallery Item** | A single artwork entry with image, title, artist name, medium, and description |
| **Category** | A type of artwork exhibited: paintings, pottery, jewellery, woodwork, photographs, prints, scarves, bags, cards |
| **Event Details** | Core logistics: name, edition (31st), dates, times, venue, admission policy |
| **Venue** | St Bega's C of E Primary School, Eskdale Green |
| **Transport Link** | Connection to Ravenglass & Eskdale Railway (La'al Ratty) at Irton Road Station |
| **Refreshments** | Home-made food and drink served at the event |
| **Art Lead** | Community committee member responsible for content management |
| **Contributor** | Technical volunteer who can submit code changes via PR |

## Bounded Contexts

### 1. Content Context
**Responsibility**: All displayable content — event info, about text, gallery data, contact details.

**Entities**:
```
Event {
  name: string           // "The Eskdale Art Show"
  edition: string        // "31st Annual"
  dates: {
    start: date          // 2026-05-23
    end: date            // 2026-05-25
  }
  times: string          // "10:00 – 16:30 daily"
  admission: string      // "Free admission and parking"
}

Venue {
  name: string           // "St Bega's C of E Primary School"
  address: string        // "Eskdale Green, Holmrook, CA19 1TW"
  transport: string      // "Near Irton Road Station..."
  mapUrl: string         // OpenStreetMap embed URL
  coordinates: { lat, lng }
}

GalleryItem {
  id: string             // unique identifier
  image: string          // path relative to assets/images/gallery/
  title: string          // artwork title
  artist: string         // artist name
  medium: string         // e.g., "Oil on canvas"
  category: Category     // enum value
  description?: string   // optional description
}

Contact {
  phone: string
  email: string
  facebook: string
  twitter: string
}
```

**Data Files**: `src/data/event.json`, `src/data/gallery.json`

### 2. Presentation Context
**Responsibility**: Visual rendering of content — HTML structure, CSS design system, responsive layout, scroll behaviour.

**Components**:
- Hero section (event headline + countdown + WASM canvas)
- Navigation bar (sticky, smooth scroll)
- Section renderer (takes JSON data, populates DOM)
- Gallery grid (masonry layout + lightbox)
- Info cards (date, venue, admission, refreshments)
- Map embed (OpenStreetMap iframe)
- Contact footer

### 3. Visual Effect Context
**Responsibility**: WASM brushstroke particle system — completely isolated from content and presentation.

**Interface boundary**: Single `<canvas>` element, three exported functions (`init`, `tick`, `resize`, `destroy`), one dynamic import path.

**Entities**:
```
ParticleSystem {
  particles: Vec<Brushstroke>
  palette: [Color; 8]
  canvasSize: (w, h)
  isMobile: bool
  isPaused: bool
}

Brushstroke {
  position: (x, y)
  velocity: (vx, vy)
  rotation: f64
  dimensions: (length, width)
  opacity: f64
  life: f64
  colorIndex: u8
}
```

### 4. CMS Context
**Responsibility**: Content editing interface for non-technical users.

**Boundary**: `.pages.yml` config maps JSON data files to editing forms. The CMS context is entirely external (pagescms.org) — no code in the repo beyond the config file.

**Integration**: CMS edits → GitHub commit → Actions deploy → live site.

## Context Map

```
┌──────────────────┐     reads JSON      ┌──────────────────────┐
│  Content Context │◄────────────────────│  CMS Context          │
│  (src/data/*.json)│    (commits via     │  (pagescms.org +      │
│                  │     GitHub API)      │   .pages.yml)         │
└────────┬─────────┘                     └──────────────────────┘
         │ fetch + render
         ▼
┌──────────────────┐     <canvas> overlay ┌──────────────────────┐
│  Presentation    │◄────────────────────│  Visual Effect        │
│  Context         │     (progressive     │  Context              │
│  (HTML/CSS/JS)   │      enhancement)    │  (Rust/WASM)          │
└──────────────────┘                     └──────────────────────┘
```

## Anti-Corruption Layer

The CMS Context communicates exclusively through JSON files. If pagescms.org is replaced in future, only `.pages.yml` changes — no site code is affected. The JSON schema IS the contract.

The Visual Effect Context communicates exclusively through a single canvas element and four function exports. The presentation layer never reaches into WASM internals. If the effect is removed, deleting the dynamic import block and canvas element is sufficient.
