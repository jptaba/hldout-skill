---
key: DQ-3
summary: "Links page - new-tab links and HTTP status diagnostic links"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://your-domain.atlassian.net/browse/DQ-3
fetchedAt: 2026-09-27T12:22:01.074Z
---

# DQ-3: Links page - new-tab links and HTTP status diagnostic links

## Description

As a QA trainee practising on the Elements section of the site, I want a **Links** page that shows me both  
ordinary links that open in a new tab and links that call a small HTTP endpoint and tell me what that endpoint  
answered, so that I can learn how link behaviour and HTTP status codes look from the browser and from the API.

The page lives under **Elements > Links** (`/links`). The diagnostic endpoints are plain `GET` endpoints on the  
same host and take no parameters and no authentication.

## Acceptance criteria

```gherkin
Feature: Links page

  Scenario: AC-1 Page layout
    Given I open the Links page
    Then the page heading reads "Links"
    And a section captioned "Following links will open new tab" is shown
    And a section captioned "Following links will send an api call" is shown
    And the api-call section contains exactly these links, in this order:
      | Created | No Content | Moved | Bad Request | Unauthorized | Forbidden | Not Found |
    And no response message is shown before any api-call link has been clicked

  Scenario: AC-2 Static home link opens in a new tab
    Given I am on the Links page
    When I click the link labelled "Home"
    Then the site home page (https://demoqa.com/) opens in a new browser tab
    And the original tab stays on the Links page

  Scenario: AC-3 Dynamic home link
    Given I am on the Links page
    Then the second link in the new-tab section has a label that starts with "Home" followed by a random suffix
    And the suffix is different after the page is reloaded
    When I click that link
    Then the site home page opens in a new browser tab

  Scenario Outline: AC-4 Diagnostic endpoints answer with their status code
    When a client sends GET <path>
    Then the response status is <code> <text>

    Examples:
      | link         | path          | code | text              |
      | Created      | /created      | 201  | Created           |
      | No Content   | /no-content   | 204  | No Content        |
      | Moved        | /moved        | 301  | Moved Permanently |
      | Bad Request  | /bad-request  | 400  | Bad Request       |
      | Unauthorized | /unauthorized | 401  | Unauthorized      |
      | Forbidden    | /forbidden    | 403  | Forbidden         |
      | Not Found    | /not-found    | 404  | Not Found         |

  Scenario: AC-5 Diagnostic responses carry no body
    When a client sends GET to any of the endpoints above except /moved
    Then the response body is empty

  Scenario: AC-6 Moved endpoint tells the client where to go
    When a client sends GET /moved
    Then the response status is 301
    And the response carries a Location header that points to the site home page

  Scenario Outline: AC-7 Clicking a diagnostic link reports the result on the page
    Given I am on the Links page
    When I click the "<link>" link
    Then the message "Link has responded with status <code> and status text <text>" is shown below the links

    Examples:
      | link         | code | text              |
      | Created      | 201  | Created           |
      | No Content   | 204  | No Content        |
      | Moved        | 301  | Moved Permanently |
      | Bad Request  | 400  | Bad Request       |
      | Unauthorized | 401  | Unauthorized      |
      | Forbidden    | 403  | Forbidden         |
      | Not Found    | 404  | Not Found         |

  Scenario: AC-8 The page reports what the endpoint really answered
    Given I am on the Links page
    When I click any diagnostic link
    Then the browser sends one GET request to that link's endpoint
    And the status code shown in the message equals the HTTP status of that request
    And the browser stays on the Links page (no navigation, no new tab)

  Scenario: AC-9 Only the latest result is shown
    Given I have clicked the "Forbidden" link and its message is shown
    When I click the "Created" link
    Then only one response message is shown, and it reports 201 Created
```

## Notes

- No account is needed; everything on this page is public.

## Comments (clarifications from the issue)

**Priya Nair (Product Owner)** — 2026-09-27:

Correction to the AC-4 table: the endpoint behind the **Not Found** link is `/invalid-url`, not `/not-found`.  
`/not-found` was a placeholder from the first draft. Everything else in the table stands, i.e. `GET /invalid-url`  
must answer 404 Not Found, and AC-5 / AC-8 apply to `/invalid-url` as well.


## Attachments

_None_
