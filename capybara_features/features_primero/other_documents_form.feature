#JIRA PRIMERO-413
#JIRA PRIMERO-445
#JIRA PRIMERO-607
#JIRA PRIMERO-635
#JIRA PRIMERO-775

@javascript @primero
Feature: Other documents form
  As a social user I want to upload documents that are not photos or audio files and enter a description of the document.

  Scenario: I upload an executable file
    Given I am logged in as a social worker with username "primero_cp" and password "primero"
    When I access "cases page"
    And I press the "New Case" button
    And I press the "Other Documents" button
    Then I attach a document "capybara_features/resources/exe_file.exe" for "child"
    And I should see "Executable files are not allowed." on the page
    Then I attach a document "capybara_features/resources/EXE_FILE_2.EXE" for "child"
    And I should see "Executable files are not allowed." on the page

  Scenario: I upload a document file with the incorrect size
    Given I am logged in as a social worker with username "primero_cp" and password "primero"
    When I access "cases page"
    And I press the "New Case" button
    And I press the "Other Documents" button
    Then I attach a document "capybara_features/resources/huge.jpg" for "child"
    And I should see "Please upload a document smaller than 10mb" on the page

  Scenario: Uploading multiple documents
    Given I am logged in as a social worker with username "primero_cp" and password "primero"
    When I access "cases page"
    And I press the "New Case" button
    And I click the "Other Documents" link
    And I attach the following documents for "child":
      |capybara_features/resources/jorge.jpg|Document 1 (jorge.jpg)|
      |capybara_features/resources/jeff.png |Document 2 (jeff.png) |
    Then I press "Save"
    And I should see "Case record successfully created"
    And I click the "Other Documents" link
    And I should not see "Click the EDIT button to add Other Documents"
    And I should see documents on the show page:
      |jorge.jpg|Document 1 (jorge.jpg)|
      |jeff.png |Document 2 (jeff.png) |
    And I follow "Edit"
    And I click the "Other Documents" link
    And I should see "jorge.jpg" on the page
    And I should see "jeff.png" on the page

  Scenario: Uploading more documents than allowed
    Given I am logged in as a social worker with username "primero_cp" and password "primero"
    When I access "cases page"
    And I press the "New Case" button
    And I click the "Other Documents" link
    And I attach the following documents for "child":
      |capybara_features/resources/jorge.jpg|Document 1 |
      |capybara_features/resources/jeff.png |Document 2 |
      |capybara_features/resources/jorge.jpg|Document 3 |
      |capybara_features/resources/jeff.png |Document 4 |
      |capybara_features/resources/jorge.jpg|Document 5 |
      |capybara_features/resources/jeff.png |Document 6 |
      |capybara_features/resources/jorge.jpg|Document 7 |
      |capybara_features/resources/jeff.png |Document 8 |
      |capybara_features/resources/jorge.jpg|Document 9 |
      |capybara_features/resources/jeff.png |Document 10|
    And I should not see "Add another document" on the page

  Scenario Outline: Editing document description and deleting documents
    Given I am logged in as a social worker with username <user> and password "primero"
    When I access <page>
    And I press the <button> button
    And I click the "Other Documents" link
    And I attach the following documents for <model>:
      |capybara_features/resources/jorge.jpg|Document 1 |
      |capybara_features/resources/jeff.png |Document 2 |
      |capybara_features/resources/jorge.jpg|Document 3 |
      |capybara_features/resources/jeff.png |Document 4 |
      |capybara_features/resources/jorge.jpg|Document 5 |
      |capybara_features/resources/jeff.png |Document 6 |
      |capybara_features/resources/jorge.jpg|Document 7 |
      |capybara_features/resources/jeff.png |Document 8 |
      |capybara_features/resources/jorge.jpg|Document 9 |
      |capybara_features/resources/jeff.png |Document 10|
    Then I press "Save"
    And I should see <created_message>
    And I click the "Other Documents" link
    And I should see documents on the show page:
      |jorge.jpg|Document 1 |
      |jeff.png |Document 2 |
      |jorge.jpg|Document 3 |
      |jeff.png |Document 4 |
      |jorge.jpg|Document 5 |
      |jeff.png |Document 6 |
      |jorge.jpg|Document 7 |
      |jeff.png |Document 8 |
      |jorge.jpg|Document 9 |
      |jeff.png |Document 10|
    And I follow "Edit"
    And I update the document description for the 1st document with "Jorge's document"
    And I update the document description for the 10th document with "Jeff's document"
    And I check for delete the 2nd document
    And I press "Save"
    And I should see <updated_message> on the page
    And I should see documents on the show page:
      |jorge.jpg|Jorge's document|
      |jorge.jpg|Document 3      |
      |jeff.png |Document 4      |
      |jorge.jpg|Document 5      |
      |jeff.png |Document 6      |
      |jorge.jpg|Document 7      |
      |jeff.png |Document 8      |
      |jorge.jpg|Document 9      |
      |jeff.png |Jeff's document |
    
    Examples:
      | page           | user          | button         | model      | created_message                        | updated_message                      |
      | cases page     | "primero_cp"  | "New Case"     | "child"    | "Case record successfully created"     | "Case was successfully updated."     |
      | cases page     | "primero_gbv" | "New Case"     | "child"    | "Case record successfully created"     | "Case was successfully updated."     |
      | incidents page | "primero_mrm" | "New Incident" | "incident" | "Incident record successfully created" | "Incident was successfully updated." |