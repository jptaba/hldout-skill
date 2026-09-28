---
key: DQ-2
summary: "Personal book collection - browse the catalogue and manage my books"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://your-domain.atlassian.net/browse/DQ-2
fetchedAt: 2026-09-28T19:15:32.253Z
---

# DQ-2: Personal book collection - browse the catalogue and manage my books

## Description

**As a** signed-in reader  
**I want** to browse and search the Book Store catalogue and keep my own collection of books  
**so that** I can see the books I am interested in on my profile.

## Context

The catalogue is shown on the Book Store page (`/books`); a signed-in user sees their own collection on the  
Profile page (`/profile`). Clients manage the collection through the Book Store API; the endpoints, payloads and  
error responses are specified in the attached **api-contract.md**.

## Accounts and data

- User creation is switched off in the QA environment. Tests use the QA team's pre-provisioned test users (user names and passwords are kept in the team's secret store, never in the test code). Do not create or delete users.
- These users are shared by every run, so each test leaves the collection of every user it used empty.
- A token for API calls is obtained with `POST /Account/v1/GenerateToken` (see the contract).
- Books used in the examples are part of the standard catalogue, e.g. 9781449325862 "Git Pocket Guide", 9781593277574 "Understanding ECMAScript 6", 9781449331818 "Learning JavaScript Design Patterns".

## Acceptance criteria

| ID | Criterion | Layer |
| --- | --- | --- |
| AC-1 | `GET /BookStore/v1/Books` returns **200** with a `books` list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website). | API |
| AC-2 | Looking up one book with `GET /BookStore/v1/Book?ISBN=<isbn>` returns **200** with the same data as that book's entry in the catalogue. | API |
| AC-3 | The Book Store page `/books` lists every book returned by the catalogue API, each with its title, author and publisher. | UI + API |
| AC-4 | The search box on `/books` (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list. | UI |
| AC-5 | Clicking a book title on `/books` opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue. | UI |
| AC-6 | Adding books to a user's collection with `POST /BookStore/v1/Books` returns **201** and echoes the added ISBNs; `GET /Account/v1/User/{UUID}` then lists those books in the user's `books`. | API |
| AC-7 | A book added through the API appears on the Profile page after the user signs in on `/login`, with its title, author and publisher. | UI + API |
| AC-8 | Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once. | API |
| AC-9 | On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others. | UI + API |
| AC-10 | `DELETE /BookStore/v1/Book` removes one book from the collection and returns **204**; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract. | API |
| AC-11 | An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (`GET /BookStore/v1/Book`) and when adding it to a collection; nothing is added. | API |
| AC-12 | Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token. | API |

## Attachments

| File | MIME | Bytes | How to read | Local path |
| --- | --- | --- | --- | --- |
| api-contract.md | text/markdown | 2567 | text — read directly | attachments/api-contract.md |
