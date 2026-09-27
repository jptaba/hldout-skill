# Source: DEMO-606 — Practice portal — notification copy
# Attachments used: ux-copy.md (approved success / failure messages)
#
# Acceptance criteria (verbatim):
# AC-1: On the Notification Message page (/notification_message_rendered), each click on "Click here" shows exactly one notification, and its text is one of the approved messages in ux-copy.md.
# AC-2: Across repeated clicks, both outcomes (success and failure) can occur.
#
# ASSUMPTION: The outcome is random per request, so one click cannot prove AC-1/AC-2. The scenario samples 12 clicks: if each outcome has probability ≥ 0.25, the chance of never seeing one of them is ≤ 0.75^12 ≈ 3%, and for the ~50/50 split this story implies it is ≈ 0.02%.
# ASSUMPTION: For AC-2 an outcome is recognised by its meaning (a success message vs a failure message, judged by its opening words), so an off-copy failure message still counts as the failure outcome. Copy correctness is AC-1's concern (one root cause, one failure).

@story:DEMO-606
Feature: Practice portal — notification copy

  # from story AC-1, ux-copy.md
  @SCN-001 @AC-1 @priority:P2 @type:functional @layer:ui
  Scenario: Every notification uses approved copy
    Given I am on the Notification Message page
    When I click "Click here" 12 times, reading the notification after each click
    Then each click showed exactly one notification
    And every notification text is one of the approved messages

  # from story AC-2, ux-copy.md
  @SCN-002 @AC-2 @priority:P3 @type:functional @layer:ui
  Scenario: Both outcomes occur across repeated clicks
    Given I am on the Notification Message page
    When I click "Click here" 12 times, noting each outcome
    Then both a success and a failure outcome were observed
