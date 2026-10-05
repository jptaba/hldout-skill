---
key: TOOL-4
summary: "Favourites for signed-in customers"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://jira.example.com/browse/TOOL-4
fetchedAt: 2026-10-05T12:13:33.169Z
---

# TOOL-4: Favourites for signed-in customers

## Description

Signed-in customers can keep a personal list of favourite products, from the product page (web shop) and through the API (mobile app).

*Technical notes:* the favourites API is defined on the [Favourites API|https://confluence.example.com/pages/viewpage.action?pageId=880001] page.

## Acceptance criteria (custom field)

- AC-1: A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id).
- AC-2: Adding a product that is already a favourite is rejected and the list still contains it once.
- AC-3: GET /favorites lists the customer's own favourites only; another customer's favourites are never included.
- AC-4: Every favourites endpoint responds 401 without a valid token.
- AC-5: On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account.
- AC-6: DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites.

## Linked pages

| Page | Link | Status | Local path |
| --- | --- | --- | --- |
| Favourites API | https://confluence.example.com/pages/viewpage.action?pageId=880001 | read | linked/confluence-880001-favourites-api.md |

## Screenshots

_None_
