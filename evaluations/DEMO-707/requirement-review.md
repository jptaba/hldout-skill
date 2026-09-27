# Requirement review — DEMO-707

Built on the requirement contract ([requirement-contract.md](requirement-contract.md)): 19 ACs quoted from `story.md`, 15 endpoints and the error model from `api-contract.md`, and 5 gaps. The UI was inspected for mechanics only (G2, G3). No expected outcome was taken from the AUT.

## Testability decisions

| Topic | Decision |
| --- | --- |
| "Any reader", "every reader" (AC-10, AC-14) | Checked as a **different** signed-in user and as an anonymous caller, never only as the author. The context says all published content is public. |
| AC-15 "anyone else" | The article's author, who is not the comment's author, tries the delete. "The comment remains" is checked by the commenter. |
| AC-16 idempotency | The same reader favourites twice in a row. The count after the second call must equal the count after the first. |
| AC-11 boundaries | limit 1 and 100 are accepted. limit 0 and 101 → 422. `offset` is checked by comparing `limit=1&offset=1` with the second item of `limit=2`. |
| AC-8 "unchanged" | GET after the refused PUT and DELETE: the title is as created and the article still exists. |
| AC-2 | Taken **email** and taken **username** are checked separately. The `errors` object must name the field. |
| Users | Seeded via `POST /api/users`: shared per worker for writer and readers (`seed.once`, not the subject), fresh ones where registration or login is the subject. Users can't be deleted (story), so each gets a unique `qa…` name. |
| Articles | Seeded with the documented `{"article": …}` envelope and deleted afterwards by the owner (404 = already gone). |
| AC-17/18 UI | Start on `/login` (G2). AC-18 opens the editor from the "New Article" link (G3), since that link is how the AC names it. |

## Gaps (see the contract for the ladder)

| Gap | Handling |
| --- | --- |
| G1 API origin | From the AUT profile |
| G2 / G3 UI routes and fields | Discovered by inspection (mechanics) |
| G4 "moments ago" | **Assumption:** visible within 10 s (polled). The PO should confirm. |
| G5 invalid offset status | **Open question:** not tested |
