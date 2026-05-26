# Social feed placeholder images

Add **5 images** for the homepage social carousel:

| File       | Used for   |
| ---------- | ---------- |
| `01.jpg`   | Post 1 (Facebook) |
| `02.jpg`   | Post 2 (Instagram) |
| `03.jpg`   | Post 3 (Facebook) |
| `04.jpg`   | Post 4 (Instagram) |
| `05.jpg`   | Post 5 (Facebook) |

Recommended size: **1200×630** (or 4:5 / square — cards crop with `object-cover`).

Until these files exist, the site uses temporary fallback photos from `/images/hero/`.

When the live API is ready, set in `.env.local`:

```
NEXT_PUBLIC_SOCIAL_FEED_MODE=live
```
