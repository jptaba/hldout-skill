# Evidence pack — DQ-3

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DQ-3
  L3   | summary: "Links page - new-tab links and HTTP status diagnostic links"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DQ-3
  L10  | fetchedAt: 2026-09-27T12:22:01.074Z
  L11  | ---
  L12  | 
  L13  | # DQ-3: Links page - new-tab links and HTTP status diagnostic links
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | As a QA trainee practising on the Elements section of the site, I want a **Links** page that shows me both  
● L18  | ordinary links that open in a new tab and links that call a small HTTP endpoint and tell me what that endpoint  
● L19  | answered, so that I can learn how link behaviour and HTTP status codes look from the browser and from the API.
  L20  | 
● L21  | The page lives under **Elements > Links** (`/links`). The diagnostic endpoints are plain `GET` endpoints on the  
● L22  | same host and take no parameters and no authentication.
  L23  | 
  L24  | ## Acceptance criteria
  L25  | 
● L26  | ```gherkin
● L27  | Feature: Links page
  L28  | 
● L29  |   Scenario: AC-1 Page layout
● L30  |     Given I open the Links page
● L31  |     Then the page heading reads "Links"
● L32  |     And a section captioned "Following links will open new tab" is shown
● L33  |     And a section captioned "Following links will send an api call" is shown
● L34  |     And the api-call section contains exactly these links, in this order:
● L35  |       | Created | No Content | Moved | Bad Request | Unauthorized | Forbidden | Not Found |
● L36  |     And no response message is shown before any api-call link has been clicked
  L37  | 
● L38  |   Scenario: AC-2 Static home link opens in a new tab
● L39  |     Given I am on the Links page
● L40  |     When I click the link labelled "Home"
● L41  |     Then the site home page (https://demoqa.com/) opens in a new browser tab
● L42  |     And the original tab stays on the Links page
  L43  | 
● L44  |   Scenario: AC-3 Dynamic home link
● L45  |     Given I am on the Links page
● L46  |     Then the second link in the new-tab section has a label that starts with "Home" followed by a random suffix
● L47  |     And the suffix is different after the page is reloaded
● L48  |     When I click that link
● L49  |     Then the site home page opens in a new browser tab
  L50  | 
● L51  |   Scenario Outline: AC-4 Diagnostic endpoints answer with their status code
● L52  |     When a client sends GET <path>
● L53  |     Then the response status is <code> <text>
  L54  | 
● L55  |     Examples:
● L56  |       | link         | path          | code | text              |
● L57  |       | Created      | /created      | 201  | Created           |
● L58  |       | No Content   | /no-content   | 204  | No Content        |
● L59  |       | Moved        | /moved        | 301  | Moved Permanently |
● L60  |       | Bad Request  | /bad-request  | 400  | Bad Request       |
● L61  |       | Unauthorized | /unauthorized | 401  | Unauthorized      |
● L62  |       | Forbidden    | /forbidden    | 403  | Forbidden         |
● L63  |       | Not Found    | /not-found    | 404  | Not Found         |
  L64  | 
● L65  |   Scenario: AC-5 Diagnostic responses carry no body
● L66  |     When a client sends GET to any of the endpoints above except /moved
● L67  |     Then the response body is empty
  L68  | 
● L69  |   Scenario: AC-6 Moved endpoint tells the client where to go
● L70  |     When a client sends GET /moved
● L71  |     Then the response status is 301
● L72  |     And the response carries a Location header that points to the site home page
  L73  | 
● L74  |   Scenario Outline: AC-7 Clicking a diagnostic link reports the result on the page
● L75  |     Given I am on the Links page
● L76  |     When I click the "<link>" link
● L77  |     Then the message "Link has responded with status <code> and status text <text>" is shown below the links
  L78  | 
● L79  |     Examples:
● L80  |       | link         | code | text              |
● L81  |       | Created      | 201  | Created           |
● L82  |       | No Content   | 204  | No Content        |
● L83  |       | Moved        | 301  | Moved Permanently |
● L84  |       | Bad Request  | 400  | Bad Request       |
● L85  |       | Unauthorized | 401  | Unauthorized      |
● L86  |       | Forbidden    | 403  | Forbidden         |
● L87  |       | Not Found    | 404  | Not Found         |
  L88  | 
● L89  |   Scenario: AC-8 The page reports what the endpoint really answered
● L90  |     Given I am on the Links page
● L91  |     When I click any diagnostic link
● L92  |     Then the browser sends one GET request to that link's endpoint
● L93  |     And the status code shown in the message equals the HTTP status of that request
● L94  |     And the browser stays on the Links page (no navigation, no new tab)
  L95  | 
● L96  |   Scenario: AC-9 Only the latest result is shown
● L97  |     Given I have clicked the "Forbidden" link and its message is shown
● L98  |     When I click the "Created" link
● L99  |     Then only one response message is shown, and it reports 201 Created
● L100 | ```
  L101 | 
  L102 | ## Notes
  L103 | 
● L104 | - No account is needed; everything on this page is public.
  L105 | 
  L106 | ## Comments (clarifications from the issue)
  L107 | 
  L108 | **Priya Nair (Product Owner)** — 2026-09-27:
  L109 | 
● L110 | Correction to the AC-4 table: the endpoint behind the **Not Found** link is `/invalid-url`, not `/not-found`.  
● L111 | `/not-found` was a placeholder from the first draft. Everything else in the table stands, i.e. `GET /invalid-url`  
● L112 | must answer 404 Not Found, and AC-5 / AC-8 apply to `/invalid-url` as well.
  L113 | 
  L114 | 
  L115 | ## Attachments
  L116 | 
  L117 | _None_
  L118 | 
```
