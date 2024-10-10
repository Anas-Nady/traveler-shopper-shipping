export const emailVerificationTemplate = (
  username: string,
  verificationCode: string
): string => {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ccc;
      background-color: #fff;
      border-radius: 10px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Account Verification</h2>
    </div>
    <div class="content">
      <p>
        Dear ${username},
      </p>
      <p>
        Your verification code is: <strong>${verificationCode}</strong>
      </p>
      <p>
        Please enter this code to verify your account.
      </p>
    </div>
    <div class="footer">
      &copy; 2024 Our Company. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;
};
