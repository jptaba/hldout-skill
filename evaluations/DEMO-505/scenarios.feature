# Source: DEMO-505 — Practice portal — hovers, number input and notifications
# Attachments used: none
#
# Acceptance criteria (verbatim):
# AC-1: On the Hovers page (/hovers), hovering over a user's avatar reveals that user's caption, "name: user<N>" for the N-th avatar, and a "View profile" link.
# AC-2: On the Inputs page (/inputs), the number field accepts digits (typing 42 leaves the value 42), and non-numeric characters cannot be entered (typing abc leaves the field empty).
# AC-3: On the Notification Message page (/notification_message_rendered), clicking "Click here" shows an appropriate notification to the user.
#
# ASSUMPTION: AC-3 "appropriate" is not defined anywhere (no approved copy for this story). Tested literally: exactly one non-empty notification appears. Tagged @needs-clarification.
# OPEN-QUESTION: Should notifications dismiss themselves automatically after a few seconds? (story "Open questions": Content/PO to decide; not tested.)

@story:DEMO-505
Feature: Practice portal — hovers, number input and notifications

  # from story AC-1
  @SCN-001 @AC-1 @priority:P2 @type:functional @layer:ui
  Scenario Outline: Hovering an avatar reveals that user's caption
    Given I am on the Hovers page
    When I hover over avatar <n>
    Then I see "name: user<n>" and a "View profile" link

    Examples:
      | n |
      | 1 |
      | 2 |
      | 3 |

  # from story AC-2
  @SCN-002 @AC-2 @priority:P2 @type:functional @layer:ui
  Scenario: The number field accepts digits
    Given I am on the Inputs page
    When I type "42" into the number field
    Then the field value is "42"

  # from story AC-2
  @SCN-003 @AC-2 @priority:P2 @type:negative @layer:ui
  Scenario: The number field rejects non-numeric characters
    Given I am on the Inputs page
    When I type "abc" into the number field
    Then the field is empty

  # from story AC-3
  @SCN-004 @AC-3 @priority:P3 @type:functional @layer:ui @needs-clarification
  Scenario: Clicking "Click here" shows a notification
    Given I am on the Notification Message page
    When I click "Click here"
    Then exactly one non-empty notification is shown
