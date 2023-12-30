# Email Verification for Contacts API

Overview
This project aims to implement email verification functionality for a collection of contacts through a REST API. It integrates SendGrid for sending verification emails to users upon registration.

Verification Process
Upon registration, users receive an email to verify their email address. Clicking the verification link confirms the email, triggering responses based on the link's status.

Verification Steps:
SendGrid Integration:

Register and set up an email sender on SendGrid.
Create an API access token and add it to the project's .env file.
Create Endpoint for Verification:

Add fields verificationToken and verify to the User model.
Create a GET /users/verify/:verificationToken endpoint to search and verify users.
Email Creation for Verification:

Generate a verificationToken for new users during registration.
Send an email to the user's provided email address with a verification link.
Resending Verification Email:

Implement a POST /users/verify/ endpoint to resend verification emails.
Handle scenarios where users might accidentally delete or not receive the initial verification email.
Steps to Setup
SendGrid Integration:

Register and configure an email sender on SendGrid.
Create an API access token and add it to the project's .env file.
Implement Verification Process:

Create required endpoints as mentioned in the documentation.
Update the User model to include verification fields.
Usage:

Clone the repository: git clone <repository_url>
Install dependencies: npm install
Start the server: npm start
Testing:

Use tools like Postman to test the endpoints.
Additional Notes
Ensure to replace <repository_url> with the actual URL of the repository.
Consider using uuid or nanoid for generating verification tokens.
Optionally, you can explore using nodemailer as an alternative to SendGrid.
Optional Task - Dockerfile
As an additional task, consider creating a Dockerfile for containerizing the application.
