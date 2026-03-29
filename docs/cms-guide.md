# Content Management Guide

This guide is for art show committee members who need to update the website. You do not need any technical knowledge — all editing happens through a web form.

## What You Can Edit

| Content | What It Controls |
|---------|-----------------|
| **Event Details** | Event name, dates, times, admission info, description, venue, contact details, refreshments text, exhibitor note |
| **Gallery** | Artwork images, titles, artist names, medium, category |

## Getting Started

### One-Time Setup

1. You need a **GitHub account** (free). If you don't have one, create one at [github.com/signup](https://github.com/signup)
2. Ask a team member to add you as a collaborator on the repository

### Editing Content

1. Go to **[pagescms.org](https://pagescms.org)**
2. Click **Sign in with GitHub** and authorise the app
3. Select the **eskdale-website** repository from the list
4. You will see two collections: **Event Details** and **Gallery**

## Editing Event Details

Click **Event Details** to see a form with these fields:

| Field | What It Does | Example |
|-------|-------------|---------|
| Event Name | The main title shown on the page | The Eskdale Art Show |
| Edition | The year/edition label above the title | 31st Annual |
| Tagline | Subtitle text | A Great Day Out For All The Family |
| Display Dates | How dates appear to visitors | Saturday 23rd – Monday 25th May 2026 |
| Start Date | First day of the show (calendar picker) | 2026-05-23 |
| End Date | Last day of the show (calendar picker) | 2026-05-25 |
| Opening Times | Daily hours | 10:00 – 16:30 daily |
| Admission Info | Shown in the badge on the hero | Free Admission & Parking |
| About Description | The welcome paragraph below the hero | Discover paintings, photographs... |
| Refreshments Text | Text for the refreshments section | Delicious home-made refreshments... |
| Exhibitor Note | Text in the "Interested in Exhibiting?" box | Contact us by email or phone... |
| Phone Number | Committee phone number | 019467 23259 |
| Email Address | Committee email | eskdaleartshow@st-begas.cumbria.sch.uk |
| Facebook URL | Full Facebook page URL | https://www.facebook.com/EskdaleArtshow |
| Twitter URL | Full Twitter profile URL | https://twitter.com/eskdaleart |

After making changes, click **Save**. The website will update automatically within 2 minutes.

## Managing the Gallery

Click **Gallery** to see the list of gallery items. Each item has:

| Field | What It Does | Example |
|-------|-------------|---------|
| ID | A unique identifier (short, no spaces) | 007 |
| Image | Upload or select an artwork photo | (drag and drop an image) |
| Title | Name of the artwork | Scafell at Sunrise |
| Artist | Artist's name | Jane Smith |
| Medium | Materials/technique | Oil on canvas |
| Category | Type of work (dropdown) | Paintings |
| Description | Brief description (optional) | View from Hardknott Pass |

### Adding a New Gallery Item

1. Click the **+** button or **Add item**
2. Fill in the fields above
3. For the image: click the image field and either drag-and-drop a photo or click to browse your computer
4. Click **Save**

### Image Guidelines

- **Format**: JPG or PNG (the site displays them as-is)
- **Size**: Aim for around 800–1200px on the longest edge. Very large files (5MB+) will slow the site down
- **Orientation**: Both landscape and portrait work — the gallery adapts automatically
- **Content**: Photos of the actual artwork, well-lit, minimal background

### Removing a Gallery Item

1. Click the item you want to remove
2. Click **Delete** or the bin/trash icon
3. Click **Save**

### Reordering

Items appear on the site in the order they appear in the list. Drag items up or down to reorder them.

## Updating Posters

The three event posters in the carousel are image files, not managed through the CMS. To replace a poster, ask a developer to swap the file in `src/assets/images/` and push the change. The current posters are:

- `poster-vintage.webp` — Painted village scene
- `poster-watercolour.webp` — Watercolour forest design
- `poster-artists.webp` — Call for artists

## How Changes Go Live

When you click **Save** in Pages CMS:

1. The CMS creates a commit in the GitHub repository (like saving a version)
2. GitHub Actions automatically builds and deploys the updated site
3. The live site at **eskdaleartshow.com** updates within ~2 minutes

You can check the status at: [github.com/DreamLab-AI/eskdale-website/actions](https://github.com/DreamLab-AI/eskdale-website/actions)

A green tick means the deployment succeeded. A red cross means something went wrong — ask a developer to investigate.

## Preparing for Next Year

When it's time to update the site for the next show:

1. Open **Event Details** in Pages CMS
2. Update the **Edition** (e.g., "32nd Annual")
3. Update the **Start Date** and **End Date** to the new show dates
4. Update the **Display Dates** text to match
5. Update the **About Description** if needed
6. Clear the gallery and add new artwork photos, or keep favourites from the previous year
7. Save — the site updates automatically

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see the repository in Pages CMS | Ask a team member to add you as a collaborator on GitHub |
| Changes aren't appearing on the site | Wait 2 minutes, then hard-refresh the page (Ctrl+Shift+R). Check the [Actions tab](https://github.com/DreamLab-AI/eskdale-website/actions) for errors |
| Image upload fails | Check the file is JPG or PNG and under 10MB. Try a smaller image |
| Pages CMS won't load | Try a different browser, or clear your browser cache. The CMS works best in Chrome or Firefox |
| Need to undo a change | Every change is saved as a version in GitHub. Ask a developer to revert the commit |

## Getting Help

- **Website issues**: Open an issue at [github.com/DreamLab-AI/eskdale-website/issues](https://github.com/DreamLab-AI/eskdale-website/issues)
- **CMS questions**: Pages CMS documentation at [pagescms.org/docs](https://pagescms.org/docs)
- **General art show enquiries**: eskdaleartshow@st-begas.cumbria.sch.uk
