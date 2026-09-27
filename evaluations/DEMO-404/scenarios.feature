# Source: DEMO-404 — Practice portal — sign-in and interactive widgets
# Attachments used: ux-copy.md (all messages), test-accounts.csv (training account)
#
# Acceptance criteria (verbatim):
# AC-1: On the Login page (/login), signing in with the training account from test-accounts.csv opens the Secure Area (/secure), with the heading "Secure Area" and the message "You logged into a secure area!".
# AC-2: An unknown username shows "Your username is invalid!"; a known username with a wrong password shows "Your password is invalid!". In both cases the user stays on the Login page.
# AC-3: Logging out returns to the Login page with "You logged out of the secure area!". Opening /secure while signed out shows the Login page with "You must login to view the secure area!".
# AC-4: On the Checkboxes page (/checkboxes), checkbox 1 is initially unchecked and checkbox 2 is initially checked. Clicking a checkbox toggles it.
# AC-5: On the Dropdown page (/dropdown), the options are "Please select an option" (preselected and not selectable), "Option 1" and "Option 2". Choosing "Option 2" makes it the selected option.
# AC-6: On Dynamic Loading example 2 (/dynamic_loading/2), after pressing "Start" the text "Hello World!" is rendered within 10 seconds.
# AC-7: On the JavaScript Alerts page (/javascript_alerts), accepting the JS Alert shows "You successfully clicked an alert". Dismissing the JS Confirm shows "You clicked: Cancel". Entering text in the JS Prompt and accepting it shows "You entered: <text>".
# AC-8: On the Data Tables page (/tables), clicking the "Last Name" header of the first table once sorts its rows by last name, ascending.
# AC-9: On Add/Remove Elements (/add_remove_elements/), each press of "Add Element" adds one "Delete" button. Each press of a "Delete" button removes that button.
# AC-10: On Key Presses (/key_presses), pressing a key while the input is focused shows "You entered: <KEY>" (for example TAB for the Tab key, A for A).
#
# ASSUMPTION: Messages may carry a trailing close icon (ux-copy.md), so messages are asserted with "contains".

@story:DEMO-404
Feature: Practice portal — sign-in and interactive widgets

  # from story AC-1, ux-copy.md, test-accounts.csv
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: The trainee signs in to the Secure Area
    Given I am on the Login page
    When I sign in with the training account
    Then I am on the Secure Area with the heading "Secure Area"
    And I see "You logged into a secure area!"

  # from story AC-2, ux-copy.md
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:ui
  Scenario Outline: Wrong credentials are refused with a specific message
    Given I am on the Login page
    When I sign in with <credentials>
    Then I see "<message>"
    And I am still on the Login page

    Examples:
      | credentials                       | message                    |
      | an unknown username               | Your username is invalid!  |
      | the trainee with a wrong password | Your password is invalid!  |

  # from story AC-3, ux-copy.md
  @SCN-003 @AC-3 @priority:P1 @type:functional @layer:ui
  Scenario: Logging out returns to the Login page
    Given I am signed in as the trainee
    When I log out
    Then I am on the Login page
    And I see "You logged out of the secure area!"

  # from story AC-3, ux-copy.md
  @SCN-004 @AC-3 @priority:P1 @type:security @layer:ui
  Scenario: The Secure Area is not reachable while signed out
    Given I am not signed in
    When I open /secure
    Then I am on the Login page
    And I see "You must login to view the secure area!"

  # from story AC-4
  @SCN-005 @AC-4 @priority:P2 @type:functional @layer:ui
  Scenario: Checkboxes start in the documented state and toggle
    Given I am on the Checkboxes page
    Then checkbox 1 is unchecked and checkbox 2 is checked
    When I click both checkboxes
    Then checkbox 1 is checked and checkbox 2 is unchecked

  # from story AC-5
  @SCN-006 @AC-5 @priority:P2 @type:functional @layer:ui
  Scenario: The dropdown offers the documented options
    Given I am on the Dropdown page
    Then the options are "Please select an option", "Option 1" and "Option 2"
    And "Please select an option" is preselected and cannot be selected
    When I choose "Option 2"
    Then "Option 2" is the selected option

  # from story AC-6, ux-copy.md
  @SCN-007 @AC-6 @priority:P2 @type:functional @layer:ui
  Scenario: Dynamically loaded content appears within 10 seconds
    Given I am on Dynamic Loading example 2
    When I press "Start"
    Then "Hello World!" is rendered within 10 seconds

  # from story AC-7, ux-copy.md
  @SCN-008 @AC-7 @priority:P2 @type:functional @layer:ui
  Scenario Outline: JavaScript dialogs report the user's choice
    Given I am on the JavaScript Alerts page
    When I <action>
    Then I see "<result>"

    Examples:
      | action                                   | result                            |
      | accept the JS Alert                      | You successfully clicked an alert |
      | dismiss the JS Confirm                   | You clicked: Cancel               |
      | enter "held out" in the JS Prompt and accept | You entered: held out         |

  # from story AC-8
  @SCN-009 @AC-8 @priority:P2 @type:functional @layer:ui
  Scenario: One click on "Last Name" sorts the first table ascending
    Given I am on the Data Tables page
    When I click the "Last Name" header of the first table once
    Then its rows are sorted by last name, ascending

  # from story AC-9
  @SCN-010 @AC-9 @priority:P3 @type:functional @layer:ui
  Scenario: Elements are added and removed one at a time
    Given I am on the Add/Remove Elements page
    When I press "Add Element" 3 times
    Then there are 3 "Delete" buttons
    When I press one "Delete" button
    Then there are 2 "Delete" buttons

  # from story AC-10, ux-copy.md
  @SCN-011 @AC-10 @priority:P3 @type:functional @layer:ui
  Scenario Outline: Key presses are reported
    Given I am on the Key Presses page
    When I press <key> in the input
    Then I see "You entered: <shown>"

    Examples:
      | key | shown |
      | Tab | TAB   |
      | A   | A     |
